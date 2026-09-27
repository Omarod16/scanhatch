import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/ToolLinks";
import { ToolPageHeader } from "@/components/ToolPageHeader";
import { BarcodeValidator } from "@/components/validate/BarcodeValidator";
import { UpcConverter } from "@/components/validate/UpcConverter";
import { breadcrumbJsonLd, pageMetadata, webAppJsonLd } from "@/lib/seo";

const DESCRIPTION = "Validate EAN-13, EAN-8, UPC-A and UPC-E product numbers, check their check digits, and convert between UPC-E and UPC-A.";
export const metadata = pageMetadata({ title: "EAN & UPC Validator – Check GTIN Numbers and Convert UPC-E", description: DESCRIPTION, path: "/ean-upc-validator/" });

export default function EanUpcValidatorPage() {
  return (
    <>
      <JsonLd data={[webAppJsonLd({ name: "ScanHatch EAN/UPC Validator", description: DESCRIPTION, path: "/ean-upc-validator/" }), breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "EAN/UPC Validator", path: "/ean-upc-validator/" }])]} />
      <ToolPageHeader name="EAN/UPC Validator" title="EAN & UPC Validator">
        <p>Check a retail product number (EAN-13, EAN-8, UPC-A or UPC-E), see what its prefix means, and convert between UPC-E and UPC-A.</p>
      </ToolPageHeader>
      <div className="container-page mt-6 max-w-3xl space-y-12">
        <BarcodeValidator tool="ean-upc-validator" formats={["ean13", "upca", "ean8", "upce"]} />
        <section aria-labelledby="converter">
          <h2 id="converter" className="mb-2 text-xl font-bold text-white">UPC-E ↔ UPC-A converter</h2>
          <p className="mb-4 text-sm text-fog">Enter a UPC-E to expand it, or a UPC-A to see whether it can be shortened.</p>
          <UpcConverter />
        </section>
      </div>
      <article className="container-page prose-page mt-16 max-w-3xl">
        <h2>How EAN and UPC numbers relate</h2>
        <p>
          All four are GTINs (Global Trade Item Numbers). A UPC-A is a 12-digit GTIN; written with a leading 0 it becomes the
          equivalent 13-digit EAN-13, and the barcodes are identical. That&apos;s why a scanner may show a UPC-A as a 13-digit number
          starting with 0. EAN-8 is a separate, shorter number issued for small packages. It isn&apos;t a shortened EAN-13.
        </p>
        <h2>When can a UPC-A be shortened to UPC-E?</h2>
        <p>Only UPC-A numbers with number system 0 or 1 and zeros in particular positions. The pattern is recorded in the last digit of the UPC-E (before the check digit):</p>
        <div className="not-prose overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead><tr className="border-b border-line-2 text-mist"><th scope="col" className="py-2 pr-4">UPC-E ends in</th><th scope="col" className="py-2">Required zeros in the UPC-A</th></tr></thead>
            <tbody className="text-fog">
              <tr className="border-b border-line"><td className="py-2.5 pr-4 font-mono text-white">0, 1, 2</td><td className="py-2.5">The manufacturer code ends in that digit then 00, and the item number starts with 00.</td></tr>
              <tr className="border-b border-line"><td className="py-2.5 pr-4 font-mono text-white">3</td><td className="py-2.5">The manufacturer code ends in 00, and the item number starts with 000.</td></tr>
              <tr className="border-b border-line"><td className="py-2.5 pr-4 font-mono text-white">4</td><td className="py-2.5">The manufacturer code ends in 0, and the item number starts with 0000.</td></tr>
              <tr className="border-b border-line"><td className="py-2.5 pr-4 font-mono text-white">5–9</td><td className="py-2.5">The item number is 0000 followed by that digit.</td></tr>
            </tbody>
          </table>
        </div>
        <p>Most UPC-A numbers don&apos;t fit any of these patterns, so they can&apos;t be printed as UPC-E.</p>
        <h2>What prefixes tell you</h2>
        <ul>
          <li><strong>978 or 979:</strong> a book (ISBN); 979-0 is printed music (ISMN).</li>
          <li><strong>977:</strong> a magazine or other periodical (ISSN).</li>
          <li><strong>20–29, and UPC number systems 2 and 4:</strong> restricted circulation numbers for in-store use, such as weighed goods.</li>
          <li><strong>Other prefixes</strong> show which national GS1 organisation issued the company&apos;s prefix. They don&apos;t reveal where a product was made.</li>
        </ul>
      </article>
      <div className="container-page"><RelatedTools ids={["check-digit", "barcode-validator", "barcode-generator", "itf-14-validator", "barcode-scanner", "barcode-decoder"]} /></div>
    </>
  );
}
