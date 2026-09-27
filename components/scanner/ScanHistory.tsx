"use client";

import { useState } from "react";
import { copyText } from "@/lib/downloads/export";
import { httpUrl, maskSecrets } from "@/lib/scanner/parse";
import type { HistoryEntry } from "@/lib/scanner/history";

export function ScanHistory({ entries, onRemove, onClear }: { entries: HistoryEntry[]; onRemove: (id: string) => void; onClear: () => void }) {
  const [status, setStatus] = useState<string | null>(null);
  return (
    <section aria-labelledby="scan-history" className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="scan-history" className="text-lg font-bold text-white">Scan history</h2>
        {entries.length > 0 && <button type="button" className="btn-ghost min-h-9 px-3 text-sm" onClick={() => { onClear(); setStatus("History cleared."); }}>Clear history</button>}
      </div>
      <p className="mt-1 text-sm text-mist">Kept only in this browser tab and deleted when you close it. Nothing is sent to ScanHatch.</p>
      {entries.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-line p-4 text-sm text-mist">No scans yet in this session.</p>
      ) : (
        <ul className="mt-4 divide-y divide-line rounded-xl border border-line bg-ink-2">
          {entries.map((e) => {
            const url = httpUrl(e.value);
            const shown = maskSecrets(e.value);
            return (
              <li key={e.id} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-mist">
                    <time dateTime={new Date(e.at).toISOString()}>{new Date(e.at).toLocaleTimeString()}</time> · {e.format} · {e.source === "camera" ? "Camera" : "Image"}
                  </p>
                  <p className="truncate font-mono text-sm text-white" title={shown}>{shown.length > 120 ? `${shown.slice(0, 120)}…` : shown}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button type="button" className="btn-ghost min-h-9 px-3 text-sm" onClick={async () => { try { await copyText(e.value); setStatus("Copied."); } catch { setStatus("Copy failed."); } }}>
                    Copy<span className="sr-only"> {shown.slice(0, 40)}</span>
                  </button>
                  {url && (
                    <a href={url.href} target="_blank" rel="noopener noreferrer nofollow" className="btn-ghost min-h-9 px-3 text-sm">
                      Open<span className="sr-only"> {url.hostname} in a new tab</span>
                    </a>
                  )}
                  <button type="button" className="btn-ghost min-h-9 px-3 text-sm text-mist" onClick={() => { onRemove(e.id); setStatus("Removed."); }}>
                    Remove<span className="sr-only"> this scan</span>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <p role="status" aria-live="polite" className="mt-2 min-h-5 text-sm text-mist">{status}</p>
    </section>
  );
}
