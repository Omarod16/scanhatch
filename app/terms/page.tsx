import Link from "next/link";
import { ContactLine, LegalLayout } from "@/components/legal/LegalLayout";
import { pageMetadata } from "@/lib/seo";
import { OWNER } from "@/lib/site";

const DESCRIPTION = "The terms for using ScanHatch's free QR code and barcode tools: acceptable use, your responsibility for content, barcode number ownership, generated files and limitations.";
export const metadata = pageMetadata({ title: "Terms of Use", description: DESCRIPTION, path: "/terms/" });

export default function TermsPage() {
  const sections = [
    {
      id: "service", title: "The service",
      body: <p>
        ScanHatch provides free tools for creating, scanning, decoding and checking QR codes and barcodes, including bulk generation and
        educational guides. The tools run in your web browser. There are no accounts, and you don&apos;t need to register. By using ScanHatch
        you agree to these terms.
      </p>,
    },
    {
      id: "acceptable-use", title: "Acceptable use",
      body: <>
        <p>You may use ScanHatch for personal and commercial purposes. You must not use it to:</p>
        <ul>
          <li>create codes that lead to phishing, fraud, malware or other harmful destinations, or that impersonate another organisation;</li>
          <li>create codes containing content that is unlawful, or that infringes someone else&apos;s rights;</li>
          <li>place codes over genuine ones, for example on parking meters or payment signs, to mislead people;</li>
          <li>interfere with the site, overload it with automated requests, or try to get around its security;</li>
          <li>copy or republish the site&apos;s pages, guides or design as your own.</li>
        </ul>
      </>,
    },
    {
      id: "your-content", title: "Your content and responsibility",
      body: <>
        <p>
          You&apos;re responsible for the information you put into codes, and for how and where you use the codes you create. That includes
          making sure you&apos;re allowed to use any logo you add and any link or contact details you encode.
        </p>
        <p>
          Anything placed in a QR code or barcode can be read by anyone who scans it. Don&apos;t encode information you want to keep private: for
          WiFi codes shown in public, use a guest network. The <Link href="/privacy-policy/">privacy policy</Link> explains how ScanHatch handles what you enter.
        </p>
      </>,
    },
    {
      id: "numbers", title: "Barcode numbers and registration",
      body: <>
        <p>
          ScanHatch draws barcode symbols from the numbers and text you supply. It doesn&apos;t issue, register or license barcode numbers,
          and generating a barcode doesn&apos;t give you ownership of a number or make it valid for retail.
        </p>
        <p>
          Numbers used on retail products (EAN, UPC, ITF-14 and other GTINs) are normally licensed from GS1 or an authorised reseller, and
          retailers may refuse products without properly assigned numbers. Checking whether your numbers and labels meet GS1, retailer or
          regulatory requirements is your responsibility.
        </p>
      </>,
    },
    {
      id: "outputs", title: "Generated files and intellectual property",
      body: <>
        <p>
          You may use the QR codes, barcodes and files you create with ScanHatch however you like, including commercially, subject to these
          terms and to the rights of others in what you encode. We don&apos;t claim ownership of your content or your generated files.
        </p>
        <p>
          The ScanHatch website, including its text, guides, design and software, belongs to ScanHatch or its licensors. You may link to it and
          quote short extracts with attribution, but not copy it wholesale. “QR Code” is a registered trademark of DENSO WAVE INCORPORATED.
          GS1, EAN and UPC are associated with GS1. ScanHatch isn&apos;t affiliated with either organisation.
        </p>
      </>,
    },
    {
      id: "scanning", title: "No guarantee that codes will scan",
      body: <p>
        ScanHatch checks codes and warns about common problems, but whether a code scans in practice depends on its printed size, print
        quality, materials, colours, lighting and the scanner or phone used. We can&apos;t guarantee that a code will scan in every situation.
        Test printed codes with the devices they&apos;re meant for before producing them in quantity.
      </p>,
    },
    {
      id: "accuracy", title: "Accuracy and errors",
      body: <p>
        We work to keep the tools and guides accurate, but they may contain errors or become out of date, and standards change. The tools and
        information are provided for general use, and aren&apos;t professional, legal or compliance advice. Check anything important against the
        relevant standard or with the organisation that requires it.
      </p>,
    },
    {
      id: "third-party", title: "Third-party links and services",
      body: <p>
        Codes and scan results may point to websites and apps run by others, such as WhatsApp or Google Maps. We don&apos;t control them and
        aren&apos;t responsible for their content, availability or privacy practices. A scanner showing a link doesn&apos;t mean the link is safe:
        check it before opening.
      </p>,
    },
    {
      id: "availability", title: "Availability and changes",
      body: <p>
        ScanHatch is provided free of charge and “as is”. We may change, suspend or withdraw any tool or page at any time, and we don&apos;t
        promise that the site will always be available or free of faults. Keep your own copies of files you need.
      </p>,
    },
    {
      id: "liability", title: "Liability",
      body: <p>
        As far as the law allows, ScanHatch isn&apos;t liable for losses arising from your use of the site or of codes created with it, including
        codes that don&apos;t scan, printing costs, rejected products or business losses. Nothing in these terms limits liability that can&apos;t
        legally be limited, or affects your statutory rights as a consumer.
      </p>,
    },
    ...(OWNER.governingLaw
      ? [{ id: "law", title: "Governing law", body: <p>These terms are governed by the law of {OWNER.governingLaw}, whose courts have jurisdiction over any dispute, subject to any mandatory consumer protections where you live.</p> }]
      : []),
    {
      id: "changes", title: "Changes to these terms",
      body: <p>We may update these terms, for example when we add features. The date at the top shows when they last changed. Continuing to use ScanHatch after a change means you accept the updated terms.</p>,
    },
    {
      id: "contact", title: "Contact",
      body: <p>For questions about these terms, <ContactLine email={OWNER.contactEmail} />.</p>,
    },
  ];
  return (
    <LegalLayout
      name="Terms of Use"
      path="/terms/"
      intro={<p>These terms cover your use of ScanHatch and the codes you create with it. They&apos;re written to be read, so please do.</p>}
      sections={sections}
    />
  );
}
