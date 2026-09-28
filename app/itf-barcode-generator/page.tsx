import { BarcodeLandingPage, barcodeLandingMetadata } from "@/components/seo/BarcodeLandingPage";

export const metadata = barcodeLandingMetadata("itf-barcode-generator");

export default function Page() {
  return <BarcodeLandingPage slug="itf-barcode-generator" />;
}
