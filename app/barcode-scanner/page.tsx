import { PrivacyNotice } from "@/components/privacy/PrivacyNotice";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/ToolLinks";
import { ToolPageHeader } from "@/components/ToolPageHeader";
import { ScannerTool } from "@/components/scanner/ScannerTool";
import { READABLE_FORMAT_NAMES } from "@/lib/scanner/formats";
import { breadcrumbJsonLd, pageMetadata, webAppJsonLd } from "@/lib/seo";

const DESCRIPTION = "Scan EAN-13, UPC, Code 128, Code 39, ITF, Data Matrix and PDF417 barcodes with your camera. See the format and exact value, privately in your browser.";
export const metadata = pageMetadata({ title: "Barcode Scanner Online – EAN, UPC, Code 128 & More", description: DESCRIPTION, path: "/barcode-scanner/" });

export default function BarcodeScannerPage() {
  return (
    <>
      <JsonLd data={[webAppJsonLd({ name: "ScanHatch Barcode Scanner", description: DESCRIPTION, path: "/barcode-scanner/" }), breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Barcode Scanner", path: "/barcode-scanner/" }])]} />
      <ToolPageHeader name="Barcode Scanner" title="Barcode Scanner">
        <p>Scan a product barcode, shipping label or 2D code and see its format and exact value. Useful for checking labels you&apos;ve printed.</p>
      </ToolPageHeader>
      <div className="container-page mt-6 max-w-3xl"><ScannerTool mode="barcode" /></div>
      <article className="container-page prose-page mt-16 max-w-3xl">
        <h2>Tips for scanning barcodes with a phone</h2>
        <ul>
          <li><strong>Hold the phone parallel to the barcode</strong> with the bars running vertically across the frame.</li>
          <li><strong>Fill about two-thirds of the width</strong> with the barcode, including a little blank space at each end.</li>
          <li><strong>Avoid glare</strong> on shiny packaging by tilting slightly.</li>
          <li><strong>Small barcodes</strong> need good light and focus; phone cameras struggle with very narrow bars.</li>
        </ul>
        <h2>Understanding the result</h2>
        <p>
          Product barcodes are shown the way they&apos;re printed: 13 digits for EAN-13, 12 for UPC-A and 8 for UPC-E. For UPC codes,
          the 13-digit GTIN form that many systems use is shown too. An EAN-13 that starts with 0 is the same number as a UPC-A.
        </p>
        <p>ScanHatch shows the barcode&apos;s number. It doesn&apos;t look up product names or prices, so no scan data leaves your device.</p>
        <h2>Supported formats</h2>
        <p>{READABLE_FORMAT_NAMES.barcode.join(", ")}.</p>
        <p>Not supported: MSI, Pharmacode and postal barcodes. QR codes are read by the <a href="/qr-scanner/">QR scanner</a>.</p>
      </article>
      <div className="container-page mt-10 max-w-3xl"><PrivacyNotice variant="scanner" /></div>
      <div className="container-page"><RelatedTools ids={["barcode-decoder", "barcode-generator", "barcode-validator", "check-digit", "scanner", "qr-scanner"]} /></div>
    </>
  );
}
