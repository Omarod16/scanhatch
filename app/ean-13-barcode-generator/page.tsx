import { BarcodeLandingPage, barcodeLandingMetadata } from "@/components/seo/BarcodeLandingPage";

export const metadata = barcodeLandingMetadata("ean-13-barcode-generator");

export default function Page() {
  return <BarcodeLandingPage slug="ean-13-barcode-generator" />;
}
