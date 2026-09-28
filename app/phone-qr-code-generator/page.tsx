import { QrLandingPage, qrLandingMetadata } from "@/components/seo/QrLandingPage";

export const metadata = qrLandingMetadata("phone-qr-code-generator");

export default function Page() {
  return <QrLandingPage slug="phone-qr-code-generator" />;
}
