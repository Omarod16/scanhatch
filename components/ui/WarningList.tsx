import type { QrWarning } from "@/lib/qr/warnings";

const LEVEL_STYLE: Record<QrWarning["level"], string> = {
  danger: "border-danger/40 bg-danger/10 text-red-200",
  warn: "border-warn/40 bg-warn/10 text-amber-100",
  info: "border-line-2 bg-panel text-fog",
};
const LEVEL_LABEL: Record<QrWarning["level"], string> = { danger: "Problem", warn: "Warning", info: "Note" };

/** Readability warnings and notes. Level is conveyed in text, not only colour. */
export function WarningList({ warnings, notes = [], label = "Readability checks" }: { warnings: QrWarning[]; notes?: string[]; label?: string }) {
  if (!warnings.length && !notes.length) return null;
  return (
    <ul className="space-y-2" aria-label={label}>
      {warnings.map((w) => (
        <li key={w.id} className={`rounded-lg border px-3 py-2.5 text-sm leading-snug ${LEVEL_STYLE[w.level]}`}>
          <span className="font-semibold">{LEVEL_LABEL[w.level]}: </span>
          {w.message}
        </li>
      ))}
      {notes.map((n) => (
        <li key={n} className={`rounded-lg border px-3 py-2.5 text-sm leading-snug ${LEVEL_STYLE.info}`}>
          <span className="font-semibold">Note: </span>
          {n}
        </li>
      ))}
    </ul>
  );
}
