import Link from "next/link";
import { PAGES, TOOLS, type Tool } from "@/lib/tools";
import { PRIVACY_PROMISE } from "@/lib/site";
import { LogoMark } from "./Logo";

type Item = { name: string; href: string; status: "live" | "soon" };

const pick = (ids: string[]): Tool[] =>
  ids.map((id) => TOOLS.find((t) => t.id === id)).filter((t): t is Tool => Boolean(t));

const COLUMNS: { title: string; items: Item[] }[] = [
  { title: "QR Tools", items: pick(["qr-generator", "qr-wifi", "qr-validator", "qr-decoder", "bulk-qr"]) },
  { title: "Barcode Tools", items: pick(["barcode-generator", "bc-ean13", "barcode-validator", "check-digit", "bulk-barcode"]) },
  { title: "Scanners", items: pick(["scanner", "qr-scanner", "barcode-scanner"]) },
  { title: "Resources", items: [PAGES.tools, PAGES.blog, ...pick(["qr-size"])] },
  { title: "Company", items: [PAGES.about, PAGES.contact] },
  { title: "Legal", items: [PAGES.privacy, PAGES.terms, PAGES.cookies] },
];

function FooterItem({ item }: { item: Item }) {
  if (item.status === "live") {
    return (
      <Link prefetch={false} href={item.href} className="text-sm text-mist hover:text-white">
        {item.name}
      </Link>
    );
  }
  return (
    <span className="text-sm text-mist/45">
      {item.name}
      <span className="sr-only"> (coming soon)</span>
    </span>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-ink-2">
      <div className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_3fr]">
          <div>
            <Link prefetch={false} href="/" className="inline-flex items-center gap-2.5 font-extrabold text-white">
              <LogoMark className="h-7 w-7" />
              ScanHatch
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-mist">{PRIVACY_PROMISE}</p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h2 className="mb-3 text-sm font-bold text-white">{col.title}</h2>
                <ul className="space-y-2.5">
                  {col.items.filter((item) => item.status === "live").map((item) => (
                    <li key={item.href}>
                      <FooterItem item={item} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-sm text-mist sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ScanHatch · QR &amp; Barcode Tools</p>
        </div>
      </div>
    </footer>
  );
}
