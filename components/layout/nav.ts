import { PAGES } from "@/lib/tools";

/** Header navigation. Only live destinations are included. */
export const NAV_LINKS = [
  { label: "QR Tools", href: "/tools/#qr" },
  { label: "Barcode Tools", href: "/tools/#barcode" },
  { label: "Scanner", href: "/scanner/" },
  ...(PAGES.blog.status === "live" ? [{ label: "Blog", href: PAGES.blog.href }] : []),
];
