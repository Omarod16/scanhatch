/**
 * Advertising configuration. ADS ARE DISABLED.
 *
 * Modes:
 *   "disabled"     Default. AdSlot renders nothing and no ad code is loaded.
 *   "placeholder"  For layout review only: labelled empty boxes, no ad requests.
 *   "enabled"      Reserved for the future AdSense activation step. It still renders
 *                  nothing until ALL of the following are true:
 *                    - a publisher ID is supplied by the owner (never commit it
 *                      as a fake value),
 *                    - a Google-certified CMP is configured (required for serving
 *                      ads to UK/EEA/Swiss users),
 *                    - the user's consent signals allow advertising,
 *                    - the AdSense loader has been implemented and reviewed (it
 *                      intentionally doesn't exist yet).
 *
 * The mode comes from the NEXT_PUBLIC_ADS_MODE build variable and defaults to
 * "disabled". See docs/LEGAL-AND-ADS-SETUP.md.
 */
export type AdsMode = "disabled" | "placeholder" | "enabled";

const raw = process.env.NEXT_PUBLIC_ADS_MODE;
export const ADS_MODE: AdsMode = raw === "placeholder" || raw === "enabled" ? raw : "disabled";

/** Supplied by the owner at activation time (e.g. via NEXT_PUBLIC_ADSENSE_CLIENT). Not set. */
export const ADSENSE_CLIENT: string | null = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || null;

/** The loader for AdSense scripts is intentionally not implemented in this phase. */
export const ADSENSE_LOADER_IMPLEMENTED = false;

/** Placement ids. Each is positioned away from tool controls and download buttons. */
export type AdPlacement = "article-mid" | "article-end" | "landing-content";

export function adsBlockers(): string[] {
  const out: string[] = [];
  if (ADS_MODE !== "enabled") out.push(`ADS_MODE is "${ADS_MODE}"`);
  if (!ADSENSE_CLIENT) out.push("no AdSense publisher ID configured");
  if (!ADSENSE_LOADER_IMPLEMENTED) out.push("AdSense loader not implemented");
  return out;
}
