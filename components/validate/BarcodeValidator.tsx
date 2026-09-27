"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { SelectField, Toggle } from "@/components/ui/controls";
import { track } from "@/lib/analytics";
import { gs1CheckDigitSteps } from "@/lib/barcode/checkdigit";
import type { MsiCheck } from "@/lib/barcode/formats";
import { MSI_CHECK_LABELS } from "@/lib/barcode/msi";
import { copyText } from "@/lib/downloads/export";
import {
  DEFAULT_VALIDATOR_OPTIONS, validateBarcode, validatorFormat,
  type ValidatorFormatId, type ValidatorOptions,
} from "@/lib/validate/barcode";
import { CheckDigitTable } from "./CheckDigitTable";
import { CheckList } from "./CheckList";

const GS1_LEN: Partial<Record<ValidatorFormatId, number>> = { ean13: 13, ean8: 8, upca: 12, itf14: 14 };

export function BarcodeValidator({
  formats, initial, calculateMissingCheck = false, tool,
}: { formats: ValidatorFormatId[]; initial?: ValidatorFormatId; calculateMissingCheck?: boolean; tool: string }) {
  const id = useId();
  const [formatId, setFormatId] = useState<ValidatorFormatId>(initial ?? formats[0]);
  const [value, setValue] = useState("");
  const [opts, setOpts] = useState<ValidatorOptions>(DEFAULT_VALIDATOR_OPTIONS);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const tracked = useRef("");
  const fmt = validatorFormat(formatId)!;

  // Allow deep links such as #upca (select a format).
  useEffect(() => {
    const read = () => {
      const k = window.location.hash.slice(1);
      if (formats.includes(k as ValidatorFormatId)) setFormatId(k as ValidatorFormatId);
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, [formats]);

  const result = useMemo(() => (submitted ? validateBarcode(formatId, value, opts) : null), [submitted, formatId, value, opts]);

  // ITF-14 page: a base without the check digit is calculated rather than rejected.
  const calc = useMemo(() => {
    const len = GS1_LEN[formatId];
    const v = value.replace(/[\s-]/g, "");
    if (!submitted || !calculateMissingCheck || !len || v.length !== len - 1 || !/^\d+$/.test(v)) return null;
    return gs1CheckDigitSteps(v);
  }, [submitted, calculateMissingCheck, formatId, value]);

  useEffect(() => {
    if (!result) return;
    const key = `${formatId}:${result.valid}`;
    if (tracked.current !== key) { tracked.current = key; track("validator_used", { tool, format: formatId, valid: result.valid }); }
  }, [result, formatId, tool]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    requestAnimationFrame(() => resultRef.current?.focus());
  };

  const copy = async (text: string) => {
    try { await copyText(text); setCopied("Copied."); } catch { setCopied("Copying isn't available here."); }
  };

  const generatorLink = (v: string) => `/barcode-generator/#${formatId}:${encodeURIComponent(v)}`;
  const canLinkGenerator = !(formatId === "code39" && opts.code39HasCheck) && !(formatId === "msi" && opts.msiCheck !== "none");

  return (
    <div>
      <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-line bg-ink-2 p-4 sm:p-6" noValidate>
        {formats.length > 1 && (
          <SelectField<ValidatorFormatId>
            label="Barcode format"
            value={formatId}
            onChange={(f) => { setFormatId(f); setCopied(null); }}
            options={formats.map((f) => ({ value: f, label: validatorFormat(f)!.name }))}
          />
        )}
        <div>
          <label htmlFor={`${id}-v`} className="label">{formats.length > 1 ? "Barcode value" : `${fmt.name} number`}</label>
          <input
            id={`${id}-v`} className="input font-mono" value={value} placeholder={fmt.placeholder} autoComplete="off" spellCheck={false}
            inputMode={fmt.numeric ? "numeric" : "text"} aria-describedby={`${id}-h`}
            aria-invalid={result && !result.valid && !calc ? true : undefined}
            onChange={(e) => { setValue(e.target.value); setCopied(null); }}
          />
          <p id={`${id}-h`} className="hint">
            {calculateMissingCheck && GS1_LEN[formatId] ? `Enter ${GS1_LEN[formatId]! - 1} digits to calculate the check digit, or ${GS1_LEN[formatId]} digits to validate a complete code.` : fmt.hint}
          </p>
        </div>
        {formatId === "code39" && (
          <Toggle label="The last character is a mod 43 check character" checked={opts.code39HasCheck} onChange={(c) => setOpts((o) => ({ ...o, code39HasCheck: c }))} />
        )}
        {formatId === "msi" && (
          <SelectField<MsiCheck>
            label="Check digit type"
            value={opts.msiCheck}
            onChange={(c) => setOpts((o) => ({ ...o, msiCheck: c }))}
            options={(["mod10", "mod1010", "mod11", "mod1110", "none"] as MsiCheck[]).map((k) => ({ value: k, label: MSI_CHECK_LABELS[k] }))}
            hint="MSI has several check-digit schemes. Choose the one your system uses."
          />
        )}
        <button type="submit" className="btn-primary w-full sm:w-auto">{calculateMissingCheck ? "Validate or calculate" : "Validate"}</button>
      </form>

      <div ref={resultRef} tabIndex={-1} aria-live="polite" className="mt-6 focus:outline-none">
        {submitted && !value.trim() && <p className="field-error" role="alert">Enter a {fmt.name} value to validate.</p>}

        {calc && (
          <section aria-label="Check digit result" className="rounded-2xl border border-cyan/40 bg-ink-2 p-4 sm:p-6">
            <p className="text-xs font-semibold text-mist">CHECK DIGIT CALCULATED</p>
            <p className="mt-1 text-lg text-white">Check digit: <strong className="font-mono text-2xl text-cyan">{calc.check}</strong></p>
            <p className="mt-1 text-white">Complete {fmt.name}: <span className="font-mono text-lg">{calc.body}{calc.check}</span></p>
            <div className="mt-5"><CheckDigitTable steps={calc} /></div>
            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" className="btn-secondary" onClick={() => copy(calc.body + calc.check)}>Copy complete number</button>
              <Link href={generatorLink(calc.body + String(calc.check))} className="btn-ghost">Create this barcode</Link>
            </div>
            <p role="status" className="mt-2 min-h-5 text-sm text-mist">{copied}</p>
          </section>
        )}

        {result && !calc && (
          <section aria-label="Validation result" className={`rounded-2xl border p-4 sm:p-6 ${result.valid ? "border-ok/50" : "border-danger/50"} bg-ink-2`}>
            <div className="flex flex-wrap items-center gap-3">
              <p className={`rounded-lg px-3 py-1 text-lg font-extrabold tracking-wide ${result.valid ? "bg-ok/15 text-ok" : "bg-danger/15 text-danger"}`}>
                <span aria-hidden="true">{result.valid ? "✓ " : "✕ "}</span>{result.valid ? "VALID" : "INVALID"}
              </p>
              <p className="text-sm text-fog">
                {fmt.name} <span className="font-mono text-white break-all">{result.checked}</span>
              </p>
            </div>
            {!result.valid && (
              <div className="mt-4 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2.5 text-sm text-red-100" role="alert">
                {result.problems.map((p) => <p key={p}>{p}</p>)}
              </div>
            )}
            <div className="mt-4"><CheckList items={result.checks} label="Validation checks" /></div>
            {result.notes.length > 0 && <div className="mt-3 space-y-1">{result.notes.map((n) => <p key={n} className="text-sm text-fog">{n}</p>)}</div>}
            {result.facts.length > 0 && (
              <dl className="mt-4 grid gap-x-4 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
                {result.facts.map((f) => (
                  <div key={f.label} className="contents">
                    <dt className="font-semibold text-mist">{f.label}</dt>
                    <dd className="text-white">{f.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            {result.steps && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-semibold text-cyan">Show the check digit calculation</summary>
                <div className="mt-3"><CheckDigitTable steps={result.steps} /></div>
              </details>
            )}
            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" className="btn-secondary" onClick={() => copy(result.checked)}>Copy value</button>
              {result.valid && canLinkGenerator && <Link href={generatorLink(result.checked)} className="btn-ghost">Create this barcode</Link>}
              {!result.valid && GS1_LEN[formatId] && <Link href={`/check-digit-calculator/#${formatId}`} className="btn-ghost">Open the check digit calculator</Link>}
            </div>
            <p role="status" className="mt-2 min-h-5 text-sm text-mist">{copied}</p>
          </section>
        )}
      </div>
    </div>
  );
}
