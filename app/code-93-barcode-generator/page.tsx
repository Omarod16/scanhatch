import { BarcodeLandingPage, barcodeLandingMetadata } from "@/components/seo/BarcodeLandingPage";

export const metadata = barcodeLandingMetadata("code-93-barcode-generator");

export default function Page() {
  return <BarcodeLandingPage slug="code-93-barcode-generator" />;
}
