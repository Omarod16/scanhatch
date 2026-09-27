/**
 * Readability assessment for a decoded QR image. Measures what can be measured
 * from the file: contrast, quiet zone, module size, inversion and how much of the
 * error correction was needed to read it. Passing does NOT guarantee real-world
 * scanning: print size, material, lighting and the scanner also matter.
 */
import type { ReadResult } from "zxing-wasm/reader";
import type { ContentCheck } from "./qr-content";

export interface ReadabilityMetrics {
  version: string;
  ecLevel: string;
  modules: number;
  modulePx: number;
  contrast: number;
  quietZone: number;
  quietZoneLimitedByEdge: boolean;
  unusedEc: number | null;
  inverted: boolean;
}

export interface Readability {
  verdict: "likely" | "warnings" | "poor";
  label: string;
  checks: ContentCheck[];
  metrics: ReadabilityMetrics;
}

type Pt = { x: number; y: number };

const lin = (c: number) => { const s = c / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };

export function assessQrImage(img: ImageData, r: ReadResult): Readability {
  const { width: W, height: H, data } = img;
  const lum = new Float32Array(W * H);
  for (let i = 0, p = 0; i < lum.length; i++, p += 4) {
    // Treat transparency as white paper.
    const a = data[p + 3] / 255;
    const rr = data[p] * a + 255 * (1 - a), gg = data[p + 1] * a + 255 * (1 - a), bb = data[p + 2] * a + 255 * (1 - a);
    lum[i] = 0.2126 * lin(rr) + 0.7152 * lin(gg) + 0.0722 * lin(bb);
  }
  const at = (x: number, y: number) => lum[Math.min(H - 1, Math.max(0, Math.round(y))) * W + Math.min(W - 1, Math.max(0, Math.round(x)))];

  const { topLeft: tl, topRight: tr, bottomRight: br, bottomLeft: bl } = r.position;
  const N = r.symbol?.width || 17 + 4 * Number(r.version || 1);
  const side = (Math.hypot(tr.x - tl.x, tr.y - tl.y) + Math.hypot(br.x - bl.x, br.y - bl.y) + Math.hypot(bl.x - tl.x, bl.y - tl.y) + Math.hypot(br.x - tr.x, br.y - tr.y)) / 4;
  const modulePx = side / N;

  // Map symbol coordinates (u,v in modules, may be outside 0..N) to image pixels.
  const map = (u: number, v: number): Pt => {
    const s = u / N, t = v / N;
    return {
      x: (1 - s) * (1 - t) * tl.x + s * (1 - t) * tr.x + s * t * br.x + (1 - s) * t * bl.x,
      y: (1 - s) * (1 - t) * tl.y + s * (1 - t) * tr.y + s * t * br.y + (1 - s) * t * bl.y,
    };
  };

  // Contrast: sample module centres, split dark/light with Otsu, compare cluster means.
  const samples: number[] = [];
  for (let v = 0; v < N; v++) for (let u = 0; u < N; u++) { const p = map(u + 0.5, v + 0.5); samples.push(at(p.x, p.y)); }
  const sorted = [...samples].sort((a, b) => a - b);
  let best = 0, thr = 0.5;
  for (let i = 1; i < sorted.length; i++) {
    const w0 = i / sorted.length, w1 = 1 - w0;
    const m0 = sorted.slice(0, i).reduce((a, b) => a + b, 0) / i;
    const m1 = sorted.slice(i).reduce((a, b) => a + b, 0) / (sorted.length - i);
    const between = w0 * w1 * (m0 - m1) ** 2;
    if (between > best) { best = between; thr = (sorted[i - 1] + sorted[i]) / 2; }
  }
  const darks = samples.filter((s) => s <= thr), lights = samples.filter((s) => s > thr);
  const dMean = darks.reduce((a, b) => a + b, 0) / Math.max(1, darks.length);
  const lMean = lights.reduce((a, b) => a + b, 0) / Math.max(1, lights.length);
  const contrast = (lMean + 0.05) / (dMean + 0.05);
  const inverted = r.isInverted;

  // Quiet zone: count clean 1-module rings outside the symbol.
  let quietZone = 0;
  let limitedByEdge = false;
  // Only count clearly dark pixels, so anti-aliased edges of small images aren't mistaken for clutter.
  const darkCut = (dMean + thr) / 2;
  const lightCut = (lMean + thr) / 2;
  const bgDark = (l: number) => (inverted ? l >= lightCut : l <= darkCut);
  // ZXing corners are whole pixels (about ±1 px), so nudge samples ~1 px outward, staying inside each ring.
  const nudge = Math.min(0.45, 1.2 / Math.max(modulePx, 0.1));
  for (let k = 1; k <= 4; k++) {
    const d = k - 0.5 + nudge;
    const pts: Pt[] = [];
    const steps = Math.max(40, Math.ceil((N + 2 * k) * 3));
    for (let i = 0; i <= steps; i++) {
      const s = -d + ((N + 2 * d) * i) / steps;
      pts.push(map(s, -d), map(s, N + d), map(-d, s), map(N + d, s));
    }
    if (pts.some((p) => p.x < -1 || p.y < -1 || p.x > W || p.y > H)) { limitedByEdge = true; break; }
    const dark = pts.filter((p) => bgDark(at(p.x, p.y))).length / pts.length;
    if (dark > 0.03) break;
    quietZone = k;
  }

  let unusedEc: number | null = null;
  try { const e = JSON.parse(r.extra || "{}"); if (typeof e.UEC === "number") unusedEc = e.UEC; } catch { /* ignore */ }

  const checks: ContentCheck[] = [];
  const add = (level: ContentCheck["level"], message: string) => checks.push({ level, message });

  if (inverted) add("warn", "Light modules on a dark background (inverted). Many phone scanners can't read inverted QR codes.");
  if (contrast < 2.5) add("error", `Very low contrast (${contrast.toFixed(1)}:1) between dark and light modules. Use a much darker foreground or lighter background.`);
  else if (contrast < 4) add("warn", `Low contrast (${contrast.toFixed(1)}:1). Some scanners, especially in poor light, may struggle.`);
  else add("ok", `Good contrast (${contrast.toFixed(1)}:1).`);

  if (modulePx < 3) add("info", "The image is too small to measure the quiet zone precisely. Check there are about 4 modules of blank space around the code.");
  else if (quietZone >= 4) add("ok", "Quiet zone of at least 4 modules, as the QR standard recommends.");
  else if (limitedByEdge) add(quietZone >= 2 ? "warn" : "error", `The image edge leaves only ${quietZone} module${quietZone === 1 ? "" : "s"} of margin. Place it on a plain background with at least 4 modules of space, or export with a larger margin.`);
  else add(quietZone >= 2 ? "warn" : "error", `Insufficient quiet zone: only ${quietZone} module${quietZone === 1 ? "" : "s"} of clear space before other content. The QR standard recommends 4.`);

  if (unusedEc !== null) {
    const pct = Math.round(unusedEc * 100);
    if (unusedEc >= 0.99) add("ok", "Error correction untouched: nothing covers or damages the code.");
    else if (unusedEc >= 0.5) add("ok", `${pct}% of the error correction is still unused. Some modules are covered or damaged (for example by a logo), with a reasonable margin left.`);
    else if (unusedEc >= 0.25) add("warn", `Only ${pct}% of the error correction is left. A logo or damage is using most of it, so print defects or glare could make it unreadable. Use a smaller logo or a higher error-correction level.`);
    else add("error", `Almost no error correction left (${pct}%). The logo or damage covers nearly as much as the code can recover from.`);
  }

  if (modulePx < 2) add("error", `Extremely small: each module is under 2 px (${modulePx.toFixed(1)} px). Export a larger image.`);
  else if (modulePx < 4) add("warn", `Small image: each module is only ${modulePx.toFixed(1)} px. Scaling it up for print will blur it; export a larger image instead.`);
  else add("ok", `Module size ${modulePx.toFixed(1)} px, enough for sharp printing at moderate sizes.`);

  const errors = checks.filter((c) => c.level === "error").length;
  const warnings = checks.filter((c) => c.level === "warn").length;
  const verdict = errors ? "poor" : warnings ? "warnings" : "likely";
  return {
    verdict,
    label: verdict === "likely" ? "Likely readable" : verdict === "warnings" ? "Readable here, with warnings" : "Hard to read",
    checks,
    metrics: { version: r.version, ecLevel: r.ecLevel, modules: N, modulePx, contrast, quietZone, quietZoneLimitedByEdge: limitedByEdge, unusedEc, inverted },
  };
}
