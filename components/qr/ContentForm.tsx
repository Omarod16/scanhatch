"use client";

import { useId, useState } from "react";
import type { ContentType, FieldDef, FieldValue, Values } from "@/lib/qr/content";

function Field({
  def, value, error, onChange, onBlur,
}: { def: FieldDef; value: FieldValue | undefined; error?: string; onChange: (v: FieldValue) => void; onBlur: () => void }) {
  const id = useId();
  const errId = `${id}-err`;
  const hintId = `${id}-hint`;
  const describedBy = [error ? errId : "", def.hint ? hintId : ""].filter(Boolean).join(" ") || undefined;
  const str = typeof value === "string" ? value : "";

  if (def.kind === "checkbox") {
    return (
      <div className="sm:col-span-2">
        <label htmlFor={id} className="flex min-h-10 cursor-pointer items-center gap-3">
          <input id={id} type="checkbox" checked={value === true} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5 accent-cyan" aria-describedby={describedBy} />
          <span className="text-sm font-semibold text-fog">{def.label}</span>
        </label>
        {def.hint && <p id={hintId} className="hint pl-8">{def.hint}</p>}
      </div>
    );
  }

  const common = {
    id,
    className: "input",
    value: str,
    onBlur,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    "aria-required": def.required || undefined,
  } as const;

  let control;
  if (def.kind === "textarea") {
    control = <textarea {...common} rows={4} maxLength={def.maxLength} placeholder={def.placeholder} onChange={(e) => onChange(e.target.value)} />;
  } else if (def.kind === "select") {
    control = (
      <select {...common} onChange={(e) => onChange(e.target.value)}>
        {def.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    );
  } else {
    const type =
      def.kind === "datetime" ? "datetime-local"
      : def.kind === "number" ? "text"
      : def.kind === "password" ? "text"
      : def.kind;
    control = (
      <input
        {...common}
        type={type}
        inputMode={def.inputMode}
        autoComplete={def.autoComplete ?? (def.kind === "password" ? "off" : undefined)}
        spellCheck={def.kind === "text" ? undefined : false}
        maxLength={def.maxLength}
        placeholder={def.placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  return (
    <div className={def.half ? "" : "sm:col-span-2"}>
      <label htmlFor={id} className="label">
        {def.label}
        {def.required && <span className="text-cyan" aria-hidden="true"> *</span>}
      </label>
      {control}
      {error ? <p id={errId} className="field-error" role="alert">{error}</p> : def.hint ? <p id={hintId} className="hint">{def.hint}</p> : null}
    </div>
  );
}

export function ContentForm({
  type, values, errors, onChange,
}: { type: ContentType; values: Values; errors: Record<string, string>; onChange: (name: string, v: FieldValue) => void }) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [geo, setGeo] = useState<{ busy: boolean; msg: string | null }>({ busy: false, msg: null });

  const visible = type.fields.filter((f) => !f.showIf || f.showIf(values));

  const locate = () => {
    if (!("geolocation" in navigator)) {
      setGeo({ busy: false, msg: "Location isn't available in this browser." });
      return;
    }
    setGeo({ busy: true, msg: null });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (type.id === "maps") onChange("mode", "coords");
        onChange("lat", pos.coords.latitude.toFixed(6));
        onChange("lng", pos.coords.longitude.toFixed(6));
        setGeo({ busy: false, msg: "Location filled in. It stays on this device." });
      },
      (err) =>
        setGeo({
          busy: false,
          msg: err.code === err.PERMISSION_DENIED ? "Location permission was denied. You can type coordinates instead." : "Your location couldn't be found. You can type coordinates instead.",
        }),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div>
      <p className="mb-5 text-sm text-mist">{type.description}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {visible.map((def) => (
          <Field
            key={`${type.id}-${def.name}`}
            def={def}
            value={values[def.name]}
            error={touched[def.name] || (typeof values[def.name] === "string" && (values[def.name] as string).length > 0) ? errors[def.name] : undefined}
            onChange={(v) => onChange(def.name, v)}
            onBlur={() => setTouched((t) => ({ ...t, [def.name]: true }))}
          />
        ))}
      </div>
      {type.geolocate && (
        <div className="mt-4">
          <button type="button" className="btn-secondary" onClick={locate} disabled={geo.busy}>
            {geo.busy ? "Finding your location…" : "Use my current location"}
          </button>
          <p className="hint" role="status">{geo.msg}</p>
        </div>
      )}
    </div>
  );
}
