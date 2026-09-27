"use client";

import { CONTENT_TYPES, type ContentTypeId } from "@/lib/qr/content";

export function ContentTypePicker({ value, onChange }: { value: ContentTypeId; onChange: (id: ContentTypeId) => void }) {
  return (
    <fieldset>
      <legend className="label">What should the code do?</legend>
      <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
        {CONTENT_TYPES.map((t) => (
          <label key={t.id} className="relative">
            <input type="radio" name="qr-content-type" value={t.id} checked={value === t.id} onChange={() => onChange(t.id)} className="peer sr-only" />
            <span
              title={t.description}
              className="flex min-h-11 cursor-pointer items-center justify-center rounded-lg border border-line-2 bg-ink-2 px-2 text-center text-sm font-medium text-fog peer-checked:border-cyan peer-checked:bg-cyan/10 peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-cyan hover:border-cyan/50"
            >
              {t.short}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
