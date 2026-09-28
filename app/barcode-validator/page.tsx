import { PrivacyNotice } from "@/components/privacy/PrivacyNotice";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/ToolLinks";
import { ToolPageHeader } from "@/components/ToolPageHeader";
import { BarcodeValidator } from "@/components/validate/BarcodeValidator";
import { breadcrumbJsonLd, pageMetadata, webAppJsonLd } from "@/lib/seo";

const DESCRIPTION = "Check whether a barcode number is valid for EAN-13, UPC-A, UPC-E, ITF-14, Code 128, Code 39, Codabar, MSI and more, with a clear explanation of every rule.";
export const metadata = pageMetadata({ title: "Barcode Validator – Check EAN, UPC, ITF-14, Code 128 & More", description: DESCRIPTION, path: "/barcode-validator/" });

const RULES: [string, string][] = [
  ["EAN-13, EAN-8, UPC-A, ITF-14", "Digits only, exact length (13, 8, 12 or 14), and the GS1 mod-10 check digit."],
  ["UPC-E", "8 digits, number system 0 or 1, and a check digit calculated from the expanded UPC-A number."],
  ["ITF", "Digits only and an even number of them. Plain ITF has no check digit."],
  ["Code 128", "Every character must be standard ASCII. Its check character is inside the bars, so it can't be checked from text."],
  ["Code 39", "Capital letters, digits, space and - . $ / + % only, plus the optional mod 43 check character if you say one is present."],
  ["Code 93", "The same character set as Code 39. Its two check characters are inside the bars, not in the text."],
  ["Codabar", "Digits and - $ : / . +, with start and stop letters A–D either both present or both absent."],
  ["MSI", "Digits only, and the check digits for the scheme you choose (Mod 10, Mod 10+10, Mod 11, Mod 11+10 or none)."],
  ["Pharmacode", "A whole number from 3 to 131070. There's no check digit."],
];

export default function BarcodeValidatorPage() {
  return (
    <>
      <JsonLd data={[webAppJsonLd({ name: "ScanHatch Barcode Validator", description: DESCRIPTION, path: "/barcode-validator/" }), breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Barcode Validator", path: "/barcode-validator/" }])]} />
      <ToolPageHeader name="Barcode Validator" title="Barcode Validator">
        <p>Choose a format and enter the number or text. You&apos;ll see whether it&apos;s valid and exactly which rule passes or fails.</p>
      </ToolPageHeader>
      <div className="container-page mt-6 max-w-3xl"><BarcodeValidator tool="barcode-validator" formats={["ean13", "ean8", "upca", "upce", "itf14", "itf", "code128", "code39", "code93", "codabar", "msi", "pharmacode"]} /><PrivacyNotice variant="validator" className="mt-8" /></div>
      <article className="container-page prose-page mt-16 max-w-3xl">
        <h2>What each format is checked for</h2>
        <p>The validator only applies rules the format itself defines. Formats without a check digit are checked for structure alone.</p>
        <div className="not-prose overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead><tr className="border-b border-line-2 text-mist"><th scope="col" className="py-2 pr-4 font-semibold">Format</th><th scope="col" className="py-2 font-semibold">Rules checked</th></tr></thead>
            <tbody>{RULES.map(([f, r]) => <tr key={f} className="border-b border-line align-top"><th scope="row" className="py-2.5 pr-4 font-semibold text-white">{f}</th><td className="py-2.5 text-fog">{r}</td></tr>)}</tbody>
          </table>
        </div>
        <h2>What a valid result can&apos;t tell you</h2>
        <ul>
          <li><strong>Whether the number is registered.</strong> A GTIN can have a correct check digit and still not be licensed from GS1 or assigned to any product.</li>
          <li><strong>What the product is.</strong> Barcode numbers don&apos;t contain product names or prices; those live in the retailer&apos;s or manufacturer&apos;s database.</li>
          <li><strong>Whether a printed barcode will scan.</strong> Print size, bar quality, colours and the quiet zone all matter. Scan a printed test with the <a href="/barcode-scanner/">Barcode Scanner</a>.</li>
        </ul>
        <h2>Spaces and hyphens</h2>
        <p>Numbers printed under barcodes are often grouped with spaces (like 4 006381 333931). For numeric formats, spaces and hyphens are ignored and you&apos;re told when that happens. For text formats such as Code 128 and Code 39, spaces are part of the data and are kept.</p>
      </article>
      <div className="container-page"><RelatedTools ids={["check-digit", "ean-upc-validator", "itf-14-validator", "barcode-generator", "barcode-scanner", "barcode-decoder"]} /></div>
    </>
  );
}
