import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/ToolLinks";
import { ToolPageHeader } from "@/components/ToolPageHeader";
import { ScannerTool } from "@/components/scanner/ScannerTool";
import { READABLE_FORMAT_NAMES } from "@/lib/scanner/formats";
import { breadcrumbJsonLd, pageMetadata, webAppJsonLd } from "@/lib/seo";

const DESCRIPTION = "Scan QR codes and barcodes with your camera or from an image, right in your browser. Reads QR, EAN, UPC, Code 128, Data Matrix, PDF417 and more.";
export const metadata = pageMetadata({ title: "QR Code & Barcode Scanner Online", description: DESCRIPTION, path: "/scanner/" });

export default function ScannerPage() {
  return (
    <>
      <JsonLd data={[webAppJsonLd({ name: "ScanHatch Scanner", description: DESCRIPTION, path: "/scanner/" }), breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Scanner", path: "/scanner/" }])]} />
      <ToolPageHeader name="Scanner" title="QR Code & Barcode Scanner">
        <p>Point your camera at a QR code or barcode, or upload a picture of one. Works on phones, tablets and computers with a camera.</p>
      </ToolPageHeader>
      <div className="container-page mt-6 max-w-3xl"><ScannerTool mode="all" /></div>
      <article className="container-page prose-page mt-16 max-w-3xl">
        <h2>How to scan</h2>
        <ol>
          <li>Select <strong>Start camera</strong> and allow camera access when your browser asks.</li>
          <li>Hold the code inside the frame, about 10–30 cm from the lens, until it&apos;s in focus.</li>
          <li>When a code is detected the camera switches off and the result appears. Nothing opens until you choose to.</li>
        </ol>
        <p>No camera, or scanning a screenshot? Use <strong>Upload image</strong> instead.</p>
        <h2>What it can read</h2>
        <p><strong>2D codes:</strong> {[...READABLE_FORMAT_NAMES.qr, "Data Matrix", "PDF417", "Aztec"].join(", ")}.</p>
        <p><strong>Barcodes:</strong> {READABLE_FORMAT_NAMES.barcode.filter((f) => !["Data Matrix", "PDF417", "Aztec"].includes(f)).join(", ")}. MSI and Pharmacode aren&apos;t supported.</p>
        <h2>If the camera doesn&apos;t work</h2>
        <ul>
          <li><strong>Permission blocked:</strong> open your browser&apos;s site settings for scanhatch.com and allow the camera, then reload.</li>
          <li><strong>Camera in use:</strong> close video calls or other tabs using the camera.</li>
          <li><strong>Blurry image:</strong> move back slightly; most phone cameras can&apos;t focus closer than about 10 cm.</li>
          <li><strong>Glare:</strong> tilt the code or the phone so light doesn&apos;t reflect off glossy packaging or screens.</li>
        </ul>
        <h2>Privacy</h2>
        <p>
          The camera feed is processed frame by frame inside your browser and is never recorded or uploaded. The camera turns
          off as soon as a code is found, when you pause, or when you switch to another tab.
        </p>
      </article>
      <div className="container-page"><RelatedTools ids={["qr-scanner", "barcode-scanner", "qr-decoder", "barcode-decoder", "qr-generator", "barcode-generator"]} /></div>
    </>
  );
}
