import { Inline } from "@/lib/blog/inline";
import type { Block } from "@/lib/blog/types";

export function ArticleBody({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.type) {
          case "p": return <p key={i}><Inline text={b.text} /></p>;
          case "h2": return <h2 key={i} id={b.id} className="scroll-mt-24">{b.text}</h2>;
          case "h3": return <h3 key={i}>{b.text}</h3>;
          case "ul": return <ul key={i}>{b.items.map((t, j) => <li key={j}><Inline text={t} /></li>)}</ul>;
          case "ol": return <ol key={i}>{b.items.map((t, j) => <li key={j}><Inline text={t} /></li>)}</ol>;
          case "note":
            return <p key={i} className="rounded-lg border border-line-2 bg-panel px-4 py-3 text-fog"><strong className="text-white">Note: </strong><Inline text={b.text} /></p>;
          case "example":
            return (
              <div key={i} className="not-prose my-5 rounded-lg border border-line bg-ink-2 px-4 py-3 text-fog">
                <p className="mb-1 text-xs font-semibold text-mist">{b.label}</p>
                <p className="break-words leading-relaxed"><Inline text={b.text} /></p>
              </div>
            );
          case "table":
            return (
              <div key={i} className="not-prose relative my-6 overflow-x-auto rounded-lg border border-line" tabIndex={0} aria-label={`${b.caption} (scrollable table)`}>
                <table className="w-full min-w-max border-collapse text-left text-sm">
                  <caption className="px-3 pt-3 pb-2 text-left text-xs font-semibold text-mist">{b.caption}</caption>
                  <thead className="bg-ink-2 text-fog">
                    <tr>{b.head.map((h, j) => <th key={j} scope="col" className="border-b border-line px-3 py-2 font-semibold whitespace-nowrap"><Inline text={h} /></th>)}</tr>
                  </thead>
                  <tbody>
                    {b.rows.map((r, j) => (
                      <tr key={j} className="border-b border-line last:border-0 align-top">
                        {r.map((c, k) => k === 0
                          ? <th key={k} scope="row" className="px-3 py-2 font-semibold text-white"><Inline text={c} /></th>
                          : <td key={k} className="max-w-xs px-3 py-2 text-fog"><Inline text={c} /></td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
        }
      })}
    </>
  );
}
