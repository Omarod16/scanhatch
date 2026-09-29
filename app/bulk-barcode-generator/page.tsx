import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/ToolLinks";
import { ToolPageHeader } from "@/components/ToolPageHeader";
import { BulkBarcodeGenerator } from "@/components/bulk/BulkBarcodeGenerator";
import { BARCODE_FORMATS } from "@/lib/barcode/formats";
import { MAX_BATCH_ROWS } from "@/lib/bulk/limits";
import { breadcrumbJsonLd, pageMetadata, webAppJsonLd } from "@/lib/seo";

const DESCRIPTION = `Generate up to ${MAX_BATCH_ROWS} barcodes from a CSV: EAN-13, UPC-A, Code 128, ITF-14, Data Matrix and more. Every row is validated and the ZIP is built in your browser.`;
export const metadata = pageMetadata({ title: "Bulk Barcode Generator Online – CSV to ZIP", description: DESCRIPTION, path: "/bulk-barcode-generator/" });

export default function BulkBarcodePage() {
  return (
    <>
      <JsonLd data={[webAppJsonLd({ name: "ScanHatch Bulk Barcode Generator", description: DESCRIPTION, path: "/bulk-barcode-generator/" }), breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Bulk Barcode Generator", path: "/bulk-barcode-generator/" }])]} />
      <ToolPageHeader name="Bulk Barcode Generator" title="Bulk Barcode Generator">
        <p>Create a whole set of barcodes from one CSV file. Each value is validated (including check digits) before generation, and formats can be mixed in a single file.</p>
      </ToolPageHeader>
      <div className="container-page mt-6"><BulkBarcodeGenerator /></div>
      <article className="container-page prose-page mt-20 max-w-3xl">
        <h2>How it works</h2>
        <p>
          Each row of your CSV becomes one barcode image. ScanHatch checks every value with the same rules as the{" "}
          <a href="/barcode-validator/">Barcode Validator</a>, shows you exactly which rows have problems, and then builds a ZIP with one file per
          barcode and an index.csv that lists each file&apos;s row, name and value.
        </p>
        <h2>CSV format</h2>
        <pre className="not-prose overflow-x-auto rounded-lg border border-line bg-ink-2 p-4 font-mono text-sm text-fog">{`type,name,value
code128,Product A,ABC123
ean13,Product B,4006381333931
upca,Product C,036000291452`}</pre>
        <ul>
          <li><strong>value</strong> (required): the barcode data. Columns called data, barcode, code or gtin also work.</li>
          <li><strong>type</strong> (optional): the format for that row, such as ean13, EAN-13, upca, code128 or itf14. Without a type column, choose one format for the whole file on the page.</li>
          <li><strong>name</strong> (optional): used for the file name. Without it, the value is used (for example 4006381333931.png).</li>
        </ul>
        <p>Supported types: {BARCODE_FORMATS.map((f) => f.name).join(", ")}.</p>
        <h2>Check digits</h2>
        <p>
          EAN-13, EAN-8, UPC-A, UPC-E and ITF-14 values must include a correct check digit. If your list has the numbers without it, turn on
          &ldquo;Automatically calculate missing check digits&rdquo;: values that are exactly one digit short get their check digit added, and the
          table shows each change (for example 400638133393 → 4006381333931). Values with a wrong check digit are never corrected; they&apos;re
          reported, because a wrong digit usually means a typo elsewhere in the number.
        </p>
        <h2>Preparing data in a spreadsheet</h2>
        <ul>
          <li><strong>Leading zeros:</strong> Excel removes them from numbers (036000291452 becomes 36000291452). Format the column as Text before typing or pasting, or the check will fail.</li>
          <li><strong>Scientific notation:</strong> long numbers may show as 4.00638E+12 and be saved that way. Again, format the column as Text.</li>
          <li><strong>Save as CSV UTF-8</strong>, not .xlsx.</li>
        </ul>
        <h2>Privacy and limits</h2>
        <p>
          Your file is read and processed entirely in your browser; values and names are never uploaded. Batches are limited to {MAX_BATCH_ROWS} rows
          and 1 MB so generation stays responsive. Split larger lists into several files. PNG and SVG output are available; for a vector PDF of a
          single barcode, use the <a href="/barcode-generator/">Barcode Generator</a>.
        </p>
      </article>
      <div className="container-page"><RelatedTools ids={["barcode-generator", "barcode-validator", "barcode-scanner", "check-digit", "ean-upc-validator", "bulk-qr"]} /></div>
    </>
  );
}
