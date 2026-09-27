"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import { MAX_RASTER_PX } from "@/lib/barcode/warnings";
import { rasterSize, type RenderedBarcode } from "@/lib/barcode/render";
import {
  canCopyImage, canShareFiles, canvasToBlob, copyImageBlob, downloadBlob,
  printSvg, shareFile, svgBlob, svgToCanvas, svgToVectorPdf, type PageSize,
} from "@/lib/downloads/export";

type Action = "png" | "jpg" | "svg" | "pdf" | "print" | "copy" | "share";

export function BarcodeExport({
  rendered, formatId, dpi, page, background, transparent,
}: { rendered: RenderedBarcode | null; formatId: string; dpi: number; page: PageSize | "fit"; background: string; transparent: boolean }) {
  const [busy, setBusy] = useState<Action | null>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [caps, setCaps] = useState({ copy: false, share: false });
  useEffect(() => setCaps({ copy: canCopyImage(), share: canShareFiles() }), []);

  const filename = `scanhatch-barcode-${formatId}`;
  const px = rendered ? rasterSize(rendered, dpi) : null;
  const tooBig = !!px && (px.width > MAX_RASTER_PX || px.height > MAX_RASTER_PX);

  const raster = async (fill?: string) => {
    if (!rendered || !px) throw new Error("Nothing to export yet.");
    if (tooBig) throw new Error(`Image would be ${px.width} × ${px.height} px. Lower the resolution or use SVG/PDF.`);
    return svgToCanvas(rendered.svg, px.width, fill, px.height);
  };

  const run = async (action: Action, fn: () => Promise<string | void>) => {
    if (!rendered) return;
    setBusy(action);
    setMsg(null);
    try {
      const text = await fn();
      if (text) setMsg({ kind: "ok", text });
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setMsg({ kind: "error", text: e instanceof Error ? e.message : "Export failed. Try again, or use SVG." });
    } finally {
      setBusy(null);
    }
  };

  const done = (fmt: string) => track("barcode_downloaded", { format: fmt, type: formatId });

  const actions: { id: Action; label: string; primary?: boolean; show: boolean; fn: () => Promise<string | void> }[] = [
    { id: "png", label: "Download PNG", primary: true, show: true, fn: async () => {
      downloadBlob(await canvasToBlob(await raster(), "image/png"), `${filename}.png`); done("png");
      return `PNG downloaded (${px!.width} × ${px!.height} px, ${px!.effectiveDpi} dpi at the set print size).`;
    } },
    { id: "svg", label: "SVG", show: true, fn: async () => {
      downloadBlob(svgBlob(rendered!.svg), `${filename}.svg`); done("svg");
      return `SVG downloaded. It opens at ${rendered!.widthMm.toFixed(1)} × ${rendered!.heightMm.toFixed(1)} mm in design software.`;
    } },
    { id: "jpg", label: "JPG", show: true, fn: async () => {
      downloadBlob(await canvasToBlob(await raster(background), "image/jpeg", 0.95), `${filename}.jpg`); done("jpg");
      return transparent ? "JPG downloaded with a solid background (JPG can't be transparent)." : "JPG downloaded.";
    } },
    { id: "pdf", label: "PDF", show: true, fn: async () => {
      const { blob, scaled } = await svgToVectorPdf(rendered!.svg, { widthMm: rendered!.widthMm, heightMm: rendered!.heightMm, page });
      downloadBlob(blob, `${filename}.pdf`); done("pdf");
      return scaled ? "Vector PDF downloaded. The barcode was scaled down to fit the page, so check its size before relying on it." : `Vector PDF downloaded at ${rendered!.widthMm.toFixed(1)} × ${rendered!.heightMm.toFixed(1)} mm.`;
    } },
    { id: "print", label: "Print", show: true, fn: async () => {
      await printSvg(rendered!.svg, rendered!.widthMm, rendered!.heightMm);
    } },
    { id: "copy", label: "Copy image", show: caps.copy, fn: async () => {
      await copyImageBlob(await canvasToBlob(await raster(), "image/png"));
      return "Image copied to your clipboard.";
    } },
    { id: "share", label: "Share", show: caps.share, fn: async () => {
      await shareFile(new File([await canvasToBlob(await raster(), "image/png")], `${filename}.png`, { type: "image/png" }), "Barcode");
    } },
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {actions.filter((a) => a.show).map((a) => (
          <button
            key={a.id}
            type="button"
            disabled={!rendered || busy !== null || (tooBig && ["png", "jpg", "copy", "share"].includes(a.id))}
            onClick={() => run(a.id, a.fn)}
            aria-busy={busy === a.id}
            className={a.primary ? "btn-primary w-full" : "btn-secondary grow basis-[calc(33.333%-0.5rem)] px-3 whitespace-nowrap"}
          >
            {busy === a.id ? "Working…" : a.label}
          </button>
        ))}
      </div>
      <p role="status" aria-live="polite" className={`mt-3 min-h-5 text-sm ${msg?.kind === "error" ? "text-danger" : "text-mist"}`}>{msg?.text}</p>
    </div>
  );
}
