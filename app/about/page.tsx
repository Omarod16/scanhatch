import Link from "next/link";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { pageMetadata } from "@/lib/seo";
import { OWNER } from "@/lib/site";

const DESCRIPTION = "About ScanHatch: who runs it, what its QR code and barcode tools do, how they handle your data, how the guides are written, and how to get in touch.";
export const metadata = pageMetadata({ title: "About", description: DESCRIPTION, path: "/about/" });

export default function AboutPage() {
  return (
    <LegalLayout
      name="About ScanHatch"
      path="/about/"
      updated="2026-09-30"
      intro={
        <p className="text-lg">
          ScanHatch is a free website for creating, scanning and checking QR codes and barcodes. It&apos;s run by {OWNER.operatorName} from
          the United Kingdom.
        </p>
      }
      sections={[
        {
          id: "why", title: "Why ScanHatch exists",
          body: <>
            <p>
              Making a QR code or checking a barcode is a small job, and it shouldn&apos;t need an account, a subscription or sending your data
              to someone else&apos;s server. ScanHatch is built around a few simple principles:
            </p>
            <ul>
              <li><strong>No accounts.</strong> Every tool works straight away, with nothing to sign up for.</li>
              <li><strong>Your data stays with you.</strong> Codes are created, scanned and checked in your browser. What you type or upload isn&apos;t sent to ScanHatch.</li>
              <li><strong>Codes that don&apos;t expire.</strong> QR codes made here contain their content directly, so they keep working without ScanHatch.</li>
              <li><strong>Honest limits.</strong> The tools say what they can&apos;t do, such as registering barcode numbers, which only GS1 can issue.</li>
            </ul>
          </>,
        },
        {
          id: "tools", title: "What you can do here",
          body: <>
            <ul>
              <li>Create <Link href="/qr-code-generator/">QR codes</Link> for links, WiFi, contacts, messages, locations and more, with your own colours and logo.</li>
              <li>Create <Link href="/barcode-generator/">barcodes</Link> in 15 formats, including EAN-13, UPC-A, Code 128, ITF-14 and Data Matrix, with check digits calculated for you.</li>
              <li><Link href="/scanner/">Scan codes with your camera</Link>, or read them from an image with the <Link href="/qr-decoder/">QR</Link> and <Link href="/barcode-decoder/">barcode</Link> decoders.</li>
              <li>Check numbers and codes with the <Link href="/barcode-validator/">Barcode Validator</Link>, <Link href="/check-digit-calculator/">Check Digit Calculator</Link> and <Link href="/qr-validator/">QR Validator</Link>.</li>
              <li>Make hundreds of codes at once from a spreadsheet with the <Link href="/bulk-qr-generator/">bulk QR</Link> and <Link href="/bulk-barcode-generator/">bulk barcode</Link> generators.</li>
            </ul>
            <p>Downloads are print-ready: vector SVG and PDF for print, and PNG or JPG for screens.</p>
          </>,
        },
        {
          id: "guides", title: "How the guides are written",
          body: <>
            <p>
              The <Link href="/blog/">guides</Link> explain how QR codes and barcodes work and how to use them well. Technical details are checked
              against published documentation, such as GS1&apos;s specifications and DENSO WAVE&apos;s QR code pages, and worked examples are
              checked against ScanHatch&apos;s own generators. Articles list their sources where they make technical claims, and example data is
              always made up.
            </p>
            <p>ScanHatch isn&apos;t affiliated with GS1, DENSO WAVE or any other standards organisation. If you spot a mistake, please let us know.</p>
          </>,
        },
        {
          id: "privacy", title: "Your privacy",
          body: <p>
            ScanHatch doesn&apos;t use accounts or set cookies, and there&apos;s no advertising or analytics on the site at the moment. The only
            thing kept in your browser is a short scan history, until you close the tab. The <Link href="/privacy-policy/">privacy policy</Link> and{" "}
            <Link href="/cookie-policy/">cookie policy</Link> explain the details, and the <Link href="/terms/">terms</Link> cover using the site.
          </p>,
        },
        {
          id: "contact", title: "Get in touch",
          body: <p>
            For questions, corrections, bug reports or privacy requests, email{" "}
            {OWNER.contactEmail && <a href={`mailto:${OWNER.contactEmail}`}>{OWNER.contactEmail}</a>} or see the <Link href="/contact/">contact page</Link>.
          </p>,
        },
      ]}
    />
  );
}
