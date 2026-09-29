"use client";

import { memo, useCallback, useEffect, useId, useRef, useState } from "react";
import type { BulkRow } from "@/lib/bulk/rows";

type Filter = "all" | "invalid" | "duplicates";
const clip = (s: string, n = 120) => (s.length > n ? `${s.slice(0, n)}…` : s);

function FixRow({ row, colSpan, valueLabel, canEditName, onSave, onCancel }: {
  row: BulkRow; colSpan: number; valueLabel: string; canEditName: boolean;
  onSave: (value: string, name?: string) => void; onCancel: () => void;
}) {
  const id = useId();
  const [value, setValue] = useState(row.input);
  const [name, setName] = useState(row.name);
  const first = useRef<HTMLTextAreaElement>(null);
  useEffect(() => first.current?.focus(), []);
  return (
    <tr className="bg-panel">
      <td colSpan={colSpan} className="p-3">
        <form className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end" onSubmit={(e) => { e.preventDefault(); onSave(value, canEditName ? name : undefined); }}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor={`${id}-v`} className="label">{valueLabel} (row {row.row})</label>
              <textarea ref={first} id={`${id}-v`} rows={2} className="input font-mono" value={value} onChange={(e) => setValue(e.target.value)} />
            </div>
            {canEditName && (
              <div>
                <label htmlFor={`${id}-n`} className="label">Name (row {row.row})</label>
                <input id={`${id}-n`} className="input" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">Save and recheck</button>
            <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
          </div>
        </form>
        <p className="hint">Edits apply to this batch only. Your original file isn&apos;t changed.</p>
      </td>
    </tr>
  );
}

export const RowTable = memo(function RowTable({ rows, valueLabel, fileNames, includeDuplicates, canEditName, onFix }: {
  rows: BulkRow[]; valueLabel: string; fileNames: Map<number, string>; includeDuplicates: boolean;
  canEditName: boolean; onFix: (row: number, value: string, name?: string) => void;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [editing, setEditing] = useState<number | null>(null);
  // After Save/Cancel, keyboard focus returns to the row's Edit/Fix button (or the nearest remaining row).
  const [returnTo, setReturnTo] = useState<number | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const closeEditor = useCallback((row: number) => { setEditing(null); setReturnTo(row); }, []);
  const invalid = rows.filter((r) => !r.valid).length;
  const dups = rows.filter((r) => r.duplicateOf !== undefined).length;
  const shown = rows.filter((r) => (filter === "invalid" ? !r.valid : filter === "duplicates" ? r.duplicateOf !== undefined : true));
  useEffect(() => {
    if (returnTo === null) return;
    const box = scroller.current;
    const buttons = box ? [...box.querySelectorAll<HTMLButtonElement>("button[data-edit-row]")] : [];
    const target = buttons.find((b) => Number(b.dataset.editRow) === returnTo)
      ?? buttons.find((b) => Number(b.dataset.editRow) > returnTo)
      ?? buttons[buttons.length - 1];
    if (target) { target.focus({ preventScroll: true }); target.scrollIntoView({ block: "nearest" }); }
    else box?.focus({ preventScroll: true });
    setReturnTo(null);
  }, [returnTo, rows]);

  const filters: [Filter, string, number][] = [["all", "All", rows.length], ["invalid", "Invalid", invalid], ["duplicates", "Duplicates", dups]];

  return (
    <div>
      <div role="group" aria-label="Show rows" className="mb-3 flex flex-wrap gap-2">
        {filters.map(([f, label, n]) => (
          <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}
            className={`rounded-full border px-3 py-1.5 text-sm ${filter === f ? "border-cyan bg-cyan/10 text-white" : "border-line text-fog hover:border-line-2"}`}>
            {label} ({n})
          </button>
        ))}
      </div>
      <div ref={scroller} className="relative max-h-[32rem] overflow-auto rounded-xl border border-line" tabIndex={0} aria-label="Rows from your file (scrollable)">
        <table className="w-full min-w-[46rem] border-collapse text-left text-sm">
          <caption className="sr-only">Rows from your CSV file with validation status. Row numbers match your spreadsheet, where row 1 is the header.</caption>
          <thead className="sticky top-0 z-10 bg-ink-2 text-xs text-mist">
            <tr>
              <th scope="col" className="px-3 py-2.5 font-semibold">Row</th>
              <th scope="col" className="px-3 py-2.5 font-semibold">Name</th>
              <th scope="col" className="px-3 py-2.5 font-semibold">Type</th>
              <th scope="col" className="px-3 py-2.5 font-semibold">{valueLabel}</th>
              <th scope="col" className="px-3 py-2.5 font-semibold">Status</th>
              <th scope="col" className="px-3 py-2.5 font-semibold">Details</th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 && <tr><td colSpan={6} className="px-3 py-6 text-center text-mist">No rows to show.</td></tr>}
            {shown.map((r) => {
              const dup = r.duplicateOf !== undefined;
              const skipped = dup && !includeDuplicates;
              const status = !r.valid ? { icon: "✕", text: "Invalid", cls: "text-danger" } : dup ? { icon: "!", text: skipped ? "Duplicate (skipped)" : "Duplicate", cls: "text-warn" } : { icon: "✓", text: "Valid", cls: "text-ok" };
              return (
                <FragmentRow key={r.row}>
                  <tr className={`border-t border-line align-top ${!r.valid ? "bg-danger/5" : ""}`}>
                    <th scope="row" className="px-3 py-2.5 font-mono font-normal text-fog">{r.row}</th>
                    <td className="max-w-[10rem] px-3 py-2.5 break-words text-white" title={r.name}>{r.name ? clip(r.name, 60) : <span className="text-mist">—</span>}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-fog">{r.typeLabel}</td>
                    <td className="max-w-[16rem] px-3 py-2.5 font-mono break-all whitespace-pre-wrap text-white" title={r.input}>
                      {r.input ? clip(r.input) : <span className="font-sans text-mist">(empty)</span>}
                      {r.valid && r.output && r.output !== r.input.trim() && <span className="mt-1 block text-cyan">→ {clip(r.output)}</span>}
                    </td>
                    <td className={`px-3 py-2.5 whitespace-nowrap font-semibold ${status.cls}`}><span aria-hidden="true">{status.icon} </span>{status.text}</td>
                    <td className="min-w-[14rem] px-3 py-2.5">
                      {r.errors.map((e) => <p key={e} className="text-red-200">{e}</p>)}
                      {r.warnings.map((w) => <p key={w} className="text-amber-100">{w}</p>)}
                      {r.notes.map((n) => <p key={n} className="text-fog">{n}</p>)}
                      {r.valid && !skipped && fileNames.get(r.row) && <p className="text-mist">File: <span className="font-mono break-all">{fileNames.get(r.row)}</span></p>}
                      <button type="button" data-edit-row={r.row} className="mt-1 text-sm font-semibold text-cyan underline underline-offset-2" onClick={() => setEditing(editing === r.row ? null : r.row)} aria-expanded={editing === r.row}>
                        {r.valid ? "Edit" : "Fix"}<span className="sr-only"> row {r.row}</span>
                      </button>
                    </td>
                  </tr>
                  {editing === r.row && (
                    <FixRow row={r} colSpan={6} valueLabel={valueLabel} canEditName={canEditName}
                      onCancel={() => closeEditor(r.row)} onSave={(v, n) => { onFix(r.row, v, n); closeEditor(r.row); }} />
                  )}
                </FragmentRow>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
});

function FragmentRow({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
