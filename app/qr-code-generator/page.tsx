import { PrivacyNotice } from "@/components/privacy/PrivacyNotice";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { QrGenerator } from "@/components/qr/QrGenerator";
import { RelatedTools } from "@/components/ToolLinks";
import { QR_LANDINGS } from "@/lib/landing/qr";
import { breadcrumbJsonLd, pageMetadata, webAppJsonLd } from "@/lib/seo";
import { PRIVACY_PROMISE } from "@/lib/site";

const TITLE = "QR Code Generator – Custom Colours, Logos & SVG";
const DESCRIPTION =
  "Create a QR code for a link, WiFi, contact, event, location and more. Customise colours, shapes and logo, check readability, and download PNG, SVG, JPG or PDF.";

export const metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: "/qr-code-generator/" });

export default function QrCodeGeneratorPage() {
  return (
    <>
      <JsonLd
        data={[
          webAppJsonLd({ name: "ScanHatch QR Code Generator", description: DESCRIPTION, path: "/qr-code-generator/" }),
          breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "QR Code Generator", path: "/qr-code-generator/" }]),
        ]}
      />
      <div className="container-page pt-8 pb-4 sm:pt-12">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-mist">
          <ol className="flex gap-2">
            <li><Link href="/" className="hover:text-white">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-fog">QR Code Generator</li>
          </ol>
        </nav>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">QR Code Generator</h1>
        <p className="mt-3 max-w-2xl text-fog">
          Pick what the code should do, fill in the details, then style and download it. {PRIVACY_PROMISE}
        </p>
      </div>

      <div className="container-page mt-6">
        <QrGenerator />
        <PrivacyNotice variant="generator" className="mt-8" />
      </div>

      <article className="container-page prose-page mt-20 max-w-3xl">
        <h2>How to make a QR code</h2>
        <ol>
          <li><strong>Choose the content type.</strong> A website link, WiFi login, contact card, calendar event and so on. Each type is encoded in the format phones recognise, so scanning does the right thing.</li>
          <li><strong>Fill in the details.</strong> Required fields are marked with an asterisk. Problems like an invalid email address are pointed out as you type.</li>
          <li><strong>Style it if you want.</strong> Change colours, shapes and eyes, or add a logo. The readability checks next to the preview flag anything likely to cause scanning problems.</li>
          <li><strong>Download and test.</strong> Scan the code with at least one phone before you print or publish it.</li>
        </ol>

        <h2>Guides for specific QR code types</h2>
        <p>Each of these pages opens the generator with the right type selected, and explains what that kind of code contains and how to use it well:</p>
        <ul>
          {QR_LANDINGS.map((l) => <li key={l.slug}><Link href={`/${l.slug}/`}>{l.name}</Link></li>)}
        </ul>
        <h2>Which file format should I download?</h2>
        <ul>
          <li><strong>SVG</strong> is a vector file. It stays sharp at any size and is the best choice for print designers and signage.</li>
          <li><strong>PNG</strong> is best for websites, documents and slides. It supports a transparent background.</li>
          <li><strong>JPG</strong> works almost everywhere but can&apos;t be transparent.</li>
          <li><strong>PDF</strong> places the code on an A4 or US Letter page at the print width you set in the Size tab.</li>
        </ul>

        <h2>Keeping a styled QR code readable</h2>
        <p>
          Scanners look for strong contrast between the code and the background, the three square &ldquo;eyes&rdquo; in the corners,
          and an empty border around the code called the quiet zone. Most scanning problems come from breaking one of those:
        </p>
        <ul>
          <li>Use a dark code on a light background. Inverted codes (light on dark) fail on many phones.</li>
          <li>Keep a quiet zone of about four modules. Don&apos;t let other artwork touch the code.</li>
          <li>With a logo, use High error correction and keep the logo small. The code can only recover about 30% damage at best.</li>
          <li>Shorter content makes a less dense code that scans faster and from further away.</li>
        </ul>

        <h2>Static QR codes</h2>
        <p>
          Codes made here are static: the content is stored inside the code itself. They never expire and work without ScanHatch,
          but they can&apos;t be edited after printing and there are no scan statistics. Editable, trackable (dynamic) QR codes need a
          server to redirect scans and aren&apos;t offered yet.
        </p>
      </article>

      <div className="container-page">
        <RelatedTools ids={["qr-validator", "qr-scanner", "qr-decoder", "qr-wifi", "qr-vcard", "qr-size"]} />
      </div>
    </>
  );
}
