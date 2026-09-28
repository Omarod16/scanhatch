import { BarcodeLandingPage, barcodeLandingMetadata } from "@/components/seo/BarcodeLandingPage";

export const metadata = barcodeLandingMetadata("upc-a-barcode-generator");

export default function Page() {
  return <BarcodeLandingPage slug="upc-a-barcode-generator" />;
}
