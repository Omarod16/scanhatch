export type ItemStatus = "pass" | "fail" | "warn" | "info" | "skip";
export interface CheckItem {
  status: ItemStatus;
  label: string;
  detail?: string;
}

const STYLE: Record<ItemStatus, { icon: string; text: string; cls: string }> = {
  pass: { icon: "✓", text: "Passed", cls: "text-ok" },
  fail: { icon: "✕", text: "Failed", cls: "text-danger" },
  warn: { icon: "!", text: "Warning", cls: "text-warn" },
  info: { icon: "i", text: "Note", cls: "text-sky" },
  skip: { icon: "–", text: "Not checked", cls: "text-mist" },
};

/** A list of checks. Status is conveyed by an icon AND text, never colour alone. */
export function CheckList({ items, label }: { items: CheckItem[]; label: string }) {
  return (
    <ul className="space-y-2" aria-label={label}>
      {items.map((c, i) => {
        const s = STYLE[c.status];
        return (
          <li key={`${c.label}-${i}`} className="flex gap-3 rounded-lg border border-line bg-ink px-3 py-2.5 text-sm">
            <span aria-hidden="true" className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold ${s.cls}`}>{s.icon}</span>
            <span className="min-w-0">
              <span className="sr-only">{s.text}: </span>
              <span className={`font-semibold ${c.status === "skip" ? "text-mist" : "text-white"}`}>{c.label}</span>
              {c.detail && <span className="block break-words text-fog">{c.detail}</span>}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
