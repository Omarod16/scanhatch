const STEPS = ["Upload", "Review", "Customise", "Generate", "Download"];

export function StepList({ current }: { current: number }) {
  return (
    <ol className="mb-8 flex flex-wrap gap-x-2 gap-y-2 text-sm" aria-label="Steps">
      {STEPS.map((s, i) => {
        const state = i < current ? "done" : i === current ? "current" : "todo";
        return (
          <li key={s} aria-current={state === "current" ? "step" : undefined}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 ${state === "current" ? "border-cyan bg-cyan/10 text-white" : state === "done" ? "border-line-2 text-fog" : "border-line text-mist"}`}>
            <span aria-hidden="true" className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${state === "current" ? "bg-cyan text-ink" : state === "done" ? "bg-ok/20 text-ok" : "bg-panel text-mist"}`}>
              {state === "done" ? "✓" : i + 1}
            </span>
            {s}
            {state === "done" && <span className="sr-only"> (done)</span>}
          </li>
        );
      })}
    </ol>
  );
}
