import { BARCODE_LANDINGS } from "./barcode";
import { QR_LANDINGS } from "./qr";
import type { Landing } from "./types";

export const LANDINGS: Landing[] = [...QR_LANDINGS, ...BARCODE_LANDINGS];

export function landing(slug: string): Landing {
  const l = LANDINGS.find((x) => x.slug === slug);
  if (!l) throw new Error(`Unknown landing page: ${slug}`);
  return l;
}

export const landingPath = (slug: string) => `/${slug}/`;

/** Landing page for a barcode format, if one exists. */
export const barcodeLandingFor = (format: string) => BARCODE_LANDINGS.find((l) => l.format === format);
export const qrLandingFor = (type: string) => QR_LANDINGS.find((l) => l.qrType === type);
