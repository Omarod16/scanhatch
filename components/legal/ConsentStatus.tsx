"use client";

import { useConsent, useConsentProvider } from "@/lib/consent/useConsent";

/** Shows the live consent status and, when a CMP is configured, a way to change choices. */
export function ConsentStatus() {
  const provider = useConsentProvider();
  const analytics = useConsent("analytics");
  const advertising = useConsent("advertising");
  if (provider.id === "none") {
    return (
      <p className="rounded-lg border border-line bg-ink-2 px-4 py-3 text-sm text-fog" data-testid="consent-status">
        <span className="font-semibold text-white">Your choices: </span>
        ScanHatch doesn&apos;t currently use any optional cookies or storage, so there&apos;s nothing to accept or refuse. If that changes, a
        button to manage your choices will appear here, and you&apos;ll be asked before anything optional is used.
      </p>
    );
  }
  return (
    <div className="rounded-lg border border-line bg-ink-2 px-4 py-3 text-sm text-fog" data-testid="consent-status">
      <p><span className="font-semibold text-white">Analytics:</span> {analytics ? "allowed" : "not allowed"} · <span className="font-semibold text-white">Advertising:</span> {advertising ? "allowed" : "not allowed"}</p>
      {provider.openPreferences && (
        <button type="button" className="btn-secondary mt-3" onClick={() => provider.openPreferences?.()}>Manage privacy choices</button>
      )}
    </div>
  );
}
