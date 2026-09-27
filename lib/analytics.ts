/**
 * Privacy-conscious analytics event layer.
 *
 * Rules:
 * - Events describe WHAT kind of action happened, never the content.
 * - Never pass QR/barcode data, URLs, filenames, or scanned text here.
 * - No provider is wired up yet, so `track` is a no-op in production.
 *   Plug a provider into `send()` later (e.g. Cloudflare Web Analytics
 *   custom events or a self-hosted counter).
 */

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
  | { name: "bulk_generation_completed"; props: { kind: "qr" | "barcode"; count: number } };

function send(event: AnalyticsEvent) {
  if (process.env.NODE_ENV !== "production") {
    console.debug("[analytics]", event.name, event.props);
  }
}

export function track<E extends AnalyticsEvent>(name: E["name"], props: E["props"]) {
  try {
    send({ name, props } as AnalyticsEvent);
  } catch {
    // Analytics must never break a tool.
  }
}
