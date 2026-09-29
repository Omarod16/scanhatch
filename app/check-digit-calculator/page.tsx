import { PrivacyNotice } from "@/components/privacy/PrivacyNotice";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/ToolLinks";
import { ToolPageHeader } from "@/components/ToolPageHeader";
import { CheckDigitCalculator } from "@/components/validate/CheckDigitCalculator";
import { CheckDigitTable } from "@/components/validate/CheckDigitTable";
import { gs1CheckDigitSteps, upcEToUpcABody } from "@/lib/barcode/checkdigit";
import { breadcrumbJsonLd, pageMetadata, webAppJsonLd } from "@/lib/seo";

const DESCRIPTION = "Calculate the check digit for EAN-13, EAN-8, UPC-A and ITF-14 barcodes, with the full calculation shown step by step and explained.";
export const metadata = pageMetadata({ title: "Check Digit Calculator – EAN, UPC & ITF-14", description: DESCRIPTION, path: "/check-digit-calculator/" });

const EXAMPLES = [
  { id: "ean13", name: "EAN-13", body: "400638133393", text: "Twelve digits, then the check digit. Weights alternate 1, 3, 1, 3… from the left, so the digit next to the check digit is multiplied by 3." },
  { id: "ean8", name: "EAN-8", body: "9638507", text: "Seven digits. Because the count is odd, the weights start with 3 on the left: 3, 1, 3, 1, 3, 1, 3." },
  { id: "upca", name: "UPC-A", body: "03600029145", text: "Eleven digits, weighted 3, 1, 3, 1… from the left. It's the same calculation as EAN-13 with a leading 0, which is why UPC-A and EAN-13 check digits always agree." },
  { id: "itf14", name: "ITF-14", body: "1540014128876", text: "Thirteen digits, weighted 3, 1, 3… from the left. The first digit is the packaging indicator and is included in the calculation." },
];

export default function CheckDigitPage() {
  const upceBody = upcEToUpcABody("0425261")!;
  return (
    <>
      <JsonLd data={[webAppJsonLd({ name: "ScanHatch Check Digit Calculator", description: DESCRIPTION, path: "/check-digit-calculator/" }), breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Check Digit Calculator", path: "/check-digit-calculator/" }])]} />
      <ToolPageHeader name="Check Digit Calculator" title="Check Digit Calculator">
        <p>Enter the digits of an EAN, UPC or ITF-14 number without the last digit, and see its check digit and how it was worked out.</p>
      </ToolPageHeader>
      <div className="container-page mt-6 max-w-3xl"><CheckDigitCalculator /><PrivacyNotice variant="validator" className="mt-8" /></div>
      <article className="container-page prose-page mt-16 max-w-3xl">
        <h2>How the GS1 check digit works</h2>
        <p>
          EAN-13, EAN-8, UPC-A and ITF-14 all use the same GS1 &ldquo;mod 10&rdquo; method. Starting from the digit next to the check digit and
          moving left, multiply the digits alternately by 3 and 1. Add up the results, then find the amount needed to reach the next
          multiple of 10. That amount (0–9) is the check digit.
        </p>
        <p>
          The weighting is always anchored at the right-hand end, which is why the same rule works for 8, 12, 13 and 14 digits: the
          digit immediately before the check digit is always multiplied by 3.
        </p>
        <h2>Why barcodes have check digits</h2>
        <p>
          The check digit lets a scanner or system catch mistakes. The GS1 method detects every error where a single digit is wrong,
          and most cases where two neighbouring digits are swapped. The exception is a swap of two digits that differ by 5 (such as 1 and 6),
          which produces the same total.
        </p>
        {EXAMPLES.map((e) => {
          const s = gs1CheckDigitSteps(e.body);
          return (
            <section key={e.id} id={`example-${e.id}`} className="scroll-mt-24">
              <h2>{e.name} example: {e.body}<strong>{s.check}</strong></h2>
              <p>{e.text}</p>
              <div className="not-prose my-4"><CheckDigitTable steps={s} caption={`${e.name} example calculation`} /></div>
            </section>
          );
        })}
        <h2>UPC-E is different</h2>
        <p>
          A UPC-E check digit isn&apos;t calculated from its own 8 digits. First expand it to the full UPC-A number, then apply the method above.
          For example, UPC-E 0425261 expands to UPC-A {upceBody}, whose check digit is {gs1CheckDigitSteps(upceBody).check}, so the complete
          UPC-E is 0425261{gs1CheckDigitSteps(upceBody).check}. The <a href="/ean-upc-validator/">EAN/UPC Validator</a> includes a converter that does this for you.
        </p>
      </article>
      <div className="container-page"><RelatedTools ids={["barcode-validator", "ean-upc-validator", "itf-14-validator", "barcode-generator", "barcode-scanner", "bulk-barcode"]} /></div>
    </>
  );
}
