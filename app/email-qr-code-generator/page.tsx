import { QrLandingPage, qrLandingMetadata } from "@/components/seo/QrLandingPage";

export const metadata = qrLandingMetadata("email-qr-code-generator");

export default function Page() {
  return <QrLandingPage slug="email-qr-code-generator" />;
}
