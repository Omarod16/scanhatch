import { contrast, luminance, safeHex } from "@/lib/qr/color";
import type { QrWarning } from "@/lib/qr/warnings";
import type { BarcodeFormat, Validation } from "./formats";
import { rasterSize, type BarcodeStyle, type RenderedBarcode } from "./render";

export const MAX_RASTER_PX = 12000;

/** Readability heuristics. They warn; they don't guarantee or block. */
export function checkBarcode(
  format: BarcodeFormat,
  style: BarcodeStyle,
  v: Extract<Validation, { ok: true }>,
  r: RenderedBarcode,
  dpi: number
): QrWarning[] {
  const out: QrWarning[] = [];
  const bar = safeHex(style.barColor, "#000000");
  const bg = safeHex(style.backgroundColor, "#ffffff");

  if (style.transparent) {
    out.push({ id: "transparent", level: "info", message: "Transparent background: print it on a plain, light surface." });
  } else {
    if (luminance(bar) > luminance(bg)) {
      out.push({ id: "inverted", level: "danger", message: "The bars are lighter than the background. Most scanners need dark bars on a light background." });
    }
    const c = contrast(bar, bg);
    if (c < 3) out.push({ id: "contrast", level: "danger", message: `Contrast is very low (${c.toFixed(1)}:1). The barcode may be difficult to scan.` });
    else if (c < 5) out.push({ id: "contrast", level: "warn", message: `Contrast is lowish (${c.toFixed(1)}:1). Black on white is the most reliable.` });
  }
  const n = parseInt(bar.slice(1), 16);
  const [R, G, B] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  if (R > 150 && G < 110 && B < 110) {
    out.push({ id: "red", level: "danger", message: "Red bars can be invisible to laser and red-LED scanners, which use red light. Use black, dark blue or dark green." });
  }

  const recommended = format.quietZone;
  if (recommended > 0 && style.quietZone < recommended) {
    out.push({ id: "quiet", level: style.quietZone < recommended / 2 ? "danger" : "warn", message: `Increase the margin around the barcode for better scanning. ${format.name} needs about ${recommended} modules of empty space on each side.` });
  }

  if (format.kind === "1d") {
    const retail = ["ean13", "ean8", "upca", "upce"].includes(format.id);
    if (retail && (style.moduleMm < 0.264 || style.moduleMm > 0.66)) {
      out.push({ id: "gs1-size", level: "warn", message: `GS1 retail barcodes are specified at 80–200% of nominal size (module width 0.264–0.66 mm). ${style.moduleMm} mm is outside that range, so retailers may reject it.` });
    } else if (style.moduleMm < 0.25) {
      out.push({ id: "small", level: "warn", message: "Very narrow bars. The barcode may become difficult to scan when printed, especially on office printers." });
    }
    if (style.heightMm < (retail ? 15 : 6)) {
      out.push({ id: "short", level: "warn", message: "Short bars are harder to scan with handheld scanners, which need to hit the barcode in a single sweep." });
    }
    if (r.widthMm > 150) {
      out.push({ id: "wide", level: "warn", message: `This barcode is ${Math.round(r.widthMm)} mm wide. Shorter data or a narrower module width will make it easier to scan.` });
    }
    if (format.id === "itf" && v.value.length < 6) {
      out.push({ id: "itf-short", level: "warn", message: "Many scanners ignore ITF barcodes shorter than 6 digits, to avoid misreads." });
    }
  } else if (style.sizeMm < 10) {
    out.push({ id: "small2d", level: "warn", message: "Very small 2D code. The barcode may become difficult to scan when printed; phone cameras usually need at least 10–15 mm." });
  }

  const px = rasterSize(r, dpi);
  if (px.width > MAX_RASTER_PX || px.height > MAX_RASTER_PX) {
    out.push({ id: "large", level: "warn", message: `At ${dpi} dpi the image would be ${px.width} × ${px.height} px. PNG and JPG are limited to ${MAX_RASTER_PX} px, so lower the resolution or use SVG or PDF.` });
  } else if (px.width * px.height > 25_000_000) {
    out.push({ id: "large", level: "info", message: "Large output may increase file size. SVG or PDF stay small at any size." });
  }

  if (!format.decodable) {
    out.push({ id: "decoder", level: "info", message: `${format.name} is generated correctly, but many phone apps (including ScanHatch's scanner) can't read it. Test with the scanner your system uses.` });
  }
  return out;
}
