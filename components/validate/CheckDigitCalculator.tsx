"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useState } from "react";
import { Segmented } from "@/components/ui/controls";
import { track } from "@/lib/analytics";
import { gs1CheckDigitSteps } from "@/lib/barcode/checkdigit";
import { copyText } from "@/lib/downloads/export";
import { CheckDigitTable } from "./CheckDigitTable";

type CalcFormat = "ean13" | "ean8" | "upca" | "itf14";
const FORMATS: { value: CalcFormat; label: string; len: number }[] = [
  { value: "ean13", label: "EAN-13", len: 13 },
  { value: "ean8", label: "EAN-8", len: 8 },
  { value: "upca", label: "UPC-A", len: 12 },
  { value: "itf14", label: "ITF-14", len: 14 },
];
const EXAMPLES: Record<CalcFormat, string> = { ean13: "400638133393", ean8: "9638507", upca: "03600029145", itf14: "1540014128876" };

export function CheckDigitCalculator() {
  const id = useId();
  const [format, setFormat] = useState<CalcFormat>("ean13");
  const [raw, setRaw] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const f = FORMATS.find((x) => x.value === format)!;

  useEffect(() => {
    const read = () => {
      const k = window.location.hash.slice(1);
      if (FORMATS.some((x) => x.value === k)) setFormat(k as CalcFormat);
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  const v = raw.replace(/[\s-]/g, "");
  const state = useMemo(() => {
    if (!v) return { kind: "empty" as const };
    if (!/^\d+$/.test(v)) return { kind: "error" as const, message: `Only digits (0–9) can be used. Remove ${[...new Set(v.replace(/\d/g, ""))].map((c) => `"${c}"`).join(", ")}.` };
    if (v.length === f.len - 1) return { kind: "calc" as const, steps: gs1CheckDigitSteps(v) };
    if (v.length === f.len) {
      const steps = gs1CheckDigitSteps(v.slice(0, -1));
      return { kind: "full" as const, steps, given: Number(v.at(-1)) };
    }
    return { kind: "error" as const, message: `${f.label} needs ${f.len - 1} digits before the check digit. You've entered ${v.length}.` };
  }, [v, f]);

  useEffect(() => {
    if (state.kind === "calc") track("validator_used", { tool: "check-digit", format, valid: true });
  }, [state.kind, format]);

  const copy = async (t: string) => { try { await copyText(t); setStatus("Copied."); } catch { setStatus("Copying isn't available here."); } };

  return (
    <div>
      <div className="space-y-5 rounded-2xl border border-line bg-ink-2 p-4 sm:p-6">
        <Segmented<CalcFormat> label="Format" value={format} onChange={(x) => { setFormat(x); setStatus(null); }} options={FORMATS.map(({ value, label }) => ({ value, label }))} columns={4} />
        <div>
          <label htmlFor={`${id}-d`} className="label">Digits (without the check digit)</label>
          <input id={`${id}-d`} className="input font-mono" inputMode="numeric" autoComplete="off" value={raw} placeholder={EXAMPLES[format]}
            aria-describedby={`${id}-h`} aria-invalid={state.kind === "error" || undefined} onChange={(e) => { setRaw(e.target.value); setStatus(null); }} />
          <div id={`${id}-h`}>
            {state.kind === "error" ? <p className="field-error" role="alert">{state.message}</p>
              : <p className="hint">Enter the first {f.len - 1} digits of the {f.label}. Spaces and hyphens are ignored.</p>}
          </div>
          {!raw && <button type="button" className="btn-ghost mt-2 min-h-9 px-2 text-sm" onClick={() => setRaw(EXAMPLES[format])}>Use an example</button>}
        </div>
      </div>

      <div aria-live="polite" className="mt-6">
        {state.kind === "calc" && (
          <section aria-label="Result" className="rounded-2xl border border-cyan/40 bg-ink-2 p-4 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold text-mist">Check digit</p>
                <p className="font-mono text-4xl font-bold text-cyan">{state.steps.check}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-mist">Complete {f.label}</p>
                <p className="font-mono text-2xl break-all text-white">{state.steps.body}<span className="text-cyan">{state.steps.check}</span></p>
              </div>
            </div>
            <h3 className="mt-6 mb-3 text-sm font-bold text-white">How it was calculated</h3>
            <CheckDigitTable steps={state.steps} caption={`${f.label} check digit calculation`} />
            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" className="btn-secondary" onClick={() => copy(state.steps.body + state.steps.check)}>Copy {f.label}</button>
              <Link href={`/barcode-generator/#${format}:${state.steps.body}${state.steps.check}`} className="btn-ghost">Create this barcode</Link>
            </div>
            <p role="status" className="mt-2 min-h-5 text-sm text-mist">{status}</p>
          </section>
        )}
        {state.kind === "full" && (
          <section aria-label="Result" className={`rounded-2xl border p-4 sm:p-6 ${state.steps.check === state.given ? "border-ok/50" : "border-danger/50"} bg-ink-2`}>
            <p className="text-white">
              That&apos;s {f.len} digits, a complete {f.label} including its check digit.{" "}
              {state.steps.check === state.given
                ? <strong className="text-ok">The check digit {state.given} is correct.</strong>
                : <strong className="text-danger">The check digit is wrong: it should be {state.steps.check}, not {state.given}.</strong>}
            </p>
            <div className="mt-4"><CheckDigitTable steps={state.steps} /></div>
            <p className="mt-3 text-sm text-fog">For a full check, use the <Link href={`/barcode-validator/#${format}`} className="text-cyan underline underline-offset-2">Barcode Validator</Link>.</p>
          </section>
        )}
      </div>
    </div>
  );
}
