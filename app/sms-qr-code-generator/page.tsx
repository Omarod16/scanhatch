import { QrLandingPage, qrLandingMetadata } from "@/components/seo/QrLandingPage";

export const metadata = qrLandingMetadata("sms-qr-code-generator");

export default function Page() {
  return <QrLandingPage slug="sms-qr-code-generator" />;
}
