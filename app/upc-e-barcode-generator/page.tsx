import { BarcodeLandingPage, barcodeLandingMetadata } from "@/components/seo/BarcodeLandingPage";

export const metadata = barcodeLandingMetadata("upc-e-barcode-generator");

export default function Page() {
  return <BarcodeLandingPage slug="upc-e-barcode-generator" />;
}
