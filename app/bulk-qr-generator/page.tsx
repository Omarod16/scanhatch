import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/ToolLinks";
import { ToolPageHeader } from "@/components/ToolPageHeader";
import { BulkQrGenerator } from "@/components/bulk/BulkQrGenerator";
import { MAX_BATCH_ROWS } from "@/lib/bulk/limits";
import { breadcrumbJsonLd, pageMetadata, webAppJsonLd } from "@/lib/seo";

const DESCRIPTION = `Create up to ${MAX_BATCH_ROWS} QR codes at once from a CSV file and download them as a ZIP of PNG or SVG files. Rows are checked first, and everything runs in your browser.`;
export const metadata = pageMetadata({ title: "Bulk QR Code Generator Online – CSV to ZIP", description: DESCRIPTION, path: "/bulk-qr-generator/" });

export default function BulkQrPage() {
  return (
    <>
      <JsonLd data={[webAppJsonLd({ name: "ScanHatch Bulk QR Generator", description: DESCRIPTION, path: "/bulk-qr-generator/" }), breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Bulk QR Generator", path: "/bulk-qr-generator/" }])]} />
      <ToolPageHeader name="Bulk QR Generator" title="Bulk QR Code Generator">
        <p>Turn a spreadsheet of links or text into a ZIP of QR codes. Each row is checked before anything is generated, and you can fix problems on the page.</p>
      </ToolPageHeader>
      <div className="container-page mt-6"><BulkQrGenerator /></div>
      <article className="container-page prose-page mt-20 max-w-3xl">
        <h2>How bulk QR generation works</h2>
        <p>
          You list what each QR code should contain in a CSV file, one row per code. ScanHatch reads the file in your browser, checks
          every row, applies one design to all of them, and packs the results into a ZIP with one image per row plus an index.csv that
          maps each file back to its row.
        </p>
        <h2>Preparing your CSV</h2>
        <p>The simplest file has two columns:</p>
        <pre className="not-prose overflow-x-auto rounded-lg border border-line bg-ink-2 p-4 font-mono text-sm text-fog">{`name,data
Google,https://google.com
ScanHatch,https://scanhatch.com`}</pre>
        <ul>
          <li><strong>data</strong> (required): the link or text to encode. Columns called url, text or content also work.</li>
          <li><strong>name</strong> (optional): used for the file name, so &ldquo;Google&rdquo; becomes Google.png. Rows without a name are numbered.</li>
          <li><strong>type</strong> (optional): url, text, email or phone. Without it, links starting with https:// become URL codes and everything else is text.</li>
        </ul>
        <p>
          In Excel, Numbers or Google Sheets, save or download as <strong>CSV UTF-8</strong>. Values containing commas or line breaks are
          fine: spreadsheet apps wrap them in quotes automatically. Semicolon-separated files from European versions of Excel work too.
        </p>
        <h2>Common CSV errors</h2>
        <ul>
          <li><strong>Uploading an .xlsx file:</strong> export as CSV first.</li>
          <li><strong>&ldquo;Invalid URL&rdquo;:</strong> web addresses can&apos;t contain spaces, and need a full domain such as example.com.</li>
          <li><strong>A row has more values than columns:</strong> text with commas that isn&apos;t wrapped in double quotes, usually from a file written by hand.</li>
          <li><strong>&ldquo;Too much data&rdquo;:</strong> a single QR code holds at most about 2,300 characters at the default error correction, and much less is comfortable to scan. Shorten long links.</li>
          <li><strong>Accents look wrong:</strong> the file wasn&apos;t saved as UTF-8. Re-save it as CSV UTF-8.</li>
        </ul>
        <h2>Duplicates and invalid rows</h2>
        <p>
          Rows that repeat earlier data are flagged but not removed; you choose whether to generate them. Invalid rows are never
          silently dropped: the button tells you how many will be skipped, and you can fix them in the table or download an error report
          listing each row and problem.
        </p>
        <h2>Privacy</h2>
        <p>
          Your CSV is read by your browser and never uploaded. The QR codes and the ZIP file are created on your device, and ScanHatch
          receives none of your data.
        </p>
        <h2>Limits</h2>
        <p>
          Up to {MAX_BATCH_ROWS} codes per batch and CSV files up to 1 MB, so generation stays reliable on ordinary laptops and phones. For
          more, split your file into several batches. Bulk codes use one plain style (colours, margin, error correction and an optional
          logo); for gradients, custom dots and eye shapes, use the individual <a href="/qr-code-generator/">QR Code Generator</a>.
        </p>
      </article>
      <div className="container-page"><RelatedTools ids={["qr-generator", "qr-validator", "qr-scanner", "qr-decoder", "bulk-barcode", "qr-wifi"]} /></div>
    </>
  );
}
