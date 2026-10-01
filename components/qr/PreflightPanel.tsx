"use client";

import type { CheckStatus, FixTarget, PreflightReport } from "@/lib/qr/preflight";

/** Green for passes (and neutral notes), red for anything that needs attention. */
const isIssue = (s: CheckStatus) => s === "warn" || s === "fail";
const SR_TEXT: Record<CheckStatus, string> = { pass: "Passed", info: "Note", warn: "Issue", fail: "Issue" };

function StatusIcon({ status, className = "" }: { status: CheckStatus; className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={`h-4 w-4 shrink-0 ${isIssue(status) ? "text-danger" : "text-ok"} ${className}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {status === "pass" && <path d="M4.5 10.5l3.5 3.5 7.5-8" />}
      {status === "warn" && <><path d="M10 3l8 14H2z" /><path d="M10 8.5v3.5M10 14.6v.1" /></>}
      {status === "fail" && <><circle cx="10" cy="10" r="7.5" /><path d="M7 7l6 6M13 7l-6 6" /></>}
      {status === "info" && <><circle cx="10" cy="10" r="7.5" /><path d="M10 9v5M10 6.4v.1" /></>}
    </svg>
  );
}

/** Compact result shown next to the Preview title: green "QR READY" or red with the number of issues. */
export function PreflightBadge({ report }: { report: PreflightReport }) {
  const issues = report.checks.filter((c) => isIssue(c.status)).length;
  if (report.overall === "empty") {
    return <p role="status" className="text-xs text-mist">Waiting for content</p>;
  }
  const ok = issues === 0;
  return (
    <p role="status" className={`flex flex-wrap items-center gap-x-2 gap-y-0.5 rounded-lg border px-3 py-1.5 text-xs ${ok ? "border-ok/40 bg-ok/10" : "border-danger/40 bg-danger/10"}`}>
      <StatusIcon status={ok ? "pass" : "fail"} className="h-3.5 w-3.5" />
      <span className={`whitespace-nowrap font-bold uppercase tracking-wide ${ok ? "text-ok" : "text-danger"}`}>{ok ? "QR ready" : `${issues} ${issues === 1 ? "issue" : "issues"}`}</span>
      <span className="text-fog">{ok ? "All current preflight checks passed." : "See QR Preflight for details."}</span>
    </p>
  );
}

/** QR Preflight checklist box: one row per check, green when it passes, red when it needs attention. Advisory, not certification. */
export function PreflightPanel({ report, onFix }: { report: PreflightReport; onFix: (target: FixTarget) => void }) {
  return (
    <section aria-labelledby="qr-preflight-h" className="rounded-xl border border-line bg-ink-2 p-4 sm:p-5">
      <h2 id="qr-preflight-h" className="text-sm font-bold text-white">QR Preflight</h2>

      {report.checks.length === 0 ? (
        <p className="mt-2 text-sm text-mist">{report.summary}</p>
      ) : (
        <ul className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          {report.checks.filter((c) => !(c.id === "quiet-zone" && c.status === "pass")).map((c) => (
            <li key={c.id}>
              <div className="flex items-start gap-2">
                <StatusIcon status={c.status} className="mt-0.5" />
                <span className="min-w-0">
                  <span className="sr-only">{SR_TEXT[c.status]}: </span>
                  <span className={isIssue(c.status) ? "text-danger" : "text-fog"}>{c.label}:</span>{" "}
                  <span className={`font-semibold ${isIssue(c.status) ? "text-danger" : "text-white"}`}>{c.result}</span>
                </span>
              </div>
              {c.advice && <p className="mt-0.5 pl-6 text-xs leading-snug text-mist">{c.advice}</p>}
            </li>
          ))}
        </ul>
      )}

      {report.firstIssue?.fix && (
        <button type="button" className="btn-secondary mt-4 min-h-9 px-3 text-sm" onClick={() => onFix(report.firstIssue!.fix!)}>
          Fix / adjust settings
        </button>
      )}

      {report.checks.length > 0 && (
        <details className="mt-3 text-xs text-mist">
          <summary className="cursor-pointer select-none font-semibold text-fog hover:text-white">Details</summary>
          <dl className="mt-2 space-y-2">
            {report.checks.map((c) => (
              <div key={c.id}>
                <dt className="font-semibold text-fog">{c.label}</dt>
                <dd className="leading-snug">{c.help}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 leading-snug">Preflight is guidance based on your settings, not a guarantee. Always test a printed code with the phones your audience will use.</p>
        </details>
      )}
    </section>
  );
}
