import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/ToolLinks";
import { ToolPageHeader } from "@/components/ToolPageHeader";
import { DecoderTool } from "@/components/scanner/ScannerTool";
import { READABLE_FORMAT_NAMES } from "@/lib/scanner/formats";
import { breadcrumbJsonLd, pageMetadata, webAppJsonLd } from "@/lib/seo";

const DESCRIPTION = "Read a barcode from a photo or image file. Detects EAN-13, UPC, Code 128, Code 39, ITF, Data Matrix, PDF417 and more, and shows the exact value. Runs in your browser.";
export const metadata = pageMetadata({ title: "Barcode Decoder – Read a Barcode From an Image", description: DESCRIPTION, path: "/barcode-decoder/" });

export default function BarcodeDecoderPage() {
  return (
    <>
      <JsonLd data={[webAppJsonLd({ name: "ScanHatch Barcode Decoder", description: DESCRIPTION, path: "/barcode-decoder/" }), breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Barcode Decoder", path: "/barcode-decoder/" }])]} />
      <ToolPageHeader name="Barcode Decoder" title="Barcode Decoder">
        <p>Upload a photo or image of a barcode to see its format and value. Useful for checking artwork, supplier labels and barcodes you&apos;ve generated.</p>
      </ToolPageHeader>
      <div className="container-page mt-6 max-w-3xl"><DecoderTool mode="barcode" /></div>
      <article className="container-page prose-page mt-16 max-w-3xl">
        <h2>Photographing a barcode so it decodes</h2>
        <ul>
          <li>Shoot straight on, not at an angle, so the bars keep their proportions.</li>
          <li>Include the blank margins at both ends. Cropping too tight removes the quiet zone scanners need.</li>
          <li>Make sure the narrowest bars are sharp. Blurry photos of small barcodes are the most common failure.</li>
          <li>Rotated images are fine; the decoder tries different orientations.</li>
        </ul>
        <h2>Checking a barcode you generated</h2>
        <p>
          Download your barcode from the <a href="/barcode-generator/">Barcode Generator</a> as PNG and drop it here. If the
          decoded value matches what you entered, the barcode is structurally correct. It&apos;s still worth testing a printed
          copy with the scanner that will be used, because print size and quality matter too.
        </p>
        <h2>Formats</h2>
        <p>Reads {READABLE_FORMAT_NAMES.barcode.join(", ")}. MSI and Pharmacode can be generated on ScanHatch but can&apos;t be decoded here.</p>
      </article>
      <div className="container-page"><RelatedTools ids={["barcode-scanner", "barcode-generator", "qr-decoder", "barcode-validator", "check-digit", "scanner"]} /></div>
    </>
  );
}
