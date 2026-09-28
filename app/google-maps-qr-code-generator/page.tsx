import { QrLandingPage, qrLandingMetadata } from "@/components/seo/QrLandingPage";

export const metadata = qrLandingMetadata("google-maps-qr-code-generator");

export default function Page() {
  return <QrLandingPage slug="google-maps-qr-code-generator" />;
}
