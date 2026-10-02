"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useCameraScanner } from "@/components/scanner/useCameraScanner";
import { track } from "@/lib/analytics";
import { isLoadError } from "@/lib/errors";
import { formatsFor, normaliseResult, type NormalisedResult } from "@/lib/scanner/formats";
import { useScanHistory } from "@/lib/scanner/history";
import { IMAGE_ACCEPT, ImageInputError, readImageFile, toImageData } from "@/lib/scanner/image";
import { maskSecrets } from "@/lib/scanner/parse";
import { decodeImageData } from "@/lib/scanner/zxing";

/**
 * Quick scanner for the homepage, laid out like the QR Code and Barcode tabs:
 * the scan result goes in the field on the left, the camera is the square preview on the right.
 * Uses the same camera logic and decoder as the scanner page; loaded only when its tab opens.
 */
export default function QuickScan() {
  const id = useId();
  const history = useScanHistory();
  const fileRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<NormalisedResult | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  const [reveal, setReveal] = useState(false);

  const onCamera = useCallback((r: NormalisedResult) => {
    setResult(r); setMessage(null); setReveal(false);
    history.add({ format: r.formatLabel, value: r.value, source: "camera" });
  }, [history]);
  const cam = useCameraScanner("all", onCamera);

  // This panel only mounts when the visitor selects the Scan Code tab, so start the camera right away.
  useEffect(() => { void cam.start(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onFile = async (file: File | undefined | null) => {
    if (!file) return;
    if (cam.live) cam.pause();
    setWorking(true); setMessage(null);
    let bitmap: ImageBitmap | null = null;
    try {
      bitmap = await readImageFile(file);
      const passes = [1600, 3200].filter((side, i) => i === 0 || Math.max(bitmap!.width, bitmap!.height) > 1600);
      let found: NormalisedResult[] = [];
      for (const side of passes) {
        const { data } = toImageData(bitmap, bitmap.width, bitmap.height, side);
        const res = await decodeImageData(data, { formats: formatsFor("all"), tryHarder: true, tryRotate: true, tryInvert: true, tryDownscale: true, maxNumberOfSymbols: 1 });
        found = res.map((r) => normaliseResult(r.format, r.text));
        if (found.length) break;
      }
      if (found.length) {
        setResult(found[0]); setReveal(false);
        history.add({ format: found[0].formatLabel, value: found[0].value, source: "image" });
        track("decoder_used", { success: true });
      } else {
        setResult(null);
        setMessage("No QR code or barcode was found in that image.");
        track("decoder_used", { success: false });
      }
    } catch (e) {
      setResult(null);
      setMessage(
        e instanceof ImageInputError ? e.message
          : isLoadError(e) || (e instanceof Error && /wasm|WebAssembly/i.test(e.message)) ? "The decoder couldn't load. Check your connection and reload the page."
          : "This image couldn't be decoded. Try a different image.",
      );
    } finally {
      bitmap?.close();
      if (fileRef.current) fileRef.current.value = "";
      setWorking(false);
    }
  };

  // WiFi passwords stay hidden unless the visitor chooses to show them (same masking as the scan history).
  const masked = result ? maskSecrets(result.value) : "";
  const hasSecret = !!result && masked !== result.value;
  const shown = result ? (hasSecret && !reveal ? masked : result.value) : "";

  const problem = cam.error ?? message;
  const hint = problem
    ?? (result ? (hasSecret && !reveal ? "The password is hidden." : "")
    : cam.phase === "starting" ? "Starting camera… allow camera access if your browser asks."
    : cam.phase === "scanning" ? "Looking for a code…"
    : cam.phase === "paused" ? "Press Resume camera to keep scanning."
    : "Point your camera at a QR code or barcode.");
  const startLabel = cam.phase === "found" ? "Scan again" : cam.phase === "error" ? "Try again" : "Resume camera";
  const offText = cam.phase === "paused" ? "Camera paused." : cam.phase === "error" ? "Camera unavailable." : "Camera is off.";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_200px] sm:items-center sm:gap-x-6">
      {/* On phones this wrapper dissolves so the label, camera and field can be ordered: label, camera, field. */}
      <div className="contents sm:block">
        <label htmlFor={`${id}-result`} className="label order-1">Scan a QR code or barcode</label>
        <div className="order-3">
        <div className="flex min-h-11 w-full items-center gap-2 rounded-lg border border-line-2 bg-ink-2 px-3 focus-within:border-cyan">
          {result && <span aria-hidden="true" className="shrink-0 border-r border-line-2 pr-2 text-xs font-semibold text-cyan">Detected: {result.formatLabel}</span>}
          <input
            id={`${id}-result`}
            readOnly
            className="min-w-0 flex-1 bg-transparent py-2 font-mono text-[15px] text-white outline-none placeholder:text-mist/60"
            value={shown}
            placeholder="The scan result appears here"
            autoComplete="off"
            spellCheck={false}
            onFocus={(e) => e.currentTarget.select()}
            aria-describedby={`${id}-help`}
          />
        </div>
        <p id={`${id}-help`} role={problem ? "alert" : "status"} aria-live={problem ? undefined : "polite"} className={problem ? "field-error" : "hint min-h-5"}>
          {result && !problem && <span className="sr-only">Detected: {result.formatLabel}. </span>}
          {hint}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {cam.live && <button type="button" className="btn-secondary" onClick={cam.pause}>Pause</button>}
          <button type="button" className="btn-secondary" onClick={() => fileRef.current?.click()} disabled={working}>{working ? "Reading image…" : "Upload image"}</button>
          {hasSecret && <button type="button" className="btn-secondary" aria-pressed={reveal} onClick={() => setReveal((v) => !v)}>{reveal ? "Hide password" : "Show password"}</button>}
          <Link prefetch={false} href="/scanner/" className="btn-ghost">Open Scanner</Link>
        </div>
        <input ref={fileRef} type="file" accept={IMAGE_ACCEPT} className="sr-only" tabIndex={-1} aria-label="Upload an image containing a QR code or barcode" onChange={(e) => onFile(e.target.files?.[0])} />
        </div>
      </div>

      <div className="relative order-2 mx-auto mt-1 mb-5 aspect-square w-44 overflow-hidden rounded-xl border border-line bg-panel sm:order-none sm:my-0 sm:w-full">
        <video ref={cam.videoRef} playsInline muted autoPlay aria-label="Camera preview" className={`absolute inset-0 h-full w-full bg-black object-cover ${cam.live ? "" : "invisible"}`} />
        {cam.phase === "scanning" && (
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {["M20 32V20H32", "M68 20H80V32", "M80 68V80H68", "M32 80H20V68"].map((d) => (
              <path key={d} d={d} fill="none" stroke="#22d3ee" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 4 }} />
            ))}
          </svg>
        )}
        {cam.phase === "starting" && <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-xs text-fog">Starting camera…</div>}
        {!cam.live && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
            <p className="text-xs text-mist">{offText}</p>
            {cam.phase !== "idle" && (
              <button type="button" className="btn-primary min-h-9 px-3 text-sm" onClick={() => cam.start(cam.deviceId || undefined)} disabled={working}>{startLabel}</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
