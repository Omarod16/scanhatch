/**
 * Privacy-conscious analytics event layer.
 *
 * Rules:
 * - Events describe WHAT kind of action happened, never the content.
 * - Never pass QR/barcode data, URLs, filenames, or scanned text here.
 * - NO PROVIDER IS CONFIGURED: `track` sends nothing anywhere. In development
 *   it logs to the browser console only.
 * - Before wiring a provider into `send()`: document it in the privacy and
 *   cookie policies, and keep it behind analytics consent (`hasConsent`)
 *   unless legal review confirms consent isn't needed for that provider.
 * - Defence in depth: `safeProps` drops any property that isn't a number,
 *   boolean or short identifier, so free text can't leak even by mistake.
 */
import { hasConsent } from "@/lib/consent/consent";

export type AnalyticsEvent =
  | { name: "qr_generated"; props: { contentType: string } }
  | { name: "qr_downloaded"; props: { format: "png" | "jpg" | "svg" | "pdf" } }
  | { name: "qr_shared"; props: Record<string, never> }
  | { name: "qr_copied"; props: { what: "image" | "content" } }
  | { name: "qr_printed"; props: Record<string, never> }
  | { name: "barcode_generated"; props: { format: string } }
  | { name: "barcode_downloaded"; props: { format: string; type: string } }
  | { name: "scanner_used"; props: { source: "camera" | "image" } }
  | { name: "decoder_used"; props: { success: boolean } }
  | { name: "tool_selected"; props: { tool: string } }
  | { name: "seo_tool_opened"; props: { page: string; kind: "qr" | "barcode" } }
  | { name: "validator_used"; props: { tool: string; format: string; valid: boolean } }
  | { name: "bulk_qr_started"; props: { count: number } }
  | { name: "bulk_qr_completed"; props: { count: number } }
  | { name: "bulk_barcode_started"; props: { count: number } }
  | { name: "bulk_barcode_completed"; props: { count: number } };

const SAFE_STRING = /^[a-z0-9][a-z0-9_-]{0,47}$/i;

/** Keeps only numbers, booleans and short identifier strings. */
export function safeProps(props: Record<string, unknown>): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(props)) {
    if (typeof v === "number" && Number.isFinite(v)) out[k] = v;
    else if (typeof v === "boolean") out[k] = v;
    else if (typeof v === "string" && SAFE_STRING.test(v)) out[k] = v;
    else if (process.env.NODE_ENV !== "production") console.warn(`[analytics] dropped unsafe property "${k}"`);
  }
  return out;
}

function send(event: AnalyticsEvent) {
  const props = safeProps(event.props as Record<string, unknown>);
  if (process.env.NODE_ENV !== "production") console.debug("[analytics]", event.name, props);
  // No provider configured. When one is added, send only after consent:
  if (!hasConsent("analytics")) return;
}

export function track<E extends AnalyticsEvent>(name: E["name"], props: E["props"]) {
  try {
    send({ name, props } as AnalyticsEvent);
  } catch {
    // Analytics must never break a tool.
  }
}
