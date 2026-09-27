"use client";

import { useId, useRef, type ReactNode } from "react";

export interface TabDef {
  id: string;
  label: string;
  content: ReactNode;
  badge?: ReactNode;
}

/** Accessible tabs following the WAI-ARIA tabs pattern (manual activation via arrows). */
export function Tabs({ tabs, active, onChange, label }: { tabs: TabDef[]; active: string; onChange: (id: string) => void; label: string }) {
  const base = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: React.KeyboardEvent, i: number) => {
    let next = -1;
    if (e.key === "ArrowRight") next = (i + 1) % tabs.length;
    if (e.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = tabs.length - 1;
    if (next >= 0) {
      e.preventDefault();
      onChange(tabs[next].id);
      refs.current[next]?.focus();
    }
  };

  return (
    <div>
      <div role="tablist" aria-label={label} className="flex gap-1 overflow-x-auto border-b border-line [scrollbar-width:none]">
        {tabs.map((t, i) => {
          const selected = t.id === active;
          return (
            <button
              key={t.id}
              ref={(el) => { refs.current[i] = el; }}
              role="tab"
              type="button"
              id={`${base}-tab-${t.id}`}
              aria-selected={selected}
              aria-controls={`${base}-panel-${t.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(t.id)}
              onKeyDown={(e) => onKey(e, i)}
              className={`-mb-px flex min-h-11 shrink-0 items-center gap-1.5 border-b-2 px-2.5 text-sm sm:px-3.5 font-semibold ${selected ? "border-cyan text-white" : "border-transparent text-mist hover:text-white"}`}
            >
              {t.label}
              {t.badge}
            </button>
          );
        })}
      </div>
      {tabs.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`${base}-panel-${t.id}`}
          aria-labelledby={`${base}-tab-${t.id}`}
          hidden={t.id !== active}
          tabIndex={0}
          className="pt-6 focus-visible:outline-offset-4"
        >
          {t.id === active && t.content}
        </div>
      ))}
    </div>
  );
}
