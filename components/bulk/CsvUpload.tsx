"use client";

import { useRef, useState } from "react";
import type { CsvTemplate } from "@/lib/bulk/templates";
import { csvBlob } from "@/lib/csv/write";
import { downloadBlob } from "@/lib/downloads/export";

export function CsvUpload({
  templates, onFile, busy, fileName, intro,
}: { templates: CsvTemplate[]; onFile: (f: File) => void; busy: boolean; fileName: string | null; intro: React.ReactNode }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  return (
    <div
      data-testid="csv-dropzone"
      onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false); }}
      onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); }}
      className={`rounded-2xl border-2 border-dashed p-5 sm:p-8 transition-colors ${dragging ? "border-cyan bg-cyan/10" : "border-line-2 bg-ink-2"}`}
    >
      <div className="max-w-2xl">{intro}</div>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" className="btn-primary" disabled={busy} onClick={() => inputRef.current?.click()}>
          {busy ? "Reading file…" : fileName ? "Choose a different CSV file" : "Choose CSV file"}
        </button>
        {templates.map((t, i) => (
          <button key={t.id} type="button" className={i === 0 ? "btn-secondary" : "btn-ghost"} onClick={() => downloadBlob(csvBlob(t.content), t.filename)}>
            {t.label}
          </button>
        ))}
      </div>
      <input ref={inputRef} type="file" accept=".csv,.txt,.tsv,text/csv,text/plain" className="sr-only" tabIndex={-1} aria-label="Upload a CSV file"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
      <ul className="mt-5 space-y-1 text-sm text-mist">
        {templates.map((t) => <li key={t.id}><span className="font-semibold text-fog">{t.label.replace(/^Download /, "")}:</span> {t.description}</li>)}
        <li>You can also drop a CSV file here.</li>
      </ul>
      {fileName && <p className="mt-3 text-sm text-fog">Current file: <span className="font-mono break-all text-white">{fileName}</span></p>}
    </div>
  );
}
