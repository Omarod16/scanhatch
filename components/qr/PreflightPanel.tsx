"use client";

import type { CheckStatus, FixTarget, PreflightReport } from "@/lib/qr/preflight";

const STATUS_TEXT: Record<CheckStatus, string> = { pass: "Passed", warn: "Check", fail: "Problem", info: "Note" };
const STATUS_COLOR: Record<CheckStatus, string> = { pass: "text-cyan", warn: "text-warn", fail: "text-danger", info: "text-sky" };

function StatusIcon({ status, className = "" }: { status: CheckStatus; className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={`h-4 w-4 shrink-0 ${STATUS_COLOR[status]} ${className}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {status === "pass" && <path d="M4.5 10.5l3.5 3.5 7.5-8" />}
      {status === "warn" && <><path d="M10 3l8 14H2z" /><path d="M10 8.5v3.5M10 14.6v.1" /></>}
      {status === "fail" && <><circle cx="10" cy="10" r="7.5" /><path d="M7 7l6 6M13 7l-6 6" /></>}
      {status === "info" && <><circle cx="10" cy="10" r="7.5" /><path d="M10 9v5M10 6.4v.1" /></>}
    </svg>
  );
}

const OVERALL: Record<PreflightReport["overall"], { status: CheckStatus; box: string }> = {
  pass: { status: "pass", box: "border-cyan/40 bg-cyan/5" },
  review: { status: "warn", box: "border-warn/40 bg-warn/5" },
  attention: { status: "fail", box: "border-danger/40 bg-danger/5" },
  empty: { status: "info", box: "border-line bg-panel" },
};

/** "QR Preflight": compact readability checklist beside the preview. Advisory, not certification. */
export function PreflightPanel({ report, onFix }: { report: PreflightReport; onFix: (target: FixTarget) => void }) {
  const o = OVERALL[report.overall];
  return (
    <section aria-labelledby="qr-preflight-h" className="mt-5 border-t border-line pt-4">
      <h3 id="qr-preflight-h" className="text-sm font-bold text-white">QR Preflight</h3>

      {report.checks.length > 0 && (
        <ul className="mt-3 space-y-2 text-sm">
          {report.checks.map((c) => (
            <li key={c.id}>
              <div className="flex items-start gap-2">
                <StatusIcon status={c.status} className="mt-0.5" />
                <span className="min-w-0">
                  <span className="sr-only">{STATUS_TEXT[c.status]}: </span>
                  <span className="text-fog">{c.label}:</span> <span className="font-semibold text-white">{c.result}</span>
                </span>
              </div>
              {c.advice && <p className="mt-0.5 pl-6 text-xs leading-snug text-mist">{c.advice}</p>}
            </li>
          ))}
        </ul>
      )}

      <div role="status" className={`mt-4 rounded-lg border px-3 py-2.5 ${o.box}`}>
        <p className="flex items-center gap-2 text-sm font-bold text-white">
          <StatusIcon status={o.status} />
          <span className="uppercase tracking-wide">{report.headline}</span>
        </p>
        <p className="mt-1 text-xs text-fog">{report.summary}</p>
        {report.firstIssue?.fix && (
          <button type="button" className="btn-secondary mt-2.5 min-h-9 px-3 text-sm" onClick={() => onFix(report.firstIssue!.fix!)}>
            Fix / adjust settings
          </button>
        )}
      </div>

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
