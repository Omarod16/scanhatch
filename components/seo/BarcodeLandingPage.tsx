import { BarcodeGenerator } from "@/components/barcode/BarcodeGenerator";
import { landing, landingPath } from "@/lib/landing";
import type { BarcodeLanding } from "@/lib/landing/types";
import { pageMetadata } from "@/lib/seo";
import { LandingLayout } from "./LandingLayout";

export function barcodeLandingMetadata(slug: string) {
  const p = landing(slug);
  return pageMetadata({ title: p.title, description: p.description, path: landingPath(slug) });
}

export function BarcodeLandingPage({ slug }: { slug: string }) {
  const page = landing(slug) as BarcodeLanding;
  return <LandingLayout page={page} tool={<BarcodeGenerator initialFormat={page.format} />} />;
}
