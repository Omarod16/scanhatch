import Link from "next/link";
import { toolById, type Tool } from "@/lib/tools";

export function ToolItem({ tool }: { tool: Tool }) {
  const live = tool.status === "live";
  const inner = (
    <>
      <span className="flex items-center justify-between gap-3">
        <span className={`font-semibold ${live ? "text-white" : "text-fog"}`}>{tool.name}</span>
        {!live && <span className="shrink-0 rounded-full border border-line-2 px-2 py-0.5 text-xs text-mist">Coming soon</span>}
      </span>
      <span className="mt-1 block text-sm leading-relaxed text-mist">{tool.summary}</span>
    </>
  );
  return live ? (
    <Link prefetch={false} href={tool.href} className="block rounded-xl border border-line bg-ink-2 p-4 hover:border-cyan/50 hover:bg-panel">
      {inner}
    </Link>
  ) : (
    <div className="rounded-xl border border-dashed border-line p-4" aria-disabled="true">{inner}</div>
  );
}

export function RelatedTools({ ids, title = "Related tools" }: { ids: string[]; title?: string }) {
  return (
    <section aria-labelledby="related-tools" className="mt-16">
      <h2 id="related-tools" className="mb-5 text-xl font-bold text-white">{title}</h2>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ids.map((id) => toolById(id)).filter((t) => t.status === "live").map((t) => (
          <li key={t.id}><ToolItem tool={t} /></li>
        ))}
      </ul>
    </section>
  );
}
