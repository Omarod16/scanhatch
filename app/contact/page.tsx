import Link from "next/link";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { pageMetadata } from "@/lib/seo";
import { OWNER } from "@/lib/site";

const DESCRIPTION = "Contact ScanHatch with bug reports, feedback, questions about QR codes and barcodes, or privacy requests.";
export const metadata = pageMetadata({ title: "Contact", description: DESCRIPTION, path: "/contact/" });

export default function ContactPage() {
  return (
    <LegalLayout
      name="Contact"
      path="/contact/"
      updated={null}
      intro={
        OWNER.contactEmail ? (
          <p className="text-lg">
            Email <a href={`mailto:${OWNER.contactEmail}`}>{OWNER.contactEmail}</a>. Replies can take a few days.
          </p>
        ) : (
          <p className="text-lg" data-testid="contact-pending">
            A contact email address for ScanHatch will be published on this page. Replies can take a few days.
          </p>
        )
      }
      sections={[
        {
          id: "bugs", title: "Reporting a bug",
          body: <>
            <p>These details help us reproduce a problem quickly:</p>
            <ul>
              <li>the page address, for example /qr-scanner/;</li>
              <li>your device and browser, for example iPhone 15 with Safari, or Windows with Chrome;</li>
              <li>what you did, what you expected, and what happened instead, with any error message;</li>
              <li>for codes that won&apos;t scan, the downloaded file and the app or scanner you used.</li>
            </ul>
            <p>Please don&apos;t send real passwords or personal details. Recreate the problem with made-up values instead.</p>
          </>,
        },
        {
          id: "feedback", title: "Feedback and questions",
          body: <p>
            Suggestions for new tools or formats, corrections to our <Link href="/blog/">guides</Link>, and general questions about QR codes and
            barcodes are all welcome. We can&apos;t issue or register barcode numbers; for retail product numbers, contact GS1 in your country.
          </p>,
        },
        {
          id: "privacy", title: "Privacy requests",
          body: <p>
            For questions about your information or to exercise your privacy rights, use the contact details above and mention “privacy” in the
            subject. The <Link href="/privacy-policy/">privacy policy</Link> explains what ScanHatch does and doesn&apos;t hold.
          </p>,
        },
      ]}
    />
  );
}
