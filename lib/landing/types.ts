import type { BarcodeFormatId } from "@/lib/barcode/formats";
import type { ContentTypeId } from "@/lib/qr/content";

export interface LandingSection {
  heading: string;
  paragraphs?: string[];
  list?: string[];
  /** Optional ordered list instead of bullets. */
  ordered?: boolean;
}

export interface LandingFaq {
  q: string;
  a: string;
}

interface Base {
  slug: string;
  /** Registry id, used for the sitemap and /tools. */
  registryId: string;
  /** H1 and breadcrumb label. */
  name: string;
  /** <title> without the " | ScanHatch" suffix (added by the layout template). */
  title: string;
  description: string;
  /** One or two sentences above the tool. */
  intro: string;
  howTo: string[];
  sections: LandingSection[];
  faq: LandingFaq[];
  related: string[];
}

export interface QrLanding extends Base {
  kind: "qr";
  qrType: ContentTypeId;
}

export interface BarcodeLanding extends Base {
  kind: "barcode";
  format: BarcodeFormatId;
}

export type Landing = QrLanding | BarcodeLanding;
