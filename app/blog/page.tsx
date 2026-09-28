import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { ARTICLES } from "@/lib/blog";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/blog/types";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

const DESCRIPTION = "Practical guides to QR codes and barcodes: how they work, how to create and scan them, error correction, sizing, check digits, EAN-13 vs UPC-A, Code 128 and ITF-14.";
export const metadata = pageMetadata({ title: "QR Code & Barcode Guides", description: DESCRIPTION, path: "/blog/" });

const FEATURED = ["what-is-a-qr-code", "how-to-create-a-qr-code", "barcode-check-digits-explained"];

export default function BlogIndex() {
  const featured = FEATURED.map((s) => ARTICLES.find((a) => a.slug === s)).filter((a) => !!a);
  const cats = CATEGORY_ORDER.filter((c) => ARTICLES.some((a) => a.category === c));
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog/" }])} />
      <div className="container-page pt-8 pb-4 sm:pt-12">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-mist">
          <ol className="flex gap-2">
            <li><Link href="/" className="hover:text-white">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-fog">Blog</li>
          </ol>
        </nav>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">QR Code &amp; Barcode Guides</h1>
        <p className="mt-3 max-w-2xl text-fog">
          Plain-English explanations of how QR codes and barcodes work, and practical guides to creating, printing and scanning them.
        </p>
        <nav aria-label="Topics" className="mt-6">
          <ul className="flex flex-wrap gap-2">
            {cats.map((c) => (
              <li key={c}>
                <a href={`#${c}`} className="inline-block rounded-full border border-line px-3 py-1.5 text-sm text-fog hover:border-line-2 hover:text-white">
                  {CATEGORY_LABELS[c]} ({ARTICLES.filter((a) => a.category === c).length})
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="container-page mt-8 space-y-14">
        <section aria-labelledby="featured">
          <h2 id="featured" className="mb-5 text-xl font-bold text-white">Start here</h2>
          <ul className="grid gap-4 md:grid-cols-3">
            {featured.map((a) => <li key={a.slug}><ArticleCard a={a} /></li>)}
          </ul>
        </section>
        {cats.map((c) => (
          <section key={c} id={c} aria-labelledby={`h-${c}`} className="scroll-mt-24">
            <h2 id={`h-${c}`} className="mb-5 text-xl font-bold text-white">{CATEGORY_LABELS[c]}</h2>
            <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {ARTICLES.filter((a) => a.category === c).map((a) => <li key={a.slug}><ArticleCard a={a} /></li>)}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
