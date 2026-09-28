import { QrLandingPage, qrLandingMetadata } from "@/components/seo/QrLandingPage";

export const metadata = qrLandingMetadata("vcard-qr-code-generator");

export default function Page() {
  return <QrLandingPage slug="vcard-qr-code-generator" />;
}
