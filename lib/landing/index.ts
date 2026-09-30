import { BARCODE_LANDINGS } from "./barcode";
import { QR_LANDINGS } from "./qr";
import { EXTRA_SECTIONS } from "./extra";
import type { Landing } from "./types";

/** All landing pages, with any extra format-specific sections appended after the originals. */
export const LANDINGS: Landing[] = [...QR_LANDINGS, ...BARCODE_LANDINGS].map((l) => ({
  ...l,
  sections: [...l.sections, ...(EXTRA_SECTIONS[l.slug] ?? [])],
}));

export function landing(slug: string): Landing {
  const l = LANDINGS.find((x) => x.slug === slug);
  if (!l) throw new Error(`Unknown landing page: ${slug}`);
  return l;
}

export const landingPath = (slug: string) => `/${slug}/`;

/** Landing page for a barcode format, if one exists. */
export const barcodeLandingFor = (format: string) => BARCODE_LANDINGS.find((l) => l.format === format);
export const qrLandingFor = (type: string) => QR_LANDINGS.find((l) => l.qrType === type);
