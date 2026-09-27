import { safeHex } from "@/lib/qr/color";
import type { BarcodeFormat, Validation } from "./formats";

export type Rotation = "N" | "R" | "I" | "L";

export interface BarcodeStyle {
  barColor: string;
  backgroundColor: string;
  transparent: boolean;
  /** 1D: narrow bar (module) width in mm. */
  moduleMm: number;
  /** 1D: bar height in mm. */
  heightMm: number;
  /** 2D: symbol width in mm (excluding quiet zone). */
  sizeMm: number;
  /** Quiet zone in modules, each side. */
  quietZone: number;
  rotate: Rotation;
  showText: boolean;
  /** Human-readable text size in points (print). */
  textPt: number;
  textPlacement: "below" | "above";
}

export const DEFAULT_BARCODE_STYLE: BarcodeStyle = {
  barColor: "#000000",
  backgroundColor: "#ffffff",
  transparent: false,
  moduleMm: 0.33,
  heightMm: 15,
  sizeMm: 25,
  quietZone: 10,
  rotate: "N",
  showText: true,
  textPt: 9,
  textPlacement: "below",
};

/** The subset of bwip-js we use. Passed in so the module can be lazy-loaded (and tested in Node). */
export interface BwipLike {
  toSVG(opts: Record<string, unknown>): string;
}

export interface RenderedBarcode {
  svg: string;
  /** SVG user units (from bwip-js). */
  widthUnits: number;
  heightUnits: number;
  /** Physical size of one SVG unit. */
  unitMm: number;
  widthMm: number;
  heightMm: number;
}

const PT_MM = 25.4 / 72;

/** Turns bwip-js error messages ("bwipp.ean13badCheckDigit#6915: Incorrect…") into plain text. */
export function cleanBwipError(e: unknown) {
  const msg = e instanceof Error ? e.message : String(e);
  const text = msg.replace(/^bwip(p|-js)\.[\w]+#?\d*:\s*/i, "").trim();
  return text || "This value can't be encoded in the selected format.";
}

export function renderBarcode(
  bwip: BwipLike,
  format: BarcodeFormat,
  v: Extract<Validation, { ok: true }>,
  style: BarcodeStyle
): RenderedBarcode {
  const bar = safeHex(style.barColor, "#000000").slice(1);
  const opts: Record<string, unknown> = {
    bcid: format.bcid,
    text: v.encode,
    scaleX: 1,
    scaleY: 1,
    rotate: style.rotate,
    barcolor: bar,
    textcolor: bar,
    ...(style.transparent ? {} : { backgroundcolor: safeHex(style.backgroundColor, "#ffffff").slice(1) }),
    ...v.bwip,
  };

  if (format.kind === "1d") {
    const moduleMm = Math.max(0.1, style.moduleMm);
    // Work in module units: 1 SVG unit = 1 module, horizontally and vertically.
    // bwip-js interprets `height` in mm at 72 units per inch, so convert.
    opts.height = (style.heightMm / moduleMm) * PT_MM;
    opts.paddingwidth = Math.max(0, Math.round(style.quietZone));
    opts.paddingheight = Math.max(2, Math.round(style.quietZone / 4));
    if (style.showText) {
      opts.includetext = true;
      opts.textsize = (style.textPt * PT_MM) / moduleMm;
      opts.textgaps = 0;
      if (format.textPlacement) opts.textyalign = style.textPlacement;
    }
  } else {
    const pad = Math.max(0, Math.round(style.quietZone)) * (format.unitsPerModule ?? 1);
    opts.paddingwidth = pad;
    opts.paddingheight = pad;
  }

  let svg = bwip.toSVG(opts);
  const vb = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  if (!vb) throw new Error("The barcode couldn't be drawn.");
  const widthUnits = Number(vb[1]);
  const heightUnits = Number(vb[2]);

  let unitMm: number;
  if (format.kind === "1d") {
    unitMm = Math.max(0.1, style.moduleMm);
  } else {
    // Size the symbol (without quiet zone) to sizeMm across its unrotated width.
    const pad = Math.max(0, Math.round(style.quietZone)) * (format.unitsPerModule ?? 1);
    const sideUnits = style.rotate === "R" || style.rotate === "L" ? heightUnits : widthUnits;
    unitMm = style.sizeMm / Math.max(1, sideUnits - pad * 2);
  }

  const widthMm = widthUnits * unitMm;
  const heightMm = heightUnits * unitMm;
  svg = svg.replace(
    /<svg /,
    `<svg width="${widthMm.toFixed(2)}mm" height="${heightMm.toFixed(2)}mm" shape-rendering="crispEdges" `
  );
  svg = svg.replace(/(<svg[^>]*>)/, `$1<title>${format.name} barcode</title>`);
  return { svg, widthUnits, heightUnits, unitMm, widthMm, heightMm };
}

/** Integer pixels per SVG unit for a target DPI, so bars land on whole pixels. */
export function rasterSize(r: RenderedBarcode, dpi: number) {
  const pxPerUnit = Math.max(1, Math.round((r.unitMm / 25.4) * dpi));
  return {
    pxPerUnit,
    width: Math.round(r.widthUnits * pxPerUnit),
    height: Math.round(r.heightUnits * pxPerUnit),
    effectiveDpi: Math.round((pxPerUnit * 25.4) / r.unitMm),
  };
}
