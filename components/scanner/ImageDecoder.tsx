"use client";

import { isLoadError } from "@/lib/errors";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { formatsFor, isQrFormat, normaliseResult, withArticle, type NormalisedResult, type ScanMode } from "@/lib/scanner/formats";
import { IMAGE_ACCEPT, ImageInputError, readImageFile, toImageData } from "@/lib/scanner/image";
import { decodeImageData } from "@/lib/scanner/zxing";
import { DecodeResult } from "./DecodeResult";

type State =
  | { kind: "idle" }
  | { kind: "working" }
  | { kind: "results"; results: NormalisedResult[] }
  | { kind: "none"; other?: NormalisedResult }
  | { kind: "error"; message: string };

const noun = (m: ScanMode) => (m === "qr" ? "QR code" : m === "barcode" ? "barcode" : "QR code or barcode");

export function ImageDecoder({ mode, onDecoded }: { mode: ScanMode; onDecoded?: (r: NormalisedResult) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<State>({ kind: "idle" });
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const process = useCallback(async (file: File | undefined | null) => {
    if (!file) return;
    setState({ kind: "working" });
    let bitmap: ImageBitmap | null = null;
    try {
      bitmap = await readImageFile(file);
      setPreview(URL.createObjectURL(file));
      const passes = [1600, 3200].filter((side, i) => i === 0 || Math.max(bitmap!.width, bitmap!.height) > 1600);
      let found: NormalisedResult[] = [];
      for (const side of passes) {
        const { data } = toImageData(bitmap, bitmap.width, bitmap.height, side);
        const res = await decodeImageData(data, { formats: formatsFor(mode), tryHarder: true, tryRotate: true, tryInvert: true, tryDownscale: true, maxNumberOfSymbols: 8 });
        found = res.map((r) => normaliseResult(r.format, r.text));
        if (found.length) break;
      }
      if (found.length) {
        setState({ kind: "results", results: found });
        found.forEach((r) => onDecoded?.(r));
        track("decoder_used", { success: true });
      } else {
        // Helpful hint: is there a different kind of code in the image?
        let other: NormalisedResult | undefined;
        if (mode !== "all") {
          const { data } = toImageData(bitmap, bitmap.width, bitmap.height, 1600);
          const any = await decodeImageData(data, { formats: formatsFor("all"), tryHarder: true, tryRotate: true, maxNumberOfSymbols: 1 });
          if (any[0]) other = normaliseResult(any[0].format, any[0].text);
        }
        setState({ kind: "none", other });
        track("decoder_used", { success: false });
      }
    } catch (e) {
      setState({
        kind: "error",
        message: e instanceof ImageInputError ? e.message
          : isLoadError(e) || (e instanceof Error && /wasm|WebAssembly/i.test(e.message)) ? "The decoder couldn't load. Check your connection and reload the page."
          : "This image couldn't be decoded. Try a different image.",
      });
    } finally {
      bitmap?.close();
      if (inputRef.current) inputRef.current.value = "";
      requestAnimationFrame(() => resultRef.current?.focus());
    }
  }, [mode, onDecoded]);

  // Paste an image with Ctrl/Cmd+V anywhere on the page. Ignored when there's no image.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      const item = Array.from(e.clipboardData?.items ?? []).find((i) => i.kind === "file" && i.type.startsWith("image/"));
      const file = item?.getAsFile();
      if (file) { e.preventDefault(); process(file); }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [process]);

  const reset = () => { setState({ kind: "idle" }); setPreview(null); inputRef.current?.focus(); };

  return (
    <div>
      <div
        onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false); }}
        onDrop={(e) => { e.preventDefault(); setDragging(false); process(e.dataTransfer.files[0]); }}
        data-testid="dropzone"
        className={`flex min-h-56 flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${dragging ? "border-cyan bg-cyan/10" : "border-line-2 bg-ink-2"}`}
      >
        {preview && state.kind !== "working" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="The image you uploaded" className="max-h-40 max-w-full rounded-lg object-contain" />
        ) : (
          <svg viewBox="0 0 24 24" className="h-10 w-10 text-mist" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" /></svg>
        )}
        <div>
          <p className="text-base font-semibold text-white">{dragging ? "Drop the image to decode it" : "Drop an image here or choose a file"}</p>
          <p className="mt-1 text-sm text-mist">PNG, JPG or WEBP up to 10 MB. You can also paste an image.</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => inputRef.current?.click()} disabled={state.kind === "working"}>
          {state.kind === "working" ? "Reading image…" : preview ? "Choose another image" : "Choose an image"}
        </button>
        <input ref={inputRef} type="file" accept={IMAGE_ACCEPT} className="sr-only" tabIndex={-1} aria-label={`Upload an image containing a ${noun(mode)}`} onChange={(e) => process(e.target.files?.[0])} />
      </div>

      <div ref={resultRef} tabIndex={-1} className="mt-6 space-y-4 focus:outline-none" aria-live="polite">
        {state.kind === "working" && <p className="text-sm text-fog" role="status">Looking for a {noun(mode)}…</p>}
        {state.kind === "error" && <p className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-red-200" role="alert">{state.message}</p>}
        {state.kind === "none" && (
          <div className="rounded-lg border border-warn/40 bg-warn/10 px-4 py-3 text-sm text-amber-100" role="alert">
            {state.other ? (
              <p>
                No {noun(mode)} was found, but this image contains {withArticle(state.other.formatLabel).split(" ")[0]} <strong>{state.other.formatLabel}</strong>.{" "}
                <Link href={isQrFormat(state.other.format) ? "/qr-decoder/" : "/barcode-decoder/"} className="font-semibold underline underline-offset-2">
                  Open the {isQrFormat(state.other.format) ? "QR Decoder" : "Barcode Decoder"}
                </Link>{" "}
                to read it.
              </p>
            ) : (
              <p>
                No {noun(mode)} was found in this image. Try a sharper, well-lit image where the code is flat, in focus and fills more of the frame.
                {mode === "barcode" && " MSI and Pharmacode barcodes aren't supported by this decoder."}
              </p>
            )}
          </div>
        )}
        {state.kind === "results" && (
          <>
            {state.results.length > 1 && <p className="text-sm text-fog" role="status">{state.results.length} codes found in this image.</p>}
            {state.results.map((r, i) => (
              <DecodeResult key={`${r.format}-${i}`} result={r} onAgain={i === state.results.length - 1 ? reset : undefined} againLabel="Decode another image" />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
