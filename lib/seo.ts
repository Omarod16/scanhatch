import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "./site";

export function pageMetadata(opts: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = new URL(opts.path, SITE_URL).toString();
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: opts.path },
    openGraph: {
      type: "website",
      url,
      siteName: SITE_NAME,
      title: opts.title,
      description: opts.description,
    },
    twitter: { card: "summary", title: opts.title, description: opts.description },
  };
}

export const absoluteUrl = (path: string) => new URL(path, SITE_URL).toString();

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function webAppJsonLd(opts: { name: string; description: string; path: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: opts.name,
    description: opts.description,
    url: absoluteUrl(opts.path),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any (runs in a web browser)",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    isAccessibleForFree: true,
  };
}
