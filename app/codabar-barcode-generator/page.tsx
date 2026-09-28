import { BarcodeLandingPage, barcodeLandingMetadata } from "@/components/seo/BarcodeLandingPage";

export const metadata = barcodeLandingMetadata("codabar-barcode-generator");

export default function Page() {
  return <BarcodeLandingPage slug="codabar-barcode-generator" />;
}
