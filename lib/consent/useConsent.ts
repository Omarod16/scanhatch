"use client";

import { useSyncExternalStore } from "react";
import { consentProvider, hasConsent, onConsentChange, type ConsentCategory } from "./consent";

/** React hook: re-renders when consent changes. */
export function useConsent(category: ConsentCategory) {
  return useSyncExternalStore(onConsentChange, () => hasConsent(category), () => category === "necessary");
}

export function useConsentProvider() {
  return useSyncExternalStore(onConsentChange, () => consentProvider(), () => consentProvider());
}
