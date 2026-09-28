/**
 * Turns a caught error into text that's safe and useful to show a user.
 * - Code/asset loading failures (lazy chunks, dynamic imports, WASM fetches) become a
 *   "couldn't load, reload the page" message instead of internal chunk names.
 * - Raw engine errors (TypeError internals etc.) fall back to the caller's message.
 * - ScanHatch's own thrown messages, which are written for users, are kept.
 */
export const LOAD_FAILED = "Part of ScanHatch couldn't load. Check your connection and reload the page.";

const LOAD = /failed to load chunk|loading chunk|chunkloaderror|dynamically imported module|importing a module script failed|error loading dynamically|failed to fetch|networkerror|load failed/i;
const INTERNAL = /^(typeerror|referenceerror|syntaxerror|rangeerror)\b|cannot read propert|is not a function|is not defined|undefined|null|\bmodule \d+|\bat \w+ \(|\.js:\d+/i;

export function isLoadError(e: unknown) {
  const m = e instanceof Error ? `${e.name} ${e.message}` : String(e ?? "");
  return LOAD.test(m);
}

export function userMessage(e: unknown, fallback: string): string {
  if (isLoadError(e)) return LOAD_FAILED;
  if (e instanceof Error && e.message && !INTERNAL.test(`${e.name === "Error" ? "" : e.name} ${e.message}`.trim())) return e.message;
  return fallback;
}
