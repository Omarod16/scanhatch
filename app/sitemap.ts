import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { PAGES, TOOLS } from "@/lib/tools";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    ...Object.values(PAGES).filter((p) => p.status === "live").map((p) => p.href),
    ...TOOLS.filter((t) => t.status === "live" && t.indexable).map((t) => t.href),
  ];
  const lastModified = new Date();
  return [...new Set(paths)].map((path) => ({
    url: new URL(path, SITE_URL).toString(),
    lastModified,
  }));
}
