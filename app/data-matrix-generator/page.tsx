import { BarcodeLandingPage, barcodeLandingMetadata } from "@/components/seo/BarcodeLandingPage";

export const metadata = barcodeLandingMetadata("data-matrix-generator");

export default function Page() {
  return <BarcodeLandingPage slug="data-matrix-generator" />;
}
