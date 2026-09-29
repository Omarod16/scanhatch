import Link from "next/link";
import { ContactLine, LegalLayout, LegalTable } from "@/components/legal/LegalLayout";
import { pageMetadata } from "@/lib/seo";
import { OWNER } from "@/lib/site";

const DESCRIPTION = "How ScanHatch handles your information: the tools run in your browser, scan history stays in session storage, what our host sees, and your privacy rights.";
export const metadata = pageMetadata({ title: "Privacy Policy", description: DESCRIPTION, path: "/privacy-policy/" });

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      name="Privacy Policy"
      path="/privacy-policy/"
      intro={
        <>
          <p>
            This policy explains what happens to information when you use ScanHatch (scanhatch.com), a free website for creating,
            scanning, decoding and checking QR codes and barcodes. It describes how the site actually works today, and we&apos;ll update it before
            anything described here changes.
          </p>
          <div className="not-prose rounded-xl border border-line bg-ink-2 p-5 text-sm text-fog">
            <p className="font-semibold text-white">In short</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>The tools run in your browser. What you type, upload or scan isn&apos;t sent to ScanHatch.</li>
              <li>We don&apos;t use accounts, and we don&apos;t set cookies.</li>
              <li>The scanner keeps your recent scans in your browser tab&apos;s session storage until you clear them or close the tab.</li>
              <li>Like any website, our hosting provider (Cloudflare) processes technical data such as IP addresses to deliver pages.</li>
              <li>There are no analytics or advertising services running on the site at the moment.</li>
            </ul>
          </div>
        </>
      }
      sections={[
        {
          id: "who", title: "Who runs ScanHatch",
          body: <>
            <p>
              ScanHatch is an independent website operated from the United Kingdom{OWNER.operatorName ? <> by {OWNER.operatorName}, who is responsible for your information as described here</> : null}.
              To contact us about privacy, <ContactLine email={OWNER.contactEmail} />.
            </p>
          </>,
        },
        {
          id: "tools", title: "What you enter into the tools",
          body: <>
            <p>
              You may enter personal or sensitive information into ScanHatch: WiFi network names and passwords, email addresses, phone numbers,
              contact cards, web addresses, messages, barcode numbers, or files and images containing codes.
            </p>
            <p>
              ScanHatch is built so that this processing happens in your browser, on your device. We tested every tool by entering dummy values
              (including a WiFi password, a name, a phone number and an email address) and inspecting all network traffic: none of the values were
              included in any request, and the only requests were for the website&apos;s own files. In detail:
            </p>
            <ul>
              <li><strong>QR code and barcode generators</strong>, including the SEO pages for specific formats: codes and downloadable files (PNG, JPG, SVG, PDF) are created in your browser.</li>
              <li><strong>Scanners</strong>: your camera is used only after you press Start camera. Video frames are analysed in your browser and never recorded or uploaded, and the camera is switched off when a code is found, when you pause, or when you leave the tab.</li>
              <li><strong>Decoders and validators</strong>: images you upload or paste are read and decoded in your browser.</li>
              <li><strong>Bulk generators</strong>: your CSV file is read in your browser and the ZIP file is created on your device. The file isn&apos;t uploaded.</li>
            </ul>
            <p>We don&apos;t store, transmit or log the content you enter, upload or scan.</p>
            <p>Some actions hand information to something outside ScanHatch, but only when you choose them:</p>
            <ul>
              <li><strong>Download</strong> saves a file to your device; <strong>Copy</strong> places text or an image on your device&apos;s clipboard.</li>
              <li><strong>Share</strong> opens your device&apos;s share menu, and the app you pick receives the image.</li>
              <li><strong>Open link</strong>, <strong>Call</strong>, <strong>Email</strong> or <strong>Text</strong> on a scan result opens the website or app it points to, which then has its own privacy practices.</li>
            </ul>
          </>,
        },
        {
          id: "history", title: "Scan history in your browser",
          body: <>
            <p>
              The Scanner and Decoder pages keep a short list of your recent results so you can copy them again. This list is stored in your
              browser&apos;s <em>session storage</em>, not on a ScanHatch server:
            </p>
            <LegalTable caption="How scan history is stored" head={["Detail", "What happens"]} rows={[
              ["Storage key", <code key="k">scanhatch:scan-history</code>],
              ["What each entry contains", "The code format, the full decoded content, whether it came from the camera or an image, and the time"],
              ["Sensitive content", "The full content is kept. For example, a scanned WiFi code's password is stored in full, although the on-screen list shows it masked"],
              ["How many", "Up to 25 entries; older ones are removed automatically"],
              ["Who can see it", "It stays in your browser and is readable by ScanHatch's pages in that tab. It isn't sent to us"],
              ["How long it lasts", "Until you remove entries, press Clear history, or close the tab. Some browsers bring session storage back if you restore a closed tab or session"],
            ]} />
            <p>
              If you scan something you don&apos;t want kept even temporarily, remove it from the list or press Clear history. Clearing your browser&apos;s
              site data also removes it. The QR Validator doesn&apos;t add to this history.
            </p>
          </>,
        },
        {
          id: "hosting", title: "Information our hosting provider processes",
          body: <>
            <p>
              ScanHatch is delivered by Cloudflare, which hosts the site&apos;s files and serves them through its global network. As with any website,
              your browser&apos;s requests reach Cloudflare, which processes technical information such as your IP address, browser type, the page
              requested and the time, to deliver the site and protect it against abuse. Because Cloudflare operates worldwide, requests may be handled
              in data centres outside the United Kingdom. Cloudflare&apos;s own privacy policy describes its practices.
            </p>
            <p>These requests contain the addresses of the site&apos;s pages and files. They don&apos;t contain what you enter into the tools.</p>
          </>,
        },
        {
          id: "analytics", title: "Analytics",
          body: <>
            <p>
              No analytics service is currently used on ScanHatch. The site&apos;s code is prepared for privacy-conscious usage statistics in the
              future: it records only what kind of action happened (for example “a QR code was downloaded as PNG”, “a barcode was validated”
              or “a bulk batch of 20 codes finished”) and is built so that it can never include the content of codes, WiFi passwords, names, email
              addresses, phone numbers, file contents or other text you enter.
            </p>
            <p>If we add an analytics service, we&apos;ll name it here and in the <Link href="/cookie-policy/">cookie policy</Link> first, and ask for your consent where that&apos;s required.</p>
          </>,
        },
        {
          id: "cookies", title: "Cookies and similar technologies",
          body: <p>ScanHatch doesn&apos;t set cookies. The only browser storage it uses is the session storage for scan history described above. The <Link href="/cookie-policy/">cookie policy</Link> has the details.</p>,
        },
        {
          id: "advertising", title: "Advertising",
          body: <>
            <p>
              There are no adverts on ScanHatch at the moment, and no advertising companies receive information from the site. We may show adverts
              from Google AdSense in future. Before that happens we&apos;ll update this policy and the cookie policy, and where the law requires it, ask
              for your consent through a consent tool, with the choice to refuse personalised advertising.
            </p>
          </>,
        },
        {
          id: "third-parties", title: "Other services and links",
          body: <>
            <p>
              Apart from our hosting provider, ScanHatch doesn&apos;t load content from other companies: fonts and scanning software are served from
              scanhatch.com itself. Codes you create may contain links to other services, such as WhatsApp or Google Maps; those services only
              become involved when someone opens the link.
            </p>
          </>,
        },
        {
          id: "security", title: "Security",
          body: <>
            <p>
              ScanHatch is intended to be used over encrypted HTTPS connections (the camera scanner only works on HTTPS). Processing your content in your browser means there&apos;s no copy on our side to be lost or
              breached. Scan results and uploaded files are always shown as text, never run as code. No website can promise perfect security,
              though: keep your device and browser up to date, and remember that anything placed in a QR code, including a WiFi password, can be
              read by anyone who scans it.
            </p>
          </>,
        },
        {
          id: "rights", title: "Your rights",
          body: <>
            <p>
              Depending on where you live, data protection laws, including UK data protection law, give you rights over your personal information.
              These can include the right to be told what we hold, to have it corrected or deleted, to object to or restrict its use, and to complain
              to a regulator. In the UK the regulator is the Information Commissioner&apos;s Office (ICO).
            </p>
            <p>
              Because ScanHatch doesn&apos;t receive what you enter into its tools, and the scan history lives only in your browser, we usually won&apos;t
              hold any of your content to access or delete. You can delete the scan history yourself at any time. For any privacy question or request,{" "}
              <ContactLine email={OWNER.contactEmail} />.
            </p>
          </>,
        },
        {
          id: "changes", title: "Changes to this policy",
          body: <p>If how ScanHatch handles information changes, for example if analytics or advertising is added, we&apos;ll update this page before the change and revise the date at the top.</p>,
        },
      ]}
    />
  );
}
