"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useState } from "react";
import { track } from "@/lib/analytics";
import { barcodeFormat, DEFAULT_FORMAT_OPTIONS } from "@/lib/barcode/formats";
import { cleanBwipError, DEFAULT_BARCODE_STYLE, rasterSize, renderBarcode, styleFor } from "@/lib/barcode/render";
import { canvasToBlob, downloadBlob, svgBlob, svgToCanvas } from "@/lib/downloads/export";
import { userMessage } from "@/lib/errors";

type Bwip = { toSVG: (o: object) => string };
const svgDataUri = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

/**
 * Simple text barcode for the homepage (Code 128, which accepts letters, numbers and
 * symbols), using the same engine as the Barcode Generator. Loaded only when its tab opens.
 */
export default function QuickBarcode() {
  const id = useId();
  const format = barcodeFormat("code128")!;
  const [value, setValue] = useState("");
  const [bwip, setBwip] = useState<Bwip | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    import("bwip-js/browser")
      .then((m) => alive && setBwip({ toSVG: (o) => m.toSVG(o as never) }))
      .catch(() => alive && setLoadError("The barcode engine couldn't load. Check your connection and reload the page."));
    return () => { alive = false; };
  }, []);

  const out = useMemo(() => {
    const input = value.trim();
    if (!input) return { error: null as string | null, rendered: null };
    const v = format.validate(input, DEFAULT_FORMAT_OPTIONS);
    if (!v.ok) return { error: v.error, rendered: null };
    if (!bwip) return { error: null, rendered: null };
    try {
      return { error: null, rendered: renderBarcode(bwip, format, v, styleFor(format, DEFAULT_BARCODE_STYLE)) };
    } catch (e) {
      return { error: cleanBwipError(e), rendered: null };
    }
  }, [value, format, bwip]);

  const download = async (type: "png" | "svg") => {
    const r = out.rendered;
    if (!r) return;
    try {
      if (type === "svg") downloadBlob(svgBlob(r.svg), "scanhatch-barcode.svg");
      else {
        const px = rasterSize(r, 300);
        downloadBlob(await canvasToBlob(await svgToCanvas(r.svg, px.width, "#ffffff", px.height), "image/png"), "scanhatch-barcode.png");
      }
      track("barcode_downloaded", { format: "code128", type });
      setMsg(`${type.toUpperCase()} downloaded.`);
    } catch (e) {
      setMsg(userMessage(e, "Download failed. Please try again."));
    }
  };

  const hint = loadError ?? out.error ?? (value.trim() && !bwip ? "Loading the barcode engine…" : "Letters, numbers and common symbols.");

  return (
    <div className="grid items-center gap-6 sm:grid-cols-[1fr_200px]">
      <div>
        <label htmlFor={`${id}-data`} className="label">Enter text to make a barcode</label>
        <input
          id={`${id}-data`}
          className="input font-mono"
          value={value}
          placeholder={format.placeholder}
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => { setValue(e.target.value); setMsg(null); }}
          aria-invalid={out.error ? true : undefined}
          aria-describedby={`${id}-help`}
        />
        <p id={`${id}-help`} className={out.error || loadError ? "field-error" : "hint"}>{hint}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className="btn-primary" disabled={!out.rendered} onClick={() => download("png")}>Download PNG</button>
          <button type="button" className="btn-secondary" disabled={!out.rendered} onClick={() => download("svg")}>SVG</button>
          <Link
            href={value.trim() && !out.error ? `/barcode-generator/#code128:${encodeURIComponent(value.trim())}` : "/barcode-generator/"}
            className="btn-ghost"
          >
            Open Barcode Generator
          </Link>
        </div>
        <p role="status" className="mt-2 min-h-5 text-sm text-mist">{msg}</p>
      </div>
      <div className="mx-auto flex aspect-square w-44 items-center justify-center overflow-hidden rounded-xl border border-line bg-panel p-3 sm:w-full">
        {out.rendered ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={svgDataUri(out.rendered.svg)} alt="Barcode preview for the text you entered" className="max-h-full max-w-full bg-white" />
        ) : (
          <div className="p-4 text-center text-xs text-mist">Your barcode appears here</div>
        )}
      </div>
    </div>
  );
}
