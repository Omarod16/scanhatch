"use client";

import { memo } from "react";
import { Toggle } from "@/components/ui/controls";
import { summarise, type BulkRow } from "@/lib/bulk/rows";

export const BatchSummary = memo(function BatchSummary({ rows, includeDuplicates, onIncludeDuplicates, onErrorReport, warnings }: {
  rows: BulkRow[]; includeDuplicates: boolean; onIncludeDuplicates: (v: boolean) => void; onErrorReport: () => void; warnings: string[];
}) {
  const s = summarise(rows);
  const toGenerate = s.valid - (includeDuplicates ? 0 : s.duplicates);
  return (
    <div className="space-y-3">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Batch summary">
        {[["Rows", s.total, "text-white"], ["Valid rows", s.valid, "text-ok"], ["Invalid rows", s.invalid, s.invalid ? "text-danger" : "text-white"], ["Duplicates", s.duplicates, s.duplicates ? "text-warn" : "text-white"]].map(([k, v, c]) => (
          <div key={k as string} className="rounded-xl border border-line bg-ink-2 px-4 py-3">
            <dt className="text-xs text-mist">{k}</dt>
            <dd className={`text-2xl font-bold ${c}`}>{v}</dd>
          </div>
        ))}
      </dl>
      {warnings.map((w) => <p key={w} className="rounded-lg border border-line-2 bg-panel px-3 py-2 text-sm text-fog"><span className="font-semibold text-white">Note: </span>{w}</p>)}
      {s.invalid > 0 && (
        <div className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-red-100" role="status">
          <p>
            <strong>{s.invalid} row{s.invalid === 1 ? " has" : "s have"} errors</strong> and won&apos;t be generated unless fixed. Fix them in the table below,
            or correct your file and upload it again.
          </p>
          <button type="button" className="mt-2 font-semibold text-white underline underline-offset-2" onClick={onErrorReport}>Download error report (CSV)</button>
        </div>
      )}
      {s.duplicates > 0 && (
        <div className="rounded-lg border border-warn/40 bg-warn/10 px-4 py-3 text-sm text-amber-100">
          <p className="mb-2">Duplicate data detected: {s.duplicates} row{s.duplicates === 1 ? " repeats" : "s repeat"} an earlier row. Nothing has been removed.</p>
          <Toggle label="Generate duplicate rows too" checked={includeDuplicates} onChange={onIncludeDuplicates} />
        </div>
      )}
      <p className="text-sm text-fog" aria-live="polite">{toGenerate} code{toGenerate === 1 ? "" : "s"} will be generated.</p>
    </div>
  );
});
