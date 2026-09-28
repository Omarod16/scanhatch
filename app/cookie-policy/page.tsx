import Link from "next/link";
import { ConsentStatus } from "@/components/legal/ConsentStatus";
import { LegalLayout, LegalTable } from "@/components/legal/LegalLayout";
import { pageMetadata } from "@/lib/seo";

const DESCRIPTION = "Which cookies and browser storage ScanHatch uses: no cookies, and session storage for scan history only. Also covers future analytics or ads and how to control storage.";
export const metadata = pageMetadata({ title: "Cookie Policy", description: DESCRIPTION, path: "/cookie-policy/" });

export default function CookiePolicyPage() {
  return (
    <LegalLayout
      name="Cookie Policy"
      path="/cookie-policy/"
      intro={<p>This page lists the cookies and similar browser storage ScanHatch uses, and why. The short version: <strong>ScanHatch sets no cookies</strong>, and uses one piece of session storage for the scanner&apos;s history.</p>}
      sections={[
        {
          id: "what", title: "What cookies and browser storage are",
          body: <p>
            Cookies are small pieces of data a website asks your browser to keep, and they&apos;re sent back to the site with later requests. Websites
            can also keep data in your browser with web storage: <em>local storage</em>, which persists, and <em>session storage</em>, which lasts only for the
            browser tab. Unlike cookies, web storage isn&apos;t sent to the website&apos;s servers automatically.
          </p>,
        },
        {
          id: "current", title: "What ScanHatch uses today",
          body: <>
            <LegalTable caption="Cookies and storage used by ScanHatch" head={["Name", "Type", "Purpose", "How long it lasts", "Category"]} rows={[
              [<code key="n">scanhatch:scan-history</code>, "Session storage", "Keeps your recent scan results so you can copy or open them again. Holds each result's full content", "Until you clear it or close the tab", "Needed for the scan-history feature"],
            ]} />
            <p>
              ScanHatch doesn&apos;t set any cookies, and doesn&apos;t use local storage or other persistent storage. The{" "}
              <Link href="/privacy-policy/#history">privacy policy</Link> explains exactly what the scan history contains and how to clear it.
            </p>
          </>,
        },
        {
          id: "optional", title: "Analytics and advertising",
          body: <>
            <p>
              <strong>Analytics:</strong> none in use. <strong>Advertising:</strong> none in use. No analytics or advertising company sets
              cookies or storage through ScanHatch today.
            </p>
            <p>
              <strong>In future, if enabled:</strong> ScanHatch may show adverts from Google AdSense. Google and its partners use cookies and
              similar technologies to serve and measure ads, and to personalise them where you allow it. If we enable advertising, or add an analytics
              service, we&apos;ll list its cookies here first, and where the law requires it, show a consent tool so you can accept or refuse
              before any such cookies are set.
            </p>
          </>,
        },
        {
          id: "choices", title: "Your choices",
          body: <>
            <ConsentStatus />
            <p className="mt-4">You can also control storage in your browser:</p>
            <ul>
              <li>To clear the scan history, use Clear history on the scanner, or close the tab.</li>
              <li>To remove everything a site has stored, use your browser&apos;s settings for site data (often under Privacy or “Cookies and site data”).</li>
              <li>Browsers let you block cookies and storage altogether. ScanHatch&apos;s tools still work, though the scan history won&apos;t be kept.</li>
            </ul>
          </>,
        },
        {
          id: "changes", title: "Changes to this policy",
          body: <p>We&apos;ll update this page before adding any new cookie or storage, and revise the date at the top.</p>,
        },
      ]}
    />
  );
}
