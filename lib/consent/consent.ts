/**
 * Consent abstraction.
 *
 * Categories:
 *   necessary    Always on. Storage needed for features the user is using.
 *   analytics    Optional measurement.
 *   advertising  Optional ads and ad measurement.
 *   preferences  Optional remembered settings.
 *
 * CURRENT STATE: no consent-management platform (CMP) is configured, and ScanHatch
 * currently uses no optional analytics, advertising or preference storage. The
 * "none" provider therefore reports every optional category as NOT granted.
 * That is a fail-closed default, not a recorded user choice: nothing optional
 * may load until a real CMP reports consent.
 *
 * To integrate a Google-certified CMP (Google Privacy & Messaging, or another
 * IAB TCF v2.2 CMP), implement a ConsentProvider that reads the CMP's signals
 * (e.g. the TCF `__tcfapi` API) and register it in `setConsentProvider`. See
 * docs/LEGAL-AND-ADS-SETUP.md. Do not hard-code granted states.
 */
export type ConsentCategory = "necessary" | "analytics" | "advertising" | "preferences";
export type ConsentState = Record<ConsentCategory, boolean>;

export interface ConsentProvider {
  /** Identifier, e.g. "none", "google-privacy-messaging", "tcf". */
  readonly id: string;
  /** True once the provider knows the user's choices (or knows none are needed). */
  ready(): boolean;
  state(): ConsentState;
  subscribe(listener: () => void): () => void;
  /** Opens the provider's preferences UI, if it has one. */
  openPreferences?: () => void;
}

const DENIED: ConsentState = { necessary: true, analytics: false, advertising: false, preferences: false };

/** Default provider: no CMP configured, optional categories denied. */
export const noCmpProvider: ConsentProvider = {
  id: "none",
  ready: () => true,
  state: () => DENIED,
  subscribe: () => () => {},
};

let provider: ConsentProvider = noCmpProvider;
const listeners = new Set<() => void>();
let unsubscribe = provider.subscribe(() => listeners.forEach((l) => l()));

export function setConsentProvider(p: ConsentProvider) {
  unsubscribe();
  provider = p;
  unsubscribe = provider.subscribe(() => listeners.forEach((l) => l()));
  listeners.forEach((l) => l());
}

export const consentProvider = () => provider;

/** Whether a category may be used right now. Optional categories need a ready provider AND a grant. */
export function hasConsent(category: ConsentCategory) {
  if (category === "necessary") return true;
  return provider.ready() && provider.state()[category] === true;
}

export function onConsentChange(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
