import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/ToolLinks";
import { ToolPageHeader } from "@/components/ToolPageHeader";
import { QrValidator } from "@/components/validate/QrValidator";
import { breadcrumbJsonLd, pageMetadata, webAppJsonLd } from "@/lib/seo";

const DESCRIPTION = "Check a QR code before you print or share it: decode it, validate links, WiFi, contacts and events, and test the image's contrast, margin and logo coverage.";
export const metadata = pageMetadata({ title: "QR Code Validator – Check Content and Readability", description: DESCRIPTION, path: "/qr-validator/" });

export default function QrValidatorPage() {
  return (
    <>
      <JsonLd data={[webAppJsonLd({ name: "ScanHatch QR Validator", description: DESCRIPTION, path: "/qr-validator/" }), breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "QR Validator", path: "/qr-validator/" }])]} />
      <ToolPageHeader name="QR Validator" title="QR Code Validator">
        <p>Upload a QR code image to check that it decodes, that its content is correctly formatted, and how robust the image is. Or scan one with your camera to check its content.</p>
      </ToolPageHeader>
      <div className="container-page mt-6 max-w-3xl"><QrValidator /></div>
      <article className="container-page prose-page mt-16 max-w-3xl">
        <h2>Content checks</h2>
        <p>After decoding, the content is checked against the rules for its type:</p>
        <ul>
          <li><strong>Links:</strong> a valid address, https rather than http, and signs of disguise such as login details before the domain, look-alike international characters, raw IP addresses and link shorteners.</li>
          <li><strong>WiFi:</strong> a network name, a known security type, and a password of valid length (WPA needs 8–63 characters).</li>
          <li><strong>Email, phone and SMS:</strong> valid addresses and numbers.</li>
          <li><strong>Contacts and events:</strong> complete vCard and calendar structures, a name or title, and valid dates in the right order.</li>
          <li><strong>Locations:</strong> latitude and longitude within range.</li>
          <li><strong>Text:</strong> for example a web address missing https://, which many phones won&apos;t treat as a link.</li>
        </ul>
        <p>Valid means well-formed. It doesn&apos;t mean safe: a perfectly formatted link can still lead to a scam site.</p>
        <h2>Readability checks</h2>
        <ul>
          <li><strong>Error correction used:</strong> QR codes contain spare data so they can be read when partly covered. The decoder reports how much of that spare capacity it needed. A logo or damage uses it up, leaving less margin for glare, creases and print defects.</li>
          <li><strong>Contrast</strong> between dark and light modules.</li>
          <li><strong>Quiet zone:</strong> the blank margin, which the QR standard sets at 4 modules.</li>
          <li><strong>Module size</strong> in the image, which affects how sharply it can be printed.</li>
          <li><strong>Inverted colours</strong>, which many phone scanners can&apos;t read.</li>
        </ul>
        <p>
          A &ldquo;Likely readable&rdquo; result means the image itself looks healthy. It isn&apos;t a guarantee: the printed size and the distance
          it&apos;s scanned from matter just as much. As a rule of thumb, a QR code should be at least about a tenth as wide as the scanning distance.
        </p>
      </article>
      <div className="container-page"><RelatedTools ids={["qr-generator", "qr-scanner", "qr-decoder", "barcode-validator", "scanner", "qr-size"]} /></div>
    </>
  );
}
