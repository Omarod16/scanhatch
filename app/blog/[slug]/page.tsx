import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/ToolLinks";
import { ArticleBody } from "@/components/blog/ArticleBody";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { ARTICLES, article, articlePath, formatDate, readingMinutes } from "@/lib/blog";
import { Inline } from "@/lib/blog/inline";
import { CATEGORY_LABELS } from "@/lib/blog/types";
import { articleJsonLd, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const dynamicParams = false;
export const generateStaticParams = () => ARTICLES.map((a) => ({ slug: a.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const a = article((await params).slug);
  if (!a) return {};
  const meta = pageMetadata({ title: a.metaTitle, description: a.description, path: articlePath(a.slug) });
  return { ...meta, openGraph: { ...meta.openGraph, type: "article", publishedTime: a.publishedAt, modifiedTime: a.updatedAt } };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const a = article((await params).slug);
  if (!a) notFound();
  const path = articlePath(a.slug);
  const toc = a.body.filter((b) => b.type === "h2");
  const related = a.relatedArticles.map((s) => article(s)).filter((x) => !!x);
  return (
    <>
      <JsonLd data={[
        articleJsonLd({ headline: a.title, description: a.description, path, datePublished: a.publishedAt, dateModified: a.updatedAt }),
        breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog/" }, { name: a.title, path }]),
      ]} />
      <div className="container-page pt-8 sm:pt-12">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-mist">
          <ol className="flex flex-wrap gap-x-2 gap-y-1">
            <li><Link href="/" className="hover:text-white">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/blog/" className="hover:text-white">Blog</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-fog">{a.title}</li>
          </ol>
        </nav>
      </div>
      <article className="container-page max-w-3xl">
        <header>
          <p className="text-sm font-semibold text-cyan"><Link href={`/blog/#${a.category}`} className="hover:underline">{CATEGORY_LABELS[a.category]}</Link></p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{a.title}</h1>
          <p className="mt-3 text-sm text-mist">
            By ScanHatch · Published <time dateTime={a.publishedAt}>{formatDate(a.publishedAt)}</time>
            {a.updatedAt !== a.publishedAt && <> · Updated <time dateTime={a.updatedAt}>{formatDate(a.updatedAt)}</time></>}
            {" "}· {readingMinutes(a)} min read
          </p>
        </header>
        <div className="prose-page mt-8">
          {a.intro.map((p, i) => <p key={i} className="text-lg leading-relaxed"><Inline text={p} /></p>)}
          {toc.length >= 4 && (
            <nav aria-labelledby="toc" className="not-prose my-8 rounded-xl border border-line bg-ink-2 p-5">
              <h2 id="toc" className="!mt-0 !mb-0 !text-sm font-bold text-white">In this article</h2>
              <ol className="mt-3 space-y-1.5 text-sm">
                {toc.map((h) => h.type === "h2" && <li key={h.id}><a href={`#${h.id}`} className="text-fog hover:text-white hover:underline">{h.text}</a></li>)}
              </ol>
            </nav>
          )}
          <ArticleBody blocks={a.body} />
          {a.faq && a.faq.length > 0 && (
            <section aria-labelledby="faq">
              <h2 id="faq">Frequently asked questions</h2>
              {a.faq.map((f) => (
                <div key={f.q}>
                  <h3>{f.q}</h3>
                  <p><Inline text={f.a} /></p>
                </div>
              ))}
            </section>
          )}
        </div>
        <aside aria-label="Next step" className="mt-12 rounded-2xl border border-cyan/40 bg-ink-2 p-5 sm:p-6">
          <p className="text-fog">{a.cta.text}</p>
          <Link href={a.cta.href} className="btn-primary mt-4">{a.cta.label}</Link>
        </aside>
      </article>
      <div className="container-page">
        <RelatedTools ids={a.relatedTools} />
        {related.length > 0 && (
          <section aria-labelledby="related-articles" className="mt-16">
            <h2 id="related-articles" className="mb-5 text-xl font-bold text-white">Related articles</h2>
            <ul className="grid gap-4 md:grid-cols-3">
              {related.map((r) => <li key={r.slug}><ArticleCard a={r} /></li>)}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
