import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/ToolLinks";
import { ToolPageHeader } from "@/components/ToolPageHeader";
import { DecoderTool } from "@/components/scanner/ScannerTool";
import { PrivacyNotice } from "@/components/privacy/PrivacyNotice";
import { breadcrumbJsonLd, pageMetadata, webAppJsonLd } from "@/lib/seo";

const DESCRIPTION = "Decode a QR code from an image, screenshot or photo. Upload, drag and drop or paste a PNG, JPG or WEBP and see its content. No upload to any server.";
export const metadata = pageMetadata({ title: "QR Code Decoder – Read a QR Code From an Image", description: DESCRIPTION, path: "/qr-decoder/" });

export default function QrDecoderPage() {
  return (
    <>
      <JsonLd data={[webAppJsonLd({ name: "ScanHatch QR Decoder", description: DESCRIPTION, path: "/qr-decoder/" }), breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "QR Decoder", path: "/qr-decoder/" }])]} />
      <ToolPageHeader name="QR Decoder" title="QR Code Decoder">
        <p>Upload, drop or paste an image to read the QR code in it.</p>
      </ToolPageHeader>
      <div className="container-page mt-6 max-w-3xl"><DecoderTool mode="qr" hideEmptyHistory /></div>
      <article className="container-page prose-page mt-16 max-w-3xl">
        <h2>When to decode from an image</h2>
        <ul>
          <li>The QR code is on your phone&apos;s own screen, in an email, a PDF or a message.</li>
          <li>You want to check what a code contains before scanning it with your phone.</li>
          <li>You made a QR code and want to confirm it reads back correctly before printing.</li>
        </ul>
        <h2>Getting a good result</h2>
        <ul>
          <li>Screenshots work best. Crop so the QR code is clearly visible, with its white border.</li>
          <li>For photos, keep the code flat, in focus and evenly lit.</li>
          <li>Images with several QR codes are supported; each one is listed.</li>
        </ul>
        <p>Accepted files: PNG, JPG and WEBP up to 10 MB and 40 megapixels. SVG and other formats are refused for safety.</p>
        <h2>Is my image uploaded?</h2>
        <p>No. The image is read and decoded by your browser. ScanHatch never receives the file or what it contains.</p>
      </article>
      <div className="container-page mt-10 max-w-3xl"><PrivacyNotice variant="scanner" /></div>
      <div className="container-page"><RelatedTools ids={["qr-scanner", "barcode-decoder", "qr-generator", "qr-validator", "scanner", "barcode-generator"]} /></div>
    </>
  );
}
