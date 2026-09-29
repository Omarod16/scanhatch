import type { MetadataRoute } from "next";
import { ARTICLES, articlePath } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";
import { PAGES, TOOLS } from "@/lib/tools";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    ...Object.values(PAGES).filter((p) => p.status === "live").map((p) => p.href),
    ...TOOLS.filter((t) => t.status === "live" && t.indexable).map((t) => t.href),
  ];
  // Tool and static pages have no meaningful content date, so lastmod is omitted rather than
  // stamping every URL with the build time on each deploy.
  const pages = [...new Set(paths)].map((path) => ({ url: new URL(path, SITE_URL).toString() }));
  // Articles report their real last-updated date, not the build time.
  const articles = ARTICLES.map((a) => ({ url: new URL(articlePath(a.slug), SITE_URL).toString(), lastModified: new Date(`${a.updatedAt}T00:00:00Z`) }));
  return [...pages, ...articles];
}
