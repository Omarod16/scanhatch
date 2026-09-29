import { contrast, luminance, safeHex } from "./color";
import type { QrMatrix } from "./matrix";
import { ECC_INFO, logoBoxModules, type QrStyle } from "./style";

export type WarningLevel = "info" | "warn" | "danger";
export interface QrWarning {
  id: string;
  level: WarningLevel;
  message: string;
}

/** Heuristic readability checks. They warn; they never block. */
export function checkReadability(m: QrMatrix, style: QrStyle, payloadLength: number): QrWarning[] {
  const out: QrWarning[] = [];
  const bg = safeHex(style.background, "#ffffff");

  const darkColors = [style.foreground];
  if (style.gradient !== "none") darkColors.push(style.gradientColor);
  if (style.eyeColorMode === "custom") darkColors.push(style.eyeColor.frame, style.eyeColor.ball);
  if (style.eyeColorMode === "each") style.eyeColors.forEach((e) => darkColors.push(e.frame, e.ball));

  if (style.transparent) {
    out.push({ id: "transparent", level: "info", message: "Transparent background: make sure the surface you place it on is much lighter than the code." });
  } else {
    const colors = darkColors.map((c) => safeHex(c, "#000000"));
    if (colors.some((c) => luminance(c) > luminance(bg))) {
      out.push({ id: "inverted", level: "danger", message: "The code is lighter than its background. Many scanners can't read inverted QR codes; use a dark code on a light background." });
    }
    const worst = Math.min(...colors.map((c) => contrast(c, bg)));
    if (worst < 2.5) {
      out.push({ id: "contrast", level: "danger", message: `Contrast is very low (${worst.toFixed(1)}:1). This code will likely fail to scan.` });
    } else if (worst < 4) {
      out.push({ id: "contrast", level: "warn", message: `Contrast is low (${worst.toFixed(1)}:1). Aim for at least 4:1, darker code on a lighter background.` });
    }
  }

  if (style.margin < 2) {
    out.push({ id: "margin", level: "danger", message: "The quiet zone (margin) is very small. Scanners need empty space around the code; use at least 2, ideally 4." });
  } else if (style.margin < 4) {
    out.push({ id: "margin", level: "warn", message: "The quiet zone is below the recommended 4 modules. Fine on plain backgrounds; risky on busy ones." });
  }

  if (style.logo) {
    const n = logoBoxModules(m.size, style.logo);
    const covered = (n * n) / (m.size * m.size);
    const recovery = ECC_INFO[m.ecc].recovery;
    if (covered > recovery * 0.8) {
      out.push({ id: "logo", level: "danger", message: `The logo covers about ${Math.round(covered * 100)}% of the code, close to what ${m.ecc} error correction can recover. Make the logo smaller or raise error correction.` });
    } else if (covered > recovery * 0.5) {
      out.push({ id: "logo", level: "warn", message: `The logo covers about ${Math.round(covered * 100)}% of the code. It may scan, but a smaller logo is safer.` });
    }
    if (m.ecc === "L" || m.ecc === "M") {
      out.push({ id: "logo-ecc", level: "warn", message: "With a logo, High (H) error correction is recommended." });
    }
  }

  if (m.version >= 20 || payloadLength > 300) {
    out.push({ id: "dense", level: "warn", message: `This is a dense code (version ${m.version}, ${m.size}×${m.size} modules). Print it larger and keep the content short if you can.` });
  }

  if (style.dotStyle === "dots" || style.dotStyle === "diamond") {
    out.push({ id: "dots", level: "warn", message: "Dot and diamond styles leave more white space between modules. Most phone cameras read them, but some scanner apps have more difficulty with highly stylised codes, so test with the devices your audience will use." });
  }

  return out;
}
