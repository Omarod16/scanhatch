"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MAX_BATCH_ROWS, MAX_CSV_BYTES } from "@/lib/bulk/limits";
import { BatchCancelled, runBatch, type BatchFile } from "@/lib/bulk/run";
import { readCsvFile, type CsvTable } from "@/lib/csv/read";
import type { BatchPhase } from "./ProgressPanel";

/** Holds the parsed CSV and in-page fixes. Nothing leaves the browser. */
export function useCsvTable() {
  const [table, setTable] = useState<CsvTable | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const r = await readCsvFile(file, { maxBytes: MAX_CSV_BYTES, maxRows: MAX_BATCH_ROWS });
      if (r.ok) { setTable(r.table); setFileName(file.name); }
      else { setError(r.error); setTable(null); setFileName(file.name); }
    } catch {
      setError("This file couldn't be read. Make sure it's a CSV file and try again.");
    } finally {
      setBusy(false);
    }
  }, []);

  /** Replaces one cell for a row (by spreadsheet row number). Adds the column if needed. */
  const edit = useCallback((row: number, col: number, value: string) => {
    setTable((t) => {
      if (!t || col < 0) return t;
      return {
        ...t,
        records: t.records.map((r) => {
          if (r.row !== row) return r;
          const cells = [...r.cells];
          while (cells.length <= col) cells.push("");
          cells[col] = value;
          return { ...r, cells, extraCells: Math.max(0, cells.length - t.headers.length) };
        }),
      };
    });
  }, []);

  const reset = useCallback(() => { setTable(null); setFileName(null); setError(null); }, []);
  return { table, fileName, error, busy, load, edit, reset };
}

export function useBatchRunner() {
  const [phase, setPhase] = useState<BatchPhase>("idle");
  const [done, setDone] = useState(0);
  const [total, setTotal] = useState(0);
  const [message, setMessage] = useState<string | undefined>();
  const [zip, setZip] = useState<{ url: string; name: string; size: number } | null>(null);
  const ctrl = useRef<AbortController | null>(null);

  const clearZip = useCallback(() => setZip((z) => { if (z) URL.revokeObjectURL(z.url); return null; }), []);
  useEffect(() => () => { ctrl.current?.abort(); }, []);
  useEffect(() => () => { if (zip) URL.revokeObjectURL(zip.url); }, [zip]);

  const start = useCallback(async <T,>(items: T[], make: (item: T, i: number) => Promise<BatchFile>, opts: {
    zipName: string; prepare?: () => Promise<void>; extra?: (failures: { index: number; error: string }[]) => BatchFile[]; onDone?: (n: number) => void;
  }) => {
    clearZip();
    const c = new AbortController();
    ctrl.current = c;
    setTotal(items.length);
    setDone(0);
    setMessage(undefined);
    setPhase("preparing");
    try {
      await opts.prepare?.();
      if (c.signal.aborted) throw new BatchCancelled();
      setPhase("running");
      let last = 0;
      const out = await runBatch(items, make, {
        signal: c.signal,
        extra: opts.extra,
        onProgress: (d) => { const now = performance.now(); if (d === items.length || now - last > 100) { last = now; setDone(d); } },
      });
      setPhase("zipping");
      setDone(items.length);
      setZip({ url: URL.createObjectURL(out.blob), name: opts.zipName, size: out.blob.size });
      const failed = out.failures.length;
      setMessage(`${out.files} file${out.files === 1 ? "" : "s"} created in ${(out.ms / 1000).toFixed(1)} s.${failed ? ` ${failed} couldn't be created; they're listed in skipped-rows.csv inside the ZIP.` : ""}`);
      setPhase("done");
      opts.onDone?.(out.files);
    } catch (e) {
      if (e instanceof BatchCancelled) { setPhase("cancelled"); setMessage("Generation cancelled. No ZIP file was created."); }
      else { setPhase("error"); setMessage(e instanceof Error && e.message ? `Generation failed: ${e.message}` : "Generation failed. Try a smaller batch or reload the page."); }
    } finally {
      if (ctrl.current === c) ctrl.current = null;
    }
  }, [clearZip]);

  const cancel = useCallback(() => ctrl.current?.abort(), []);
  const reset = useCallback(() => { ctrl.current?.abort(); clearZip(); setPhase("idle"); setDone(0); setTotal(0); setMessage(undefined); }, [clearZip]);
  return { phase, done, total, message, zip, start, cancel, reset, running: phase === "preparing" || phase === "running" || phase === "zipping" };
}

export const zipStamp = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
};
