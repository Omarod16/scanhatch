"use client";

import { useEffect } from "react";
import { ADS_MODE, adsBlockers, type AdPlacement } from "@/lib/ads/config";
import { useConsent } from "@/lib/consent/useConsent";

/**
 * A reserved ad position. ADS ARE DISABLED: in the default mode this renders nothing.
 * Placements must stay clearly separated from tool controls, generate/download
 * buttons and anything that could be mistaken for ScanHatch UI.
 */
export function AdSlot({ id }: { id: AdPlacement }) {
  const adConsent = useConsent("advertising");

  useEffect(() => {
    if (ADS_MODE === "enabled" && process.env.NODE_ENV !== "production") {
      const blockers = adsBlockers();
      if (!adConsent) blockers.push("advertising consent not granted");
      if (blockers.length) console.warn(`[ads] slot "${id}" not rendered: ${blockers.join("; ")}`);
    }
  }, [id, adConsent]);

  if (ADS_MODE === "placeholder") {
    return (
      <div data-ad-placeholder={id} role="note" aria-label="Reserved advertising space (not active)"
        className="my-12 flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-line-2 px-4 text-center text-xs text-mist">
        Reserved ad space ({id}) · placeholder only, no ads are loaded
      </div>
    );
  }
  // "disabled", and "enabled" until every precondition is met (see lib/ads/config.ts).
  return null;
}
