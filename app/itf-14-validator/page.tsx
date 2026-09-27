import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/ToolLinks";
import { ToolPageHeader } from "@/components/ToolPageHeader";
import { BarcodeValidator } from "@/components/validate/BarcodeValidator";
import { gs1CheckDigit } from "@/lib/barcode/checkdigit";
import { breadcrumbJsonLd, pageMetadata, webAppJsonLd } from "@/lib/seo";

const DESCRIPTION = "Validate an ITF-14 (GTIN-14) carton number or calculate its check digit from 13 digits. Explains the indicator digit and how the check digit works.";
export const metadata = pageMetadata({ title: "ITF-14 Validator & Check Digit Calculator (GTIN-14)", description: DESCRIPTION, path: "/itf-14-validator/" });

export default function Itf14ValidatorPage() {
  const product = "501234567890";
  const product13 = product + gs1CheckDigit(product);
  const body = "1" + product;
  const case14 = body + gs1CheckDigit(body);
  return (
    <>
      <JsonLd data={[webAppJsonLd({ name: "ScanHatch ITF-14 Validator", description: DESCRIPTION, path: "/itf-14-validator/" }), breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "ITF-14 Validator", path: "/itf-14-validator/" }])]} />
      <ToolPageHeader name="ITF-14 Validator" title="ITF-14 Validator">
        <p>Enter 13 digits to calculate the check digit, or all 14 to check a carton number you already have.</p>
      </ToolPageHeader>
      <div className="container-page mt-6 max-w-3xl"><BarcodeValidator tool="itf-14-validator" formats={["itf14"]} calculateMissingCheck /></div>
      <article className="container-page prose-page mt-16 max-w-3xl">
        <h2>What an ITF-14 number contains</h2>
        <p>ITF-14 barcodes carry a GTIN-14, which identifies a case or carton of products rather than a single item. The 14 digits are:</p>
        <ul>
          <li><strong>Indicator digit (1st):</strong> 1–8 distinguish pack configurations of the same product (for example a case of 6 and a case of 24). 9 marks variable-measure items. 0 means the carton uses the item&apos;s own GTIN-13 or GTIN-12.</li>
          <li><strong>Company prefix and item reference (next 12):</strong> usually the same as the product&apos;s EAN-13 without its check digit.</li>
          <li><strong>Check digit (last):</strong> calculated again over all 13 preceding digits.</li>
        </ul>
        <p>
          For example, a product with EAN-13 <span className="font-mono">{product13}</span> packed in cases could use GTIN-14{" "}
          <span className="font-mono">{case14}</span>: indicator 1, the same 12 digits, and a new check digit. The check digit
          changes because the indicator digit is part of the calculation, so you can&apos;t simply put a digit in front of an EAN-13.
        </p>
        <h2>Purpose of the check digit</h2>
        <p>
          Warehouse scanners and people typing numbers into systems both make mistakes. The last digit is calculated from the other 13
          using the GS1 mod 10 method (weights 3 and 1 alternating from the right). If any single digit is misread or mistyped, the calculation
          no longer matches, and the error is caught before the wrong carton is shipped or received.
        </p>
        <h2>Printing ITF-14</h2>
        <p>
          ITF-14 is designed for corrugated cardboard, so it&apos;s printed large (a narrow bar of about 0.5–1 mm) with a thick bearer
          bar border that stops scanners reading a partial code. Create one with the <a href="/barcode-generator/#itf14">ITF-14 generator</a>.
        </p>
      </article>
      <div className="container-page"><RelatedTools ids={["check-digit", "barcode-generator", "barcode-validator", "ean-upc-validator", "barcode-scanner", "barcode-decoder"]} /></div>
    </>
  );
}
