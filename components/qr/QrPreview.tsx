"use client";

import type { QrWarning } from "@/lib/qr/warnings";
import { svgDataUri } from "./useQrOutput";

const LEVEL_STYLE: Record<QrWarning["level"], string> = {
  danger: "border-danger/40 bg-danger/10 text-red-200",
  warn: "border-warn/40 bg-warn/10 text-amber-100",
  info: "border-line-2 bg-panel text-fog",
};
const LEVEL_LABEL: Record<QrWarning["level"], string> = { danger: "Problem", warn: "Warning", info: "Note" };

export function QrPreview({
  svg, error, warnings, transparent, emptyText, notes,
}: { svg: string | null; error: string | null; warnings: QrWarning[]; transparent: boolean; emptyText: string; notes?: string[] }) {
  return (
    <div>
      <div className={`mx-auto aspect-square w-full max-w-[420px] overflow-hidden rounded-2xl border border-line ${transparent ? "checker" : "bg-panel"}`}>
        {svg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={svgDataUri(svg)} alt="Live preview of your QR code" className="h-full w-full" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
            <svg viewBox="0 0 48 48" className="h-12 w-12 text-line-2" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
              <rect x="4" y="4" width="14" height="14" rx="2" /><rect x="30" y="4" width="14" height="14" rx="2" /><rect x="4" y="30" width="14" height="14" rx="2" />
              <path d="M30 30h4v4h-4zM40 30h4M30 40h4M38 38h6v6" />
            </svg>
            <p className={`text-sm ${error ? "font-medium text-danger" : "text-mist"}`} role={error ? "alert" : undefined}>{error ?? emptyText}</p>
          </div>
        )}
      </div>

      {(warnings.length > 0 || (notes && notes.length > 0)) && (
        <ul className="mt-4 space-y-2" aria-label="Readability checks">
          {warnings.map((w) => (
            <li key={w.id} className={`rounded-lg border px-3 py-2.5 text-sm leading-snug ${LEVEL_STYLE[w.level]}`}>
              <span className="font-semibold">{LEVEL_LABEL[w.level]}: </span>
              {w.message}
            </li>
          ))}
          {notes?.map((n) => (
            <li key={n} className={`rounded-lg border px-3 py-2.5 text-sm leading-snug ${LEVEL_STYLE.info}`}>
              <span className="font-semibold">Note: </span>{n}
            </li>
          ))}
        </ul>
      )}
      {svg && <p className="mt-4 text-sm text-mist">Scan test recommended before printing.</p>}
    </div>
  );
}
