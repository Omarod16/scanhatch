/**
 * Blog content model. Articles are trusted static data; text uses a tiny inline
 * syntax rendered as React elements (never HTML):
 *   [label](/internal/path/)  internal link (must start with "/")
 *   `code`                    inline code
 */
export type BlogCategory = "qr-codes" | "barcodes" | "scanning" | "how-to" | "technical";

export const CATEGORY_LABELS: Record<BlogCategory, string> = {
  "qr-codes": "QR Codes",
  barcodes: "Barcodes",
  scanning: "Scanning",
  "how-to": "How-To Guides",
  technical: "Technical Guides",
};
export const CATEGORY_ORDER: BlogCategory[] = ["qr-codes", "how-to", "technical", "scanning", "barcodes"];

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string; id: string }
  | { type: "h3"; text: string }
  | { type: "ul" | "ol"; items: string[] }
  | { type: "table"; caption: string; head: string[]; rows: string[][] }
  | { type: "example"; label: string; text: string }
  | { type: "note"; text: string };

export interface Article {
  slug: string;
  title: string;
  /** <title> without the " | ScanHatch" suffix. */
  metaTitle: string;
  description: string;
  category: BlogCategory;
  /** ISO dates (YYYY-MM-DD). Real dates only. */
  publishedAt: string;
  updatedAt: string;
  /** Excluded from the index, sitemap and build while true. */
  draft?: boolean;
  intro: string[];
  body: Block[];
  faq?: { q: string; a: string }[];
  relatedTools: string[];
  relatedArticles: string[];
  /** The main next step at the end of the article. */
  cta: { label: string; href: string; text: string };
}
