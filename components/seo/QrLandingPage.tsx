import { QrGenerator } from "@/components/qr/QrGenerator";
import { landing, landingPath } from "@/lib/landing";
import type { QrLanding } from "@/lib/landing/types";
import { pageMetadata } from "@/lib/seo";
import { LandingLayout } from "./LandingLayout";

export function qrLandingMetadata(slug: string) {
  const p = landing(slug);
  return pageMetadata({ title: p.title, description: p.description, path: landingPath(slug) });
}

export function QrLandingPage({ slug }: { slug: string }) {
  const page = landing(slug) as QrLanding;
  return <LandingLayout page={page} tool={<QrGenerator initialType={page.qrType} />} />;
}
