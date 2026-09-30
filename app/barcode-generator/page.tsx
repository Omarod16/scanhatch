import { PrivacyNotice } from "@/components/privacy/PrivacyNotice";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/ToolLinks";
import { BarcodeGenerator } from "@/components/barcode/BarcodeGenerator";
import { FormatGuideSection } from "@/components/barcode/FormatGuideSection";
import { breadcrumbJsonLd, pageMetadata, webAppJsonLd } from "@/lib/seo";

const TITLE = "Barcode Generator – EAN-13, UPC, Code 128 & More";
const DESCRIPTION =
  "Generate EAN-13, UPC-A, Code 128, ITF-14, Data Matrix and 10 more barcode formats. Check digits are calculated and validated. Download PNG, SVG, JPG or vector PDF.";

export const metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: "/barcode-generator/" });

export default function BarcodeGeneratorPage() {
  return (
    <>
      <JsonLd
        data={[
          webAppJsonLd({ name: "ScanHatch Barcode Generator", description: DESCRIPTION, path: "/barcode-generator/" }),
          breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Barcode Generator", path: "/barcode-generator/" }]),
        ]}
      />
      <div className="container-page pt-8 pb-4 sm:pt-12">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-mist">
          <ol className="flex gap-2">
            <li><Link href="/" className="hover:text-white">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-fog">Barcode Generator</li>
          </ol>
        </nav>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Barcode Generator</h1>
        <p className="mt-3 max-w-2xl text-fog">
          Choose a format, enter your data and download a print-ready barcode.
        </p>
      </div>

      <div className="container-page mt-6">
        <BarcodeGenerator />
      </div>

      <div className="container-page mt-20 max-w-3xl">
        <div className="prose-page">
          <h2>Do I need to register my barcode number?</h2>
          <p>
            For products sold through shops and online marketplaces, yes. EAN-13, UPC-A, EAN-8 and ITF-14 carry GTINs, which
            retailers expect to be licensed from GS1 (or a legitimate reseller). This tool draws the barcode for a number you
            already have; it can&apos;t register a number or make one valid for retail.
          </p>
          <p>
            For internal use, such as stock rooms, asset tags, library systems or tickets, you can use any value your own
            system understands. Code 128 is usually the best choice there.
          </p>
          <h2>Getting a barcode that scans</h2>
          <ul>
            <li><strong>Use SVG or PDF for print.</strong> They&apos;re vector files, so bars stay sharp at any size. PNG and JPG are snapped to whole pixels at the resolution you choose.</li>
            <li><strong>Keep the quiet zone clear.</strong> The blank space at each end is part of the barcode. Text, borders and artwork mustn&apos;t intrude into it.</li>
            <li><strong>Stick to dark bars on a light background.</strong> Avoid red bars: many scanners use red light and can&apos;t see them.</li>
            <li><strong>Don&apos;t stretch the image.</strong> Resizing a PNG unevenly changes bar widths and can make it unreadable. Change the size here instead.</li>
            <li><strong>Test it.</strong> Scan a printed copy with the scanner that will be used in practice before printing in bulk.</li>
          </ul>
        </div>
        <div className="mt-12">
          <FormatGuideSection />
        </div>
      </div>

      <div className="container-page mt-10 max-w-3xl"><PrivacyNotice variant="generator" /></div>
      <div className="container-page">
        <RelatedTools ids={["barcode-validator", "check-digit", "barcode-scanner", "ean-upc-validator", "itf-14-validator", "barcode-decoder"]} />
      </div>
    </>
  );
}
