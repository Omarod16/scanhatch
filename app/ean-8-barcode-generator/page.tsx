import { BarcodeLandingPage, barcodeLandingMetadata } from "@/components/seo/BarcodeLandingPage";

export const metadata = barcodeLandingMetadata("ean-8-barcode-generator");

export default function Page() {
  return <BarcodeLandingPage slug="ean-8-barcode-generator" />;
}
