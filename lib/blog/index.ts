import { plainText, linksIn } from "./inline";
import { ARTICLE_SOURCES, SOURCES_ADDED } from "./sources";
import type { Article, Block } from "./types";
import { QR_BASICS } from "./articles/qr-basics";
import { QR_GUIDES } from "./articles/qr-guides";
import { BARCODE_ARTICLES } from "./articles/barcodes";

const ALL: Article[] = [...QR_BASICS, ...QR_GUIDES, ...BARCODE_ARTICLES];

/** Published articles, newest first (ties keep editorial order). Articles with sources were updated when they were added. */
export const ARTICLES: Article[] = ALL.filter((a) => !a.draft).map((a) =>
  ARTICLE_SOURCES[a.slug] ? { ...a, sources: ARTICLE_SOURCES[a.slug], updatedAt: SOURCES_ADDED } : a,
);

export const article = (slug: string) => ARTICLES.find((a) => a.slug === slug);
export const articlePath = (slug: string) => `/blog/${slug}/`;

function blockTexts(b: Block): string[] {
  switch (b.type) {
    case "p": case "h2": case "h3": case "note": return [b.text];
    case "example": return [b.label, b.text];
    case "ul": case "ol": return b.items;
    case "table": return [b.caption, ...b.head, ...b.rows.flat()];
  }
}

export function articleText(a: Article) {
  const parts = [...a.intro, ...a.body.flatMap(blockTexts), ...(a.faq ?? []).flatMap((f) => [f.q, f.a])];
  return parts.map(plainText).join(" ");
}

export const wordCount = (a: Article) => articleText(a).split(/\s+/).filter(Boolean).length;
/** Reading time at 220 words per minute, rounded up. */
export const readingMinutes = (a: Article) => Math.max(1, Math.ceil(wordCount(a) / 220));

export function internalLinks(a: Article) {
  const texts = [...a.intro, ...a.body.flatMap(blockTexts), ...(a.faq ?? []).flatMap((f) => [f.a])];
  return [...new Set(texts.flatMap(linksIn))];
}

/** Articles that link to a given path (used to show "Further reading" on tool pages). */
export const articlesLinkingTo = (path: string) =>
  ARTICLES.filter((a) => a.cta.href === path || internalLinks(a).includes(path))
    // Articles whose main call to action is this page come first.
    .sort((x, y) => Number(y.cta.href === path) - Number(x.cta.href === path));

export const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
