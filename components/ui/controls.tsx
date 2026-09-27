"use client";

import { useId, type ReactNode } from "react";
import { HEX_RE } from "@/lib/qr/color";

export function ColorField({ label, value, onChange, disabled }: { label: string; value: string; onChange: (v: string) => void; disabled?: boolean }) {
  const id = useId();
  const valid = HEX_RE.test(value);
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label} picker`}
          value={valid ? value : "#000000"}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-12 shrink-0 cursor-pointer rounded-lg border border-line-2 bg-ink-2 p-1 disabled:opacity-50"
        />
        <input
          id={id}
          className="input font-mono uppercase"
          value={value}
          disabled={disabled}
          maxLength={7}
          spellCheck={false}
          aria-invalid={!valid}
          onChange={(e) => {
            const v = e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`;
            onChange(v);
          }}
        />
      </div>
      {!valid && <p className="field-error">Use a 6-digit hex colour, e.g. #0B1620.</p>}
    </div>
  );
}

export function Segmented<T extends string>({
  label, value, options, onChange, columns,
}: { label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; columns?: number }) {
  const name = useId();
  return (
    <fieldset>
      <legend className="label">{label}</legend>
      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${columns ?? Math.min(options.length, 4)}, minmax(0, 1fr))` }}>
        {options.map((o) => (
          <label key={o.value} className="relative">
            <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} className="peer sr-only" />
            <span className="flex min-h-10 cursor-pointer items-center justify-center rounded-lg border border-line-2 bg-ink-2 px-2 text-center text-sm text-fog peer-checked:border-cyan peer-checked:bg-cyan/10 peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-cyan hover:border-cyan/50">
              {o.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: ReactNode }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="flex min-h-10 cursor-pointer items-center gap-3">
        <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5 shrink-0 cursor-pointer accent-cyan" />
        <span className="text-sm font-semibold text-fog">{label}</span>
      </label>
      {hint && <p className="hint -mt-1 pl-8">{hint}</p>}
    </div>
  );
}

export function Range({
  label, value, min, max, step = 1, onChange, format,
}: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; format?: (v: number) => string }) {
  const id = useId();
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-fog">{label}</label>
        <output htmlFor={id} className="text-sm tabular-nums text-white">{format ? format(value) : value}</output>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="h-2 w-full cursor-pointer accent-cyan" />
    </div>
  );
}

export function SelectField<T extends string>({ label, value, options, onChange, hint }: { label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; hint?: string }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <select id={id} className="input" value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}

export function PanelHeading({ children }: { children: ReactNode }) {
  return <h3 className="text-sm font-bold text-white">{children}</h3>;
}
