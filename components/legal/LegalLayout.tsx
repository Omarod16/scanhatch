import Link from "next/link";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/JsonLd";
import { formatDate } from "@/lib/blog";
import { breadcrumbJsonLd } from "@/lib/seo";
import { LEGAL_UPDATED } from "@/lib/site";

export interface LegalSection { id: string; title: string; body: ReactNode }

export function LegalLayout({ name, path, intro, sections, updated = LEGAL_UPDATED }: {
  name: string; path: string; intro: ReactNode; sections: LegalSection[]; updated?: string | null;
}) {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name, path }])} />
      <div className="container-page max-w-3xl pt-8 pb-4 sm:pt-12">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-mist">
          <ol className="flex gap-2">
            <li><Link href="/" className="hover:text-white">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-fog">{name}</li>
          </ol>
        </nav>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{name}</h1>
        {updated && <p className="mt-2 text-sm text-mist">Last updated <time dateTime={updated}>{formatDate(updated)}</time></p>}
        <div className="prose-page mt-6">{intro}</div>
        {sections.length >= 4 && (
          <nav aria-labelledby="toc" className="mt-8 rounded-xl border border-line bg-ink-2 p-5">
            <h2 id="toc" className="text-sm font-bold text-white">Contents</h2>
            <ol className="mt-3 grid gap-1.5 text-sm sm:grid-cols-2">
              {sections.map((s) => <li key={s.id}><a href={`#${s.id}`} className="text-fog hover:text-white hover:underline">{s.title}</a></li>)}
            </ol>
          </nav>
        )}
        <div className="prose-page mt-4">
          {sections.map((s) => (
            <section key={s.id} aria-labelledby={s.id}>
              <h2 id={s.id} className="scroll-mt-24">{s.title}</h2>
              {s.body}
            </section>
          ))}
        </div>
      </div>
    </>
  );
}

/** Table used by the cookie and privacy pages; scrolls inside its own container on small screens. */
export function LegalTable({ caption, head, rows }: { caption: string; head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="not-prose relative my-5 overflow-x-auto rounded-lg border border-line" tabIndex={0} aria-label={`${caption} (scrollable table)`}>
      <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
        <caption className="px-3 pt-3 pb-2 text-left text-xs font-semibold text-mist">{caption}</caption>
        <thead className="bg-ink-2 text-fog"><tr>{head.map((h) => <th key={h} scope="col" className="border-b border-line px-3 py-2 font-semibold">{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-line align-top last:border-0">
              {r.map((c, j) => j === 0 ? <th key={j} scope="row" className="px-3 py-2 font-semibold text-white">{c}</th> : <td key={j} className="px-3 py-2 text-fog">{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** The site's contact route, or a neutral statement if the owner hasn't configured an address yet. */
export function ContactLine({ email }: { email: string | null }) {
  return email
    ? <>email <a href={`mailto:${email}`}>{email}</a></>
    : <>use the details on our <Link href="/contact/">contact page</Link></>;
}
