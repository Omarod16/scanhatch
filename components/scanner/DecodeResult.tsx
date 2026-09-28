"use client";

import { useState } from "react";
import { copyText } from "@/lib/downloads/export";
import type { NormalisedResult } from "@/lib/scanner/formats";
import { isQrFormat } from "@/lib/scanner/formats";
import { parsePayload } from "@/lib/scanner/parse";

function Secret({ value }: { value: string }) {
  const [show, setShow] = useState(false);
  return (
    <span className="flex flex-wrap items-center gap-2">
      <span className="font-mono break-all">{show ? value : "•".repeat(Math.min(12, value.length))}</span>
      <button type="button" className="text-xs font-semibold text-cyan underline underline-offset-2" onClick={() => setShow((s) => !s)} aria-pressed={show}>
        {show ? "Hide" : "Show"}
      </button>
    </span>
  );
}

/**
 * Shows a decoded result. All decoded content is rendered as text (React escapes it).
 * Nothing is opened, called or connected automatically; every action is a button the user presses.
 */
export function DecodeResult({ result, onAgain, againLabel }: { result: NormalisedResult; onAgain?: () => void; againLabel?: string }) {
  const [status, setStatus] = useState<string | null>(null);
  const parsed = isQrFormat(result.format) ? parsePayload(result.value) : parsePayload(result.value).kind === "url" ? parsePayload(result.value) : null;

  const hasSecret = !!parsed?.fields.some((f) => f.secret && f.value);

  const copy = async (text: string, what: string) => {
    try {
      await copyText(text);
      setStatus(`${what} copied.`);
    } catch {
      setStatus("Copying isn't available here. Select the text and copy it manually.");
    }
  };

  return (
    <section aria-label="Scan result" className="rounded-2xl border border-cyan/40 bg-ink-2 p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="mr-auto text-base font-bold text-white">Code detected</h2>
        <span className="rounded-full border border-line-2 px-2.5 py-0.5 text-xs font-semibold text-fog">{result.formatLabel}</span>
        {parsed && parsed.kind !== "text" && <span className="rounded-full bg-cyan/10 px-2.5 py-0.5 text-xs font-semibold text-cyan">{parsed.title}</span>}
      </div>

      {parsed && parsed.fields.length > 0 && (
        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          {parsed.fields.map((f, i) => (
            <div key={`${f.label}-${i}`} className="contents">
              <dt className="text-mist">{f.label}</dt>
              <dd className="whitespace-pre-wrap break-words text-white">{f.secret ? <Secret value={f.value} /> : f.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-4">
        {hasSecret ? (
          <details>
            <summary className="cursor-pointer text-xs font-semibold text-mist">Show full decoded text (includes the password)</summary>
            <p className="mt-1.5 max-h-48 overflow-auto rounded-lg border border-line bg-ink px-3 py-2 font-mono text-sm whitespace-pre-wrap break-all text-white">{result.value}</p>
          </details>
        ) : (
          <>
            <p className="mb-1.5 text-xs font-semibold text-mist">{parsed?.kind === "url" ? "Decoded link" : "Decoded value"}</p>
            <p className="max-h-48 overflow-auto rounded-lg border border-line bg-ink px-3 py-2 font-mono text-sm whitespace-pre-wrap break-all text-white">{result.value}</p>
          </>
        )}
        {result.notes.map((n) => <p key={n} className="hint">{n}</p>)}
      </div>

      {parsed?.kind === "url" && (
        <p className="mt-4 rounded-lg border border-line-2 bg-panel px-3 py-2.5 text-sm text-fog">
          <span className="font-semibold text-white">Check before opening: </span>
          this link goes to <span className="font-semibold text-white">{parsed.fields[0]?.value}</span>. ScanHatch doesn&apos;t check whether links are safe.
        </p>
      )}
      {parsed?.warnings.map((w) => (
        <p key={w} className="mt-2 rounded-lg border border-warn/40 bg-warn/10 px-3 py-2.5 text-sm text-amber-100"><span className="font-semibold">Warning: </span>{w}</p>
      ))}

      <div className="mt-5 flex flex-wrap gap-2">
        {parsed?.actions.map((a) =>
          a.external ? (
            <a key={a.href} href={a.href} target="_blank" rel="noopener noreferrer nofollow" className="btn-primary">
              {a.label}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ) : (
            <a key={a.href} href={a.href} className="btn-secondary">{a.label}</a>
          )
        )}
        <button type="button" className="btn-secondary" onClick={() => copy(result.value, parsed?.kind === "url" ? "Link" : "Value")}>
          {parsed?.kind === "url" ? "Copy link" : "Copy"}
        </button>
        {parsed?.kind === "wifi" && parsed.fields.find((f) => f.secret)?.value && (
          <button type="button" className="btn-secondary" onClick={() => copy(parsed.fields.find((f) => f.secret)!.value, "Password")}>Copy password</button>
        )}
        {onAgain && <button type="button" className="btn-ghost" onClick={onAgain}>{againLabel ?? "Scan again"}</button>}
      </div>
      <p role="status" aria-live="polite" className="mt-2 min-h-5 text-sm text-mist">{status}</p>
    </section>
  );
}
