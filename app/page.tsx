import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { QuickGenerator } from "@/components/home/QuickGenerator";
import { ToolItem } from "@/components/ToolLinks";
import { absoluteUrl } from "@/lib/seo";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { CATEGORY_LABELS, toolsIn, type ToolCategory } from "@/lib/tools";

const ORDER: ToolCategory[] = ["qr", "barcode", "scanner", "utility"];

export default function Home() {
  return (
    <>
      <JsonLd
        data={[
          { "@context": "https://schema.org", "@type": "WebSite", name: SITE_NAME, url: SITE_URL, description: SITE_DESCRIPTION },
          { "@context": "https://schema.org", "@type": "Organization", name: SITE_NAME, url: SITE_URL, logo: absoluteUrl("/icon.svg") },
        ]}
      />

      <section className="relative overflow-hidden">
        <div className="scan-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="container-page relative pt-16 pb-14 sm:pt-24">
          <p className="text-sm font-semibold text-cyan">ScanHatch · QR &amp; Barcode Tools</p>
          <h1 className="mt-4 max-w-3xl text-4xl leading-[1.05] font-extrabold tracking-tight text-balance text-white sm:text-6xl">
            Create QR Codes &amp; Barcodes in Seconds
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-fog">
            Create, scan and decode QR codes and barcodes for free, right in your browser.
          </p>
        </div>
      </section>

      <section className="container-page" aria-labelledby="quick-qr">
        <h2 id="quick-qr" className="sr-only">Quick QR code and barcode generator</h2>
        <QuickGenerator />
      </section>

      <section className="container-page mt-12" aria-labelledby="all-tools">
        <div className="flex items-end justify-between gap-4">
          <h2 id="all-tools" className="text-2xl font-bold tracking-tight text-white">Tools</h2>
          <Link href="/tools/" className="text-sm font-semibold text-cyan hover:underline">See all tools</Link>
        </div>
        <div className="mt-8 space-y-10">
          {ORDER.map((cat) => (
            <div key={cat}>
              <h3 className="mb-4 text-base font-bold text-fog">{CATEGORY_LABELS[cat]}</h3>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {toolsIn(cat).slice(0, cat === "qr" ? 6 : 6).map((t) => (
                  <li key={t.id}><ToolItem tool={t} /></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page mt-20" aria-labelledby="privacy">
        <div className="grid gap-8 border-y border-line py-12 md:grid-cols-[1fr_2fr]">
          <h2 id="privacy" className="text-2xl font-bold tracking-tight text-white">Private by design</h2>
          <div className="space-y-4 text-fog">
            <p>
              QR codes and barcodes are created, scanned and checked in your browser. The link, WiFi password or
              contact details you enter are processed on your own device and aren&apos;t sent to ScanHatch.
            </p>
            <p>
              No account is needed, and logos you add stay on your device. Recent scans are kept only in this
              browser tab until you close it. The <Link href="/privacy-policy/" className="text-cyan underline underline-offset-2">privacy policy</Link> has the details.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
