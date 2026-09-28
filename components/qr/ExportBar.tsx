"use client";

import { userMessage } from "@/lib/errors";

import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import {
  canCopyImage, canShareFiles, canvasToBlob, copyImageBlob, downloadBlob,
  printSvg, shareFile, svgBlob, svgToCanvas, svgToPdf,
} from "@/lib/downloads/export";
import { safeHex } from "@/lib/qr/color";
import type { QrStyle } from "@/lib/qr/style";
import type { OutputSettings } from "./SizePanel";

type Action = "png" | "jpg" | "svg" | "pdf" | "print" | "copy" | "share";

export function ExportBar({ svg, style, output, filename }: { svg: string | null; style: QrStyle; output: OutputSettings; filename: string }) {
  const [busy, setBusy] = useState<Action | null>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [caps, setCaps] = useState({ copy: false, share: false });

  useEffect(() => setCaps({ copy: canCopyImage(), share: canShareFiles() }), []);

  const bg = safeHex(style.background, "#ffffff");
  const disabled = !svg || busy !== null;

  const run = async (action: Action, fn: () => Promise<string | void>) => {
    if (!svg) return;
    setBusy(action);
    setMsg(null);
    try {
      const text = await fn();
      if (text) setMsg({ kind: "ok", text });
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setMsg({ kind: "error", text: userMessage(e, "The export didn't work. Try again, or choose a different format.") });
    } finally {
      setBusy(null);
    }
  };

  const png = () => svgToCanvas(svg!, output.pixelSize).then((c) => canvasToBlob(c, "image/png"));

  const actions: { id: Action; label: string; primary?: boolean; show: boolean; fn: () => Promise<string | void> }[] = [
    { id: "png", label: "Download PNG", primary: true, show: true, fn: async () => {
      downloadBlob(await png(), `${filename}.png`);
      track("qr_downloaded", { format: "png" });
      return `PNG downloaded (${output.pixelSize} × ${output.pixelSize} px).`;
    } },
    { id: "svg", label: "SVG", show: true, fn: async () => {
      downloadBlob(svgBlob(svg!), `${filename}.svg`);
      track("qr_downloaded", { format: "svg" });
      return "SVG downloaded.";
    } },
    { id: "jpg", label: "JPG", show: true, fn: async () => {
      const c = await svgToCanvas(svg!, output.pixelSize, bg);
      downloadBlob(await canvasToBlob(c, "image/jpeg", 0.95), `${filename}.jpg`);
      track("qr_downloaded", { format: "jpg" });
      return style.transparent ? "JPG downloaded with a solid background (JPG doesn't support transparency)." : "JPG downloaded.";
    } },
    { id: "pdf", label: "PDF", show: true, fn: async () => {
      const blob = await svgToPdf(svg!, { widthMm: output.printMm, page: output.page, fillColor: style.transparent ? undefined : bg });
      downloadBlob(blob, `${filename}.pdf`);
      track("qr_downloaded", { format: "pdf" });
      return `PDF downloaded (${output.printMm} mm wide on ${output.page === "a4" ? "A4" : "US Letter"}).`;
    } },
    { id: "print", label: "Print", show: true, fn: async () => {
      await printSvg(svg!, output.printMm);
      track("qr_printed", {});
    } },
    { id: "copy", label: "Copy image", show: caps.copy, fn: async () => {
      await copyImageBlob(await png());
      track("qr_copied", { what: "image" });
      return "Image copied to your clipboard.";
    } },
    { id: "share", label: "Share", show: caps.share, fn: async () => {
      await shareFile(new File([await png()], `${filename}.png`, { type: "image/png" }), "QR code");
      track("qr_shared", {});
    } },
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {actions.filter((a) => a.show).map((a) => (
          <button
            key={a.id}
            type="button"
            disabled={disabled}
            onClick={() => run(a.id, a.fn)}
            aria-busy={busy === a.id}
            className={a.primary ? "btn-primary w-full" : "btn-secondary grow basis-[calc(33.333%-0.5rem)] px-3 whitespace-nowrap"}
          >
            {busy === a.id ? "Working…" : a.label}
          </button>
        ))}
      </div>
      <p role="status" aria-live="polite" className={`mt-3 min-h-5 text-sm ${msg?.kind === "error" ? "text-danger" : "text-mist"}`}>
        {msg?.text}
      </p>
    </div>
  );
}
