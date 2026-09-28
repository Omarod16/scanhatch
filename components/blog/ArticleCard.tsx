import Link from "next/link";
import { articlePath, formatDate, readingMinutes } from "@/lib/blog";
import { CATEGORY_LABELS, type Article } from "@/lib/blog/types";

export function ArticleCard({ a, headingLevel = 3 }: { a: Article; headingLevel?: 2 | 3 }) {
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <article className="flex h-full flex-col rounded-2xl border border-line bg-ink-2 p-5 transition-colors hover:border-line-2">
      <p className="text-xs font-semibold text-cyan">{CATEGORY_LABELS[a.category]}</p>
      <H className="mt-2 text-lg font-bold leading-snug text-white">
        <Link href={articlePath(a.slug)} className="hover:underline focus-visible:underline">{a.title}</Link>
      </H>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-fog">{a.description}</p>
      <p className="mt-4 text-xs text-mist">
        <time dateTime={a.publishedAt}>{formatDate(a.publishedAt)}</time> · {readingMinutes(a)} min read
      </p>
    </article>
  );
}
