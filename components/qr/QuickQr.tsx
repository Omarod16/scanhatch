"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { track } from "@/lib/analytics";
import { canvasToBlob, downloadBlob, svgBlob, svgToCanvas } from "@/lib/downloads/export";
import { normalizeUrl } from "@/lib/qr/content";
import { DEFAULT_STYLE } from "@/lib/qr/style";
import { svgDataUri, useQrOutput } from "./useQrOutput";

/** Compact, fully working URL → QR generator for the homepage. `framed={false}` drops the card border (for use inside tabs). */
export function QuickQr({ framed = true }: { framed?: boolean }) {
  const id = useId();
  const [value, setValue] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const norm = useMemo(() => (value.trim() ? normalizeUrl(value) : {}), [value]);
  const qr = useQrOutput(norm.url ?? null, DEFAULT_STYLE, "QR code for your link");

  const download = async (format: "png" | "svg") => {
    if (!qr.svg) return;
    try {
      if (format === "svg") downloadBlob(svgBlob(qr.svg), "scanhatch-qr.svg");
      else downloadBlob(await canvasToBlob(await svgToCanvas(qr.svg, 1024), "image/png"), "scanhatch-qr.png");
      track("qr_downloaded", { format });
      setMsg(`${format.toUpperCase()} downloaded.`);
    } catch {
      setMsg("Download failed. Please try again.");
    }
  };

  return (
    <div className={`grid items-center gap-6 sm:grid-cols-[1fr_200px] ${framed ? "rounded-2xl border border-line bg-ink-2 p-5 sm:p-8" : ""}`}>
      <div>
        <label htmlFor={id} className="label">Paste a link to make a QR code</label>
        <input
          id={id}
          className="input"
          type="url"
          inputMode="url"
          placeholder="https://example.com"
          value={value}
          onChange={(e) => { setValue(e.target.value); setMsg(null); }}
          aria-invalid={norm.error ? true : undefined}
          aria-describedby={`${id}-help`}
        />
        <p id={`${id}-help`} className={norm.error ? "field-error" : "hint"}>
          {norm.error ?? "Generated instantly in your browser."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className="btn-primary" disabled={!qr.svg} onClick={() => download("png")}>Download PNG</button>
          <button type="button" className="btn-secondary" disabled={!qr.svg} onClick={() => download("svg")}>SVG</button>
          <Link
            href={norm.url ? `/qr-code-generator/#url=${encodeURIComponent(norm.url)}` : "/qr-code-generator/"}
            className="btn-ghost"
          >
            Customise colours &amp; logo
          </Link>
        </div>
        <p role="status" className="mt-2 min-h-5 text-sm text-mist">{msg}</p>
      </div>
      <div className="mx-auto aspect-square w-44 overflow-hidden rounded-xl border border-line bg-panel sm:w-full">
        {qr.svg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={svgDataUri(qr.svg)} alt="QR code preview for the link you entered" className="h-full w-full" />
        ) : (
          <div className="flex h-full items-center justify-center p-4 text-center text-xs text-mist">Your code appears here</div>
        )}
      </div>
    </div>
  );
}
