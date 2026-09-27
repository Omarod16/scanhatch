import { JsonLd } from "@/components/JsonLd";
import { ToolItem } from "@/components/ToolLinks";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { CATEGORY_LABELS, toolsIn, type ToolCategory } from "@/lib/tools";

export const metadata = pageMetadata({
  title: "All QR Code & Barcode Tools",
  description: "Every ScanHatch tool in one place: QR code generators for links, WiFi and contacts, plus barcode, scanner and bulk tools.",
  path: "/tools/",
});

const ORDER: ToolCategory[] = ["qr", "barcode", "scanner", "utility"];

export default function ToolsPage() {
  return (
    <div className="container-page pt-12 sm:pt-16">
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Tools", path: "/tools/" }])} />
      <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">All tools</h1>
      <p className="mt-3 max-w-2xl text-fog">
        Tools marked &ldquo;Coming soon&rdquo; are in development. Everything else works now, in your browser.
      </p>
      <div className="mt-12 space-y-14">
        {ORDER.map((cat) => (
          <section key={cat} id={cat} aria-labelledby={`h-${cat}`} className="scroll-mt-24">
            <h2 id={`h-${cat}`} className="mb-5 text-xl font-bold text-white">{CATEGORY_LABELS[cat]}</h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {toolsIn(cat).map((t) => (
                <li key={t.id}><ToolItem tool={t} /></li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
