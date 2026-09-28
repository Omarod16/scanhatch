import { BarcodeLandingPage, barcodeLandingMetadata } from "@/components/seo/BarcodeLandingPage";

export const metadata = barcodeLandingMetadata("pdf417-generator");

export default function Page() {
  return <BarcodeLandingPage slug="pdf417-generator" />;
}
