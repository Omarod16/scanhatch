import { userMessage } from "@/lib/errors";
/**
 * Runs a batch: produces one file per item, streams it into a ZIP, reports
 * progress, yields to keep the page responsive, and can be cancelled safely
 * (a cancelled batch produces no ZIP at all, never a partial one).
 */
import { createZip } from "./zip";

export interface BatchFile {
  name: string;
  data: Uint8Array;
  compress: boolean;
}

export interface BatchOutcome {
  blob: Blob;
  files: number;
  failures: { index: number; error: string }[];
  ms: number;
}

export class BatchCancelled extends Error {
  constructor() { super("Cancelled"); }
}

const yieldToBrowser = () => new Promise<void>((r) => setTimeout(r, 0));

export async function runBatch<T>(
  items: T[],
  make: (item: T, index: number) => Promise<BatchFile>,
  opts: { signal: AbortSignal; onProgress: (done: number, total: number) => void; extra?: (failures: { index: number; error: string }[]) => BatchFile[] }
): Promise<BatchOutcome> {
  const t0 = performance.now();
  const zip = await createZip();
  const failures: { index: number; error: string }[] = [];
  let files = 0;
  let lastYield = performance.now();
  try {
    for (let i = 0; i < items.length; i++) {
      if (opts.signal.aborted) throw new BatchCancelled();
      try {
        const f = await make(items[i], i);
        zip.add(f.name, f.data, f.compress);
        files++;
      } catch (e) {
        failures.push({ index: i, error: userMessage(e, "Couldn't create this file.") });
      }
      opts.onProgress(i + 1, items.length);
      if (performance.now() - lastYield > 24) { await yieldToBrowser(); lastYield = performance.now(); }
    }
    if (opts.signal.aborted) throw new BatchCancelled();
    for (const f of opts.extra?.(failures) ?? []) zip.add(f.name, f.data, f.compress);
    const blob = await zip.finish();
    return { blob, files, failures, ms: performance.now() - t0 };
  } catch (e) {
    zip.abort();
    throw e;
  }
}
