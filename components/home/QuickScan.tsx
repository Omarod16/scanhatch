"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useCameraScanner } from "@/components/scanner/useCameraScanner";
import { track } from "@/lib/analytics";
import { isLoadError } from "@/lib/errors";
import { formatsFor, normaliseResult, type NormalisedResult } from "@/lib/scanner/formats";
import { pointsOf, type DetectionFrame } from "@/lib/scanner/frame";
import { useScanHistory } from "@/lib/scanner/history";
import { IMAGE_ACCEPT, ImageInputError, readImageFile, toImageData } from "@/lib/scanner/image";
import { maskSecrets } from "@/lib/scanner/parse";
import { decodeImageData } from "@/lib/scanner/zxing";

/**
 * Quick scanner for the homepage, laid out like the QR Code and Barcode tabs:
 * the scan result goes in the field on the left, the camera is the square preview on the right.
 * After a detection the square keeps a dimmed copy of the image the code was read from, with the
 * code outlined and a "Scan again" button on top. That image lives in memory only: it is never
 * saved, added to the scan history or sent anywhere. Loaded only when its tab opens.
 */
export default function QuickScan() {
  const id = useId();
  const history = useScanHistory();
  const fileRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const blobRef = useRef<string | null>(null);
  const copyTimer = useRef<number | null>(null);
  const [result, setResult] = useState<NormalisedResult | null>(null);
  const [frame, setFrame] = useState<DetectionFrame | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [copied, setCopied] = useState(false);

  /** Replace the detection image, releasing an uploaded picture's temporary URL. */
  const replaceFrame = useCallback((next: DetectionFrame | null) => {
    if (blobRef.current && blobRef.current !== next?.src) { URL.revokeObjectURL(blobRef.current); blobRef.current = null; }
    if (next?.src.startsWith("blob:")) blobRef.current = next.src;
    setFrame(next);
  }, []);
  useEffect(() => () => {
    if (blobRef.current) URL.revokeObjectURL(blobRef.current);
    if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
  }, []);

  const onCamera = useCallback((r: NormalisedResult) => {
    setResult(r); setMessage(null); setReveal(false); setCopied(false);
    history.add({ format: r.formatLabel, value: r.value, source: "camera" });
  }, [history]);
  const cam = useCameraScanner("all", onCamera, replaceFrame);

  // This panel only mounts when the visitor selects the Scan Code tab, so start the camera right away.
  useEffect(() => { void cam.start(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /** Scan again / resume: forget the previous result and its image, then start the camera. */
  const begin = () => {
    setResult(null); replaceFrame(null); setMessage(null); setCopied(false); setReveal(false);
    void cam.start(cam.deviceId || undefined);
  };

  const onFile = async (file: File | undefined | null) => {
    if (!file) return;
    if (cam.live) cam.pause();
    setWorking(true); setMessage(null); setCopied(false);
    let bitmap: ImageBitmap | null = null;
    try {
      bitmap = await readImageFile(file);
      const passes = [1600, 3200].filter((side, i) => i === 0 || Math.max(bitmap!.width, bitmap!.height) > 1600);
      for (const side of passes) {
        const { data } = toImageData(bitmap, bitmap.width, bitmap.height, side);
        const res = await decodeImageData(data, { formats: formatsFor("all"), tryHarder: true, tryRotate: true, tryInvert: true, tryDownscale: true, maxNumberOfSymbols: 1 });
        if (res.length) {
          const found = normaliseResult(res[0].format, res[0].text);
          setResult(found); setReveal(false);
          replaceFrame({ src: URL.createObjectURL(file), width: data.width, height: data.height, points: pointsOf((res[0] as { position?: unknown }).position) });
          history.add({ format: found.formatLabel, value: found.value, source: "image" });
          track("decoder_used", { success: true });
          return;
        }
      }
      setResult(null); replaceFrame(null);
      setMessage("No QR code or barcode was found in that image.");
      track("decoder_used", { success: false });
    } catch (e) {
      setResult(null); replaceFrame(null);
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

  // WiFi passwords stay hidden on screen unless the visitor chooses to show them (same masking as the scan history).
  const masked = result ? maskSecrets(result.value) : "";
  const hasSecret = !!result && masked !== result.value;
  const shown = result ? (hasSecret && !reveal ? masked : result.value) : "";

  /** Copies exactly what was scanned (including a WiFi password: the visitor pressed Copy on purpose). */
  const copy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.value);
      setMessage(null); setCopied(true);
      if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      if (hasSecret) setReveal(true);
      setMessage("Couldn't copy automatically. Select the result and copy it.");
      window.setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select(); }, 0);
    }
  };

  const problem = cam.error ?? message;
  const hint = problem ?? (hasSecret && !reveal ? "The password is hidden." : null);
  const title = cam.phase === "starting" ? "Starting camera… allow access if asked."
    : cam.phase === "scanning" ? "Looking for a code…"
    : "Scan a QR code or barcode";
  const announce = copied ? "Copied to clipboard."
    : result && !cam.live ? `Detected: ${result.formatLabel}.`
    : cam.phase === "starting" ? "Starting camera. Allow camera access if your browser asks."
    : cam.phase === "scanning" ? "Looking for a code."
    : "";

  const detected = !!frame && !cam.live;
  const offText = detected ? "Camera is off." : cam.phase === "paused" ? "Camera paused." : cam.phase === "error" ? "Camera unavailable." : "Camera is off.";
  const againLabel = detected || cam.phase === "found" ? "Scan again" : cam.phase === "error" ? "Try again" : "Resume camera";
  const showAgain = !cam.live && (cam.phase !== "idle" || detected);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_200px] sm:items-center sm:gap-x-6">
      {/* On phones this wrapper dissolves so the title, camera and field can be ordered: title, camera, field. */}
      <div className="contents sm:block">
        <p className="label order-1">{title}</p>
        <div className="order-3">
          <p role="status" className="sr-only">{announce}</p>
          <div className="flex min-h-11 w-full items-center gap-2 rounded-lg border border-line-2 bg-ink-2 px-3 focus-within:border-cyan">
            <input
              ref={inputRef}
              id={`${id}-result`}
              readOnly
              aria-label="Scan result"
              className="min-w-0 flex-1 bg-transparent py-2 font-mono text-[15px] text-white outline-none placeholder:text-mist/60"
              value={shown}
              placeholder="The scan result appears here"
              autoComplete="off"
              spellCheck={false}
              onFocus={(e) => e.currentTarget.select()}
              aria-describedby={hint ? `${id}-help` : undefined}
            />
          </div>
          {hint && <p id={`${id}-help`} role={problem ? "alert" : undefined} className={problem ? "field-error" : "hint"}>{hint}</p>}
          <div className="mt-4 flex flex-wrap gap-2">
            {result && <button type="button" className="btn-primary min-w-24" onClick={copy}>{copied ? "Copied ✓" : "Copy"}</button>}
            <button type="button" className="btn-secondary" onClick={() => fileRef.current?.click()} disabled={working}>{working ? "Reading image…" : "Upload image"}</button>
            {hasSecret && <button type="button" className="btn-secondary" aria-pressed={reveal} onClick={() => setReveal((v) => !v)}>{reveal ? "Hide password" : "Show password"}</button>}
            <Link prefetch={false} href="/scanner/" className="btn-ghost">Open Scanner</Link>
          </div>
          <input ref={fileRef} type="file" accept={IMAGE_ACCEPT} className="sr-only" tabIndex={-1} aria-label="Upload an image containing a QR code or barcode" onChange={(e) => onFile(e.target.files?.[0])} />
        </div>
      </div>

      <div className="relative order-2 mx-auto mt-1 mb-5 w-44 sm:order-none sm:my-0 sm:w-full sm:-translate-y-2">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-line bg-panel">
        <video ref={cam.videoRef} playsInline muted autoPlay aria-label="Camera preview" className={`absolute inset-0 h-full w-full bg-black object-cover ${cam.live ? "" : "invisible"}`} />
        {cam.phase === "scanning" && (
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {["M20 32V20H32", "M68 20H80V32", "M80 68V80H68", "M32 80H20V68"].map((d) => (
              <path key={d} d={d} fill="none" stroke="#22d3ee" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 4 }} />
            ))}
          </svg>
        )}
        {cam.phase === "starting" && <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-xs text-fog">Starting camera…</div>}
        {detected && frame && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={frame.src} alt="The image the code was read from, dimmed" className="absolute inset-0 h-full w-full bg-black object-cover opacity-45" />
            {frame.points && (
              <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                <polygon data-detected-outline points={frame.points.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#22d3ee" strokeLinejoin="round" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 3 }} />
              </svg>
            )}
          </>
        )}
        {!cam.live && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
            <p className={detected ? "rounded bg-ink/70 px-2 py-0.5 text-xs text-fog" : "text-xs text-mist"}>{offText}</p>
            {showAgain && (
              <button type="button" className={`${detected ? "btn-secondary" : "btn-primary"} min-h-9 px-3 text-sm`} onClick={begin} disabled={working}>{againLabel}</button>
            )}
          </div>
        )}
      </div>
      {/* "Detected: …" caption under the camera. Space is reserved (phones) or hangs below the square (desktop), so nothing shifts when it appears. */}
      <p aria-hidden="true" className="mt-2 min-h-5 text-center text-xs font-semibold text-cyan sm:absolute sm:inset-x-0 sm:top-full sm:mt-1">{result ? `Detected: ${result.formatLabel}` : ""}</p>
      </div>
    </div>
  );
}
