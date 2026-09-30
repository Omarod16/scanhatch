"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { BARCODE_FORMATS, GROUP_LABELS, type BarcodeFormatId, type FormatGroup } from "@/lib/barcode/formats";

const ORDER: FormatGroup[] = ["retail", "logistics", "general", "specialist", "2d"];
const TIP_WIDTH = 240;

interface Tip { id: BarcodeFormatId; left: number; top: number; width: number }

/**
 * Barcode format picker: grouped radio buttons. Each format's explanation appears in a
 * small popup on hover, keyboard focus or tap, and is always available to screen readers
 * through aria-describedby.
 */
export function FormatPicker({ value, onChange }: { value: BarcodeFormatId; onChange: (id: BarcodeFormatId) => void }) {
  const uid = useId();
  const boxRef = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<Tip | null>(null);
  const hideTimer = useRef<number | null>(null);
  const tipId = useRef<BarcodeFormatId | null>(null);   // which option the popup currently belongs to
  const touchUntil = useRef(0);                          // a recent tap keeps the 3-second auto-hide

  const cancelHide = () => { if (hideTimer.current !== null) { window.clearTimeout(hideTimer.current); hideTimer.current = null; } };
  const hideSoon = useCallback((ms = 120) => { cancelHide(); hideTimer.current = window.setTimeout(() => setTip(null), ms); }, []);
  useEffect(() => () => cancelHide(), []);

  const show = useCallback((id: BarcodeFormatId, el: HTMLElement) => {
    const box = boxRef.current;
    if (!box) return;
    cancelHide();
    const b = box.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const width = Math.min(TIP_WIDTH, b.width);
    // Centre over the option, but keep the popup inside the picker so it never overflows the screen.
    const left = Math.max(0, Math.min(r.left - b.left + r.width / 2 - width / 2, b.width - width));
    tipId.current = id;
    setTip({ id, left, top: r.top - b.top - 8, width });
  }, []);

  const tipFormat = tip ? BARCODE_FORMATS.find((f) => f.id === tip.id) : undefined;

  return (
    <div>
      <div ref={boxRef} className="relative" onKeyDown={(e) => { if (e.key === "Escape") setTip(null); }}>
        <fieldset>
          <legend className="label">Barcode format</legend>
          {ORDER.map((g) => {
            const items = BARCODE_FORMATS.filter((f) => f.group === g);
            if (!items.length) return null;
            const groupId = `${uid}-g-${g}`;
            return (
              <div key={g} role="group" aria-labelledby={groupId} className="mt-3 first-of-type:mt-1">
                <p id={groupId} className="mb-1.5 text-xs font-semibold text-mist">{GROUP_LABELS[g]}</p>
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                  {items.map((f) => {
                    const descId = `${uid}-d-${f.id}`;
                    return (
                      <label
                        key={f.id}
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-line px-2.5 py-1.5 text-sm font-semibold text-white hover:bg-panel has-[:checked]:border-cyan has-[:checked]:bg-cyan/10 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-cyan"
                        onPointerEnter={(e) => { if (e.pointerType === "mouse") show(f.id, e.currentTarget); }}
                        onPointerLeave={(e) => { if (e.pointerType === "mouse") hideSoon(); }}
                        onPointerDown={(e) => { if (e.pointerType !== "mouse") { touchUntil.current = Date.now() + 800; show(f.id, e.currentTarget); hideSoon(3000); } }}
                      >
                        <input
                          type="radio"
                          name="barcode-format"
                          value={f.id}
                          checked={value === f.id}
                          onChange={() => onChange(f.id)}
                          onFocus={(e) => { show(f.id, e.currentTarget.parentElement as HTMLElement); if (Date.now() < touchUntil.current) hideSoon(3000); }}
                          onBlur={() => { if (tipId.current === f.id) hideSoon(); }}
                          aria-describedby={descId}
                          className="size-3.5 shrink-0 accent-cyan"
                        />
                        <FormatName name={f.name} />
                        <span id={descId} className="sr-only">{f.summary}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </fieldset>
        {tip && tipFormat && (
          <div
            aria-hidden="true"
            data-format-tip={tip.id}
            className="absolute z-20 -translate-y-full rounded-lg border border-line-2 bg-ink px-3 py-2 text-xs leading-snug text-fog shadow-lg"
            style={{ left: tip.left, top: tip.top, width: tip.width }}
            onPointerEnter={(e) => { if (e.pointerType === "mouse") cancelHide(); }}
            onPointerLeave={(e) => { if (e.pointerType === "mouse") hideSoon(); }}
          >
            <span className="font-semibold text-white">{tipFormat.name}: </span>{tipFormat.summary}
          </div>
        )}
      </div>
    </div>
  );
}

/** Shows a bracketed alias, e.g. "(Interleaved 2 of 5)", in smaller, lighter text after the main name. */
function FormatName({ name }: { name: string }) {
  const m = name.match(/^(.*?)\s*(\(.+\))$/);
  if (!m) return <span>{name}</span>;
  return (
    <span>
      {m[1]} <span className="text-xs font-medium text-fog">{m[2]}</span>
    </span>
  );
}
