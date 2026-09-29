import { PrivacyNotice } from "@/components/privacy/PrivacyNotice";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/ToolLinks";
import { ToolPageHeader } from "@/components/ToolPageHeader";
import { ScannerTool } from "@/components/scanner/ScannerTool";
import { breadcrumbJsonLd, pageMetadata, webAppJsonLd } from "@/lib/seo";

const DESCRIPTION = "Scan a QR code with your camera and see exactly what it contains before you open it. Reads links, WiFi, contacts, events and more, privately in your browser.";
export const metadata = pageMetadata({ title: "QR Code Scanner – See What a QR Code Contains", description: DESCRIPTION, path: "/qr-scanner/" });

export default function QrScannerPage() {
  return (
    <>
      <JsonLd data={[webAppJsonLd({ name: "ScanHatch QR Scanner", description: DESCRIPTION, path: "/qr-scanner/" }), breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "QR Scanner", path: "/qr-scanner/" }])]} />
      <ToolPageHeader name="QR Scanner" title="QR Code Scanner">
        <p>Scan a QR code and check what&apos;s inside before acting on it. Links, WiFi details, contacts and events are shown in a readable form.</p>
      </ToolPageHeader>
      <div className="container-page mt-6 max-w-3xl"><ScannerTool mode="qr" /></div>
      <article className="container-page prose-page mt-16 max-w-3xl">
        <h2>What happens when a QR code is scanned</h2>
        <p>
          ScanHatch shows the content and never acts on it by itself. For a link you see the website&apos;s address and choose
          whether to open it. For WiFi you see the network name and can reveal or copy the password. Phone numbers, emails and
          text messages have buttons you press yourself.
        </p>
        <h2>Checking a QR code link before you open it</h2>
        <p>QR codes are sometimes stuck over genuine ones on parking meters, posters and restaurant tables to send people to fake sites. Before opening a link:</p>
        <ul>
          <li>Read the website name. Does it match the business you expect, spelled correctly?</li>
          <li>Be wary of link shorteners or unfamiliar domains asking for card details or logins.</li>
          <li>Look for a sticker placed over the original code.</li>
          <li>If in doubt, type the business&apos;s address yourself instead of following the code.</li>
        </ul>
        <p>ScanHatch points out some warning signs, such as unencrypted links or hidden logins in the address, but it can&apos;t tell you whether a site is safe.</p>
        <h2>Why won&apos;t my QR code scan?</h2>
        <ul>
          <li>The code is too small or too far away: move closer until it fills about half the frame.</li>
          <li>Low contrast or inverted colours (light code on dark background) confuse many scanners.</li>
          <li>Part of the code is covered, torn or reflecting light.</li>
          <li>It may not be a QR code at all. Try the <a href="/scanner/">universal scanner</a>.</li>
        </ul>
      </article>
      <div className="container-page mt-10 max-w-3xl"><PrivacyNotice variant="scanner" /></div>
      <div className="container-page"><RelatedTools ids={["qr-decoder", "qr-generator", "scanner", "barcode-scanner", "qr-validator", "qr-wifi"]} /></div>
    </>
  );
}
