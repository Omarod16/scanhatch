import Link from "next/link";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/ToolLinks";
import { FORMAT_GUIDES } from "@/lib/barcode/guide";
import { QR_LANDINGS } from "@/lib/landing/qr";
import { barcodeLandingFor, landingPath } from "@/lib/landing";
import type { Landing } from "@/lib/landing/types";
import { breadcrumbJsonLd, webAppJsonLd } from "@/lib/seo";
import { SeoToolTracker } from "./SeoToolTracker";

const PARENT = {
  qr: { name: "QR Code Generator", path: "/qr-code-generator/" },
  barcode: { name: "Barcode Generator", path: "/barcode-generator/" },
};

/** Shared layout for format/use-case landing pages. The tool is passed in so each page bundles only its own generator. */
function siblings(page: Landing) {
  if (page.kind === "qr") return { label: "Other QR code types", items: QR_LANDINGS.filter((l) => l.slug !== page.slug) };
  const items = FORMAT_GUIDES[page.format].related.map((f) => barcodeLandingFor(f)).filter((l): l is NonNullable<typeof l> => !!l);
  return { label: "Related formats", items };
}

export function LandingLayout({ page, tool }: { page: Landing; tool: ReactNode }) {
  const parent = PARENT[page.kind];
  const sib = siblings(page);
  const path = landingPath(page.slug);
  return (
    <>
      <JsonLd
        data={[
          webAppJsonLd({ name: `ScanHatch ${page.name}`, description: page.description, path }),
          breadcrumbJsonLd([{ name: "Home", path: "/" }, parent, { name: page.name, path }]),
        ]}
      />
      <SeoToolTracker page={page.slug} kind={page.kind} />
      <div className="container-page pt-8 pb-4 sm:pt-12">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-mist">
          <ol className="flex flex-wrap gap-x-2 gap-y-1">
            <li><Link href="/" className="hover:text-white">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href={parent.path} className="hover:text-white">{parent.name}</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-fog">{page.name}</li>
          </ol>
        </nav>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{page.name}</h1>
        <p className="mt-3 max-w-2xl text-fog">{page.intro}</p>
      </div>

      <div className="container-page mt-6">{tool}</div>

      <article className="container-page prose-page mt-20 max-w-3xl">
        <h2>How to use it</h2>
        <ol>{page.howTo.map((s) => <li key={s}>{s}</li>)}</ol>
        {page.sections.map((sec) => (
          <section key={sec.heading}>
            <h2>{sec.heading}</h2>
            {sec.paragraphs?.map((p) => <p key={p}>{p}</p>)}
            {sec.list && (sec.ordered ? <ol>{sec.list.map((l) => <li key={l}>{l}</li>)}</ol> : <ul>{sec.list.map((l) => <li key={l}>{l}</li>)}</ul>)}
          </section>
        ))}
        {page.faq.length > 0 && (
          <section aria-labelledby="faq">
            <h2 id="faq">Frequently asked questions</h2>
            {page.faq.map((f) => (
              <div key={f.q}>
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </section>
        )}
        {sib.items.length > 0 && (
          <section aria-labelledby="siblings">
            <h2 id="siblings">{sib.label}</h2>
            <ul>{sib.items.map((l) => <li key={l.slug}><Link href={landingPath(l.slug)}>{l.name}</Link></li>)}</ul>
          </section>
        )}
        <p>
          {page.kind === "qr"
            ? <>Need a different kind of QR code, such as an event or plain text? Open the full <Link href={parent.path}>QR Code Generator</Link>.</>
            : <>Need another format? The full <Link href={parent.path}>Barcode Generator</Link> supports 15 barcode and 2D code types.</>}
        </p>
      </article>

      <div className="container-page"><RelatedTools ids={page.related} /></div>
    </>
  );
}
