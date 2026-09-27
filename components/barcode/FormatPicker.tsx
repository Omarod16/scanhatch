"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { BARCODE_FORMATS, GROUP_LABELS, type BarcodeFormatId, type FormatGroup } from "@/lib/barcode/formats";

const KEYWORDS: Partial<Record<BarcodeFormatId, string>> = {
  ean13: "gtin isbn retail product shop europe",
  ean8: "gtin retail small",
  upca: "gtin retail usa america canada",
  upce: "gtin retail small usa",
  itf14: "gtin carton case shipping outer",
  itf: "interleaved 2 of 5 i2of5 carton",
  code128: "shipping label inventory",
  code39: "logmars industrial badge",
  codabar: "library nw-7",
  msi: "plessey shelf",
  pharmacode: "laetus pharma",
  datamatrix: "2d square",
  pdf417: "2d id boarding",
  aztec: "2d ticket",
};

const ORDER: FormatGroup[] = ["retail", "logistics", "general", "specialist", "2d"];

export function FormatPicker({ value, onChange }: { value: BarcodeFormatId; onChange: (id: BarcodeFormatId) => void }) {
  const searchId = useId();
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return BARCODE_FORMATS;
    return BARCODE_FORMATS.filter((f) => `${f.name} ${f.id} ${f.summary} ${KEYWORDS[f.id] ?? ""}`.toLowerCase().includes(t));
  }, [q]);

  return (
    <div>
      <label htmlFor={searchId} className="label">Barcode format</label>
      <input
        id={searchId}
        type="search"
        className="input"
        placeholder="Search formats, e.g. EAN, carton, 2D"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-controls="barcode-format-list"
        autoComplete="off"
      />
      <fieldset id="barcode-format-list" className="mt-3 max-h-64 overflow-y-auto rounded-xl border border-line bg-ink-2 p-2">
        <legend className="sr-only">Choose a barcode format</legend>
        {filtered.length === 0 && <p className="p-3 text-sm text-mist" role="status">No format matches &ldquo;{q}&rdquo;.</p>}
        {ORDER.map((g) => {
          const items = filtered.filter((f) => f.group === g);
          if (!items.length) return null;
          return (
            <div key={g} className="mb-2 last:mb-0">
              <p className="px-2 pt-2 pb-1 text-xs font-semibold text-mist" aria-hidden="true">{GROUP_LABELS[g]}</p>
              {items.map((f) => (
                <label key={f.id} className="relative block">
                  <input type="radio" name="barcode-format" value={f.id} checked={value === f.id} onChange={() => onChange(f.id)} className="peer sr-only" />
                  <span className="block cursor-pointer rounded-lg border border-transparent px-3 py-2.5 peer-checked:border-cyan peer-checked:bg-cyan/10 peer-focus-visible:outline-2 peer-focus-visible:outline-cyan hover:bg-panel">
                    <span className="block text-sm font-semibold text-white">{f.name}</span>
                    <span className="block text-xs leading-snug text-mist">{f.summary}</span>
                  </span>
                </label>
              ))}
            </div>
          );
        })}
      </fieldset>
      <p className="hint">
        Need a QR code? Use the <Link href="/qr-code-generator/" className="text-cyan underline underline-offset-2">QR Code Generator</Link>, which adds styling and logos.
      </p>
    </div>
  );
}
