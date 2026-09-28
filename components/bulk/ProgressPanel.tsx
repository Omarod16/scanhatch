"use client";

import { useEffect, useRef, useState } from "react";

export type BatchPhase = "idle" | "preparing" | "running" | "zipping" | "done" | "cancelled" | "error";

export function ProgressPanel({ phase, done, total, onCancel, message }: {
  phase: BatchPhase; done: number; total: number; onCancel: () => void; message?: string;
}) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  // Announce at milestones only, so screen readers aren't flooded.
  const [announce, setAnnounce] = useState("");
  const lastMilestone = useRef(-1);
  useEffect(() => {
    if (phase === "preparing") { lastMilestone.current = -1; setAnnounce("Preparing…"); }
    else if (phase === "running") {
      const m = Math.floor(pct / 25) * 25;
      if (m !== lastMilestone.current) { lastMilestone.current = m; setAnnounce(`Generating: ${m}% done`); }
    } else if (phase === "zipping") setAnnounce("Creating ZIP file…");
    else if (phase === "done") setAnnounce("Complete. Your ZIP file is ready to download.");
    else if (phase === "cancelled") setAnnounce("Generation cancelled. No ZIP file was created.");
    else if (phase === "error") setAnnounce(message ?? "Generation failed.");
  }, [phase, pct, message]);

  if (phase === "idle") return null;
  const label = phase === "preparing" ? "Preparing…" : phase === "running" ? `Generating ${done}/${total}` : phase === "zipping" ? "Creating ZIP file…"
    : phase === "done" ? "Complete" : phase === "cancelled" ? "Cancelled" : "Failed";
  return (
    <div className="rounded-xl border border-line bg-ink-2 p-4">
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-white" aria-hidden="true">{label}</span>
        <span className="font-mono text-mist" aria-hidden="true">{pct}%</span>
      </div>
      <div role="progressbar" aria-label="Generation progress" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done} aria-valuetext={`${done} of ${total}`}
        className="h-2.5 overflow-hidden rounded-full bg-panel">
        <div className={`h-full rounded-full ${phase === "cancelled" || phase === "error" ? "bg-danger" : phase === "done" ? "bg-ok" : "bg-cyan"}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="sr-only" aria-live="polite">{announce}</p>
      {message && phase !== "running" && <p className={`mt-2 text-sm ${phase === "error" || phase === "cancelled" ? "text-red-200" : "text-fog"}`}>{message}</p>}
      {(phase === "running" || phase === "preparing") && (
        <button type="button" className="btn-secondary mt-3 min-h-10" onClick={onCancel}>Cancel generation</button>
      )}
    </div>
  );
}
