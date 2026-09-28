/**
 * ZIP entry names from untrusted text. Guarantees: no path separators or ".."
 * segments, no absolute paths, no control/bidi characters, no Windows-reserved
 * names, bounded length, and no collisions (case-insensitive).
 */
const RESERVED = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;

export function sanitizeBaseName(raw: string, maxLength = 80): string {
  let s = raw.normalize("NFC");
  // eslint-disable-next-line no-control-regex
  s = s.replace(/[\u0000-\u001f\u007f-\u009f]/g, "");
  s = s.replace(/[\u200b-\u200f\u202a-\u202e\u2060-\u2069\ufeff]/g, ""); // zero-width and bidi overrides (e.g. spoofed extensions)
  s = s.replace(/\.(png|svg|jpe?g|webp|gif|pdf)$/i, "");
  s = s.replace(/[\\/:*?"<>|]/g, "-");
  s = s.replace(/\s+/g, "-");
  s = s.replace(/-{2,}/g, "-");
  s = s.replace(/^[-.]+|[-.]+$/g, ""); // no leading dots (hidden files, "..") or trailing dots/hyphens
  const chars = Array.from(s);
  if (chars.length > maxLength) s = chars.slice(0, maxLength).join("").replace(/[-.]+$/g, "");
  if (RESERVED.test(s)) s += "_";
  return s;
}

/** Returns a function that turns preferred names into unique, safe file names. */
export function createNameAllocator(reserved: string[] = []) {
  const used = new Set(reserved.map((n) => n.toLowerCase()));
  return (preferred: string, fallback: string, ext: string) => {
    const base = sanitizeBaseName(preferred) || sanitizeBaseName(fallback) || "code";
    let name = `${base}.${ext}`;
    for (let i = 2; used.has(name.toLowerCase()); i++) name = `${base}-${i}.${ext}`;
    used.add(name.toLowerCase());
    return name;
  };
}
