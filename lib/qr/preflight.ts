/**
 * QR Preflight — "Create → Check" stage of the ScanHatch quality engine.
 *
 * Pure, client-side analysis of a QR configuration. It reuses the existing readability
 * heuristics (lib/qr/warnings.ts) and adds payload, density, error-correction and size
 * checks. Results are advisory guidance, never a certification or a guarantee.
 *
 * Future stages plug in alongside, without changing these checks:
 *   0018 Export verification  — checks on the exported file (format, dimensions, colours).
 *   0019 Re-scan / payload match — decode the exact exported file and compare payloads.
 * Each stage produces PreflightCheck-shaped results, so a combined report can list
 * them together (see `stage` on PreflightCheck).
 */
import type { Ecc, QrMatrix } from "./matrix";
import { ECC_INFO, type QrStyle } from "./style";
import type { QrWarning } from "./warnings";

export type CheckStatus = "pass" | "warn" | "fail" | "info";
export type OverallStatus = "pass" | "review" | "attention" | "empty";
/** Which settings tab can fix a check (used by the "Fix / adjust settings" action). */
export type FixTarget = "content" | "design" | "logo" | "size" | "advanced";

export interface PreflightCheck {
  id: "payload" | "density" | "ecc" | "quiet-zone" | "contrast" | "size" | "logo" | "styling";
  /** Pipeline stage that produced the check. Future: "export" (0018), "verify" (0019). */
  stage: "preflight";
  label: string;
  status: CheckStatus;
  /** Short result shown in the list, e.g. "Good", "Low", "M". */
  result: string;
  /** Concise recommendation, shown when the check needs attention. */
  advice?: string;
  /** Longer explanation for the optional Details section. */
  help: string;
  fix?: FixTarget;
}

export interface PreflightReport {
  overall: OverallStatus;
  headline: string;
  summary: string;
  checks: PreflightCheck[];
  /** First check that needs attention (for the "Fix / adjust settings" action). */
  firstIssue?: PreflightCheck;
}

export interface PreflightInput {
  /** The content type's own validation result (built by lib/qr/content.ts). */
  built: { ok: true; payload: string } | { ok: false; errors: Record<string, string> };
  /** True when the user hasn't entered anything yet. */
  empty: boolean;
  matrix: QrMatrix | null;
  /** Error from building the symbol (e.g. too much content). */
  buildError: string | null;
  style: QrStyle;
  warnings: QrWarning[];
  output: { pixelSize: number; printMm: number };
}

const ECC_HELP: Record<Ecc, string> = {
  L: "L recovers about 7% of the code. It keeps the code small, which suits clean screens and short-range scanning.",
  M: "M provides a balanced level of error recovery for general use (about 15%).",
  Q: "Q recovers about 25% of the code. Useful for labels that may get scuffed or dirty.",
  H: "H recovers about 30% of the code, the most robust level. Recommended when a logo covers part of the code.",
};

/**
 * Heuristics and why:
 * - Density: QR version bands. Versions 1–9 (≤ 53 modules) are open, easy codes; 10–19 are
 *   moderate; 20+ (or > 300 characters) matches the existing "dense code" warning.
 * - Quiet zone, contrast, logo, styling: the existing checkReadability thresholds
 *   (margin 4 recommended / < 2 very small; contrast 4:1 / 2.5:1; logo coverage vs the
 *   error-correction recovery rate; dot/diamond module styles).
 * - Size: ScanHatch's published guidance — about 2 cm is a sensible minimum print width for
 *   close scanning — plus a module-size check (modules under 0.3 mm get hard for phone
 *   cameras to resolve), and at least 3 px per module for PNG/JPG images.
 */
const DENSITY_MODERATE_FROM = 10;
const DENSITY_HIGH_FROM = 20;
const MIN_PRINT_MM = 20;
const MIN_MODULE_MM = 0.3;
const MIN_MODULE_PX = 3;

const byId = (warnings: QrWarning[], ...ids: string[]) => warnings.filter((w) => ids.includes(w.id));
const worstLevel = (ws: QrWarning[]): CheckStatus =>
  ws.some((w) => w.level === "danger") ? "fail" : ws.some((w) => w.level === "warn") ? "warn" : ws.length ? "info" : "pass";

export function runPreflight(input: PreflightInput): PreflightReport {
  const { built, empty, matrix, buildError, style, warnings, output } = input;

  if (empty) {
    return {
      overall: "empty",
      headline: "Waiting for content",
      summary: "Fill in the content to check your QR code.",
      checks: [],
    };
  }

  const checks: PreflightCheck[] = [];

  // A. Payload — the content type's own validation, plus whether the symbol could be built.
  const missing = !built.ok ? Object.keys(built.errors).length : 0;
  checks.push(
    !built.ok
      ? { id: "payload", stage: "preflight", label: "Payload", status: "fail", result: "Needs attention",
          advice: missing === 1 ? "One field needs fixing in the Content tab." : `${missing} fields need fixing in the Content tab.`,
          help: "The content is checked with the same rules as the form: required fields, valid formats (for example URLs, email addresses and phone numbers).",
          fix: "content" }
      : buildError
        ? { id: "payload", stage: "preflight", label: "Payload", status: "fail", result: "Too much content",
            advice: "Shorten the content, or lower error correction in the Advanced tab.",
            help: "A QR code has a maximum capacity, which depends on the content and the error-correction level.", fix: "content" }
        : { id: "payload", stage: "preflight", label: "Payload", status: "pass", result: "Valid",
            help: "The content passes the checks for this content type." },
  );

  if (matrix) {
    // B. Density
    const dense = byId(warnings, "dense");
    const level = dense.length || matrix.version >= DENSITY_HIGH_FROM ? "High" : matrix.version >= DENSITY_MODERATE_FROM ? "Moderate" : "Low";
    checks.push({
      id: "density", stage: "preflight", label: "Density", result: `${level} (${matrix.size}×${matrix.size} modules)`,
      status: level === "High" ? "warn" : "pass",
      advice: level === "High" ? "More complex QR codes may need a larger printed size. Shorter content makes a simpler code." : undefined,
      help: `This code is version ${matrix.version} (${matrix.size}×${matrix.size} modules). More content means more, smaller modules at the same printed size.`,
      fix: level === "High" ? "content" : undefined,
    });

    // C. Error correction — shown, never changed automatically.
    const eccGuidance = level === "High" && (matrix.ecc === "Q" || matrix.ecc === "H") && !style.logo
      ? `${matrix.ecc} adds error-correction data, which makes this already dense code larger. Without a logo, M may give a simpler code.`
      : undefined;
    checks.push({
      id: "ecc", stage: "preflight", label: "Error correction", result: `${matrix.ecc} · ${ECC_INFO[matrix.ecc].label.replace(/ \(.*\)/, "")}`,
      status: eccGuidance ? "info" : "pass", advice: eccGuidance, help: ECC_HELP[matrix.ecc], fix: eccGuidance ? "advanced" : undefined,
    });
  }

  // D. Quiet zone (existing margin heuristic)
  const margin = byId(warnings, "margin");
  const marginStatus = worstLevel(margin);
  checks.push({
    id: "quiet-zone", stage: "preflight", label: "Quiet zone", status: marginStatus,
    result: marginStatus === "pass" ? `Good (${style.margin} modules)` : marginStatus === "fail" ? `Too small (${style.margin})` : `Below recommended (${style.margin})`,
    advice: marginStatus === "pass" ? undefined : "Increase the margin around the QR code to improve scan reliability.",
    help: "Scanners need empty space around the code to find it. 4 modules is the standard margin.",
    fix: marginStatus === "pass" ? undefined : "size",
  });

  // E. Contrast (existing contrast / inverted / transparent heuristics)
  const contrastWs = byId(warnings, "contrast", "inverted", "transparent");
  const contrastStatus = worstLevel(contrastWs);
  checks.push({
    id: "contrast", stage: "preflight", label: "Contrast", status: contrastStatus,
    result: contrastStatus === "pass" ? "Good" : contrastStatus === "info" ? "Depends on background" : contrastWs.some((w) => w.id === "inverted") ? "Inverted" : "Low",
    advice: contrastStatus === "pass" ? undefined : contrastWs.find((w) => w.level !== "info")?.message ?? contrastWs[0]?.message,
    help: "Contrast appears suitable when the code is much darker than its background. Aim for at least 4:1.",
    fix: contrastStatus === "pass" ? undefined : "design",
  });

  // F. Size — print width and module size, plus pixels per module for images.
  if (matrix) {
    const totalModules = matrix.size + 2 * style.margin;
    const moduleMm = output.printMm / totalModules;
    const modulePx = output.pixelSize / totalModules;
    const issues: string[] = [];
    if (output.printMm < MIN_PRINT_MM) issues.push(`At ${output.printMm} mm wide it's very small for print; about 20 mm is a sensible minimum for close-up scanning.`);
    else if (moduleMm < MIN_MODULE_MM) issues.push(`At ${output.printMm} mm each module is about ${moduleMm.toFixed(2)} mm, which phone cameras may struggle to resolve.`);
    if (modulePx < MIN_MODULE_PX) issues.push(`At ${output.pixelSize} px each module is under ${MIN_MODULE_PX} px; choose a larger image size.`);
    checks.push({
      id: "size", stage: "preflight", label: "Size", status: issues.length ? "warn" : "pass",
      result: issues.length ? (output.printMm < MIN_PRINT_MM ? "Very small" : "Small for this content") : `Suitable (${output.printMm} mm print)`,
      advice: issues.length ? `${issues.join(" ")} For printed use, consider a larger QR code.` : undefined,
      help: `Print width ${output.printMm} mm gives modules of about ${moduleMm.toFixed(2)} mm; the ${output.pixelSize} px image gives about ${modulePx.toFixed(1)} px per module. A larger size is safer when people scan from further away. This is a recommendation, not a guarantee.`,
      fix: issues.length ? "size" : undefined,
    });
  }

  // G. Logo (existing coverage and error-correction heuristics)
  const logoWs = byId(warnings, "logo", "logo-ecc");
  const logoStatus = style.logo ? worstLevel(logoWs) : "pass";
  checks.push({
    id: "logo", stage: "preflight", label: "Logo", status: logoStatus,
    result: !style.logo ? "None" : logoStatus === "pass" ? "Size looks safe" : logoStatus === "fail" ? "Too large" : "May be too large",
    advice: style.logo && logoStatus !== "pass" ? `${logoWs.map((w) => w.message).join(" ")} Reduce the logo size or increase error correction if scanning is unreliable.` : undefined,
    help: "A logo covers part of the code, and error correction rebuilds what it hides. Smaller logos and higher error correction leave more margin. Always test a logo code with real phones.",
    fix: style.logo && logoStatus !== "pass" ? "logo" : undefined,
  });

  // H. Styling (existing dot/diamond heuristic; corner shapes all decode in testing)
  const styleWs = byId(warnings, "dots");
  checks.push({
    id: "styling", stage: "preflight", label: "Styling", status: styleWs.length ? "warn" : "pass",
    result: styleWs.length ? "May reduce readability" : "Good",
    advice: styleWs[0]?.message,
    help: "Module and corner styles change how the code looks. Corner (eye) shapes keep the code's structure; dot and diamond modules leave more white space, which some scanner apps handle less well. Corner colours are covered by the contrast check.",
    fix: styleWs.length ? "design" : undefined,
  });

  const fails = checks.filter((c) => c.status === "fail");
  const warns = checks.filter((c) => c.status === "warn");
  const overall: OverallStatus = fails.length ? "attention" : warns.length ? "review" : "pass";
  const n = fails.length || warns.length;
  return {
    overall,
    headline: overall === "pass" ? "QR ready" : overall === "review" ? "Review recommended" : "Needs attention",
    summary:
      overall === "pass" ? "All current preflight checks passed."
      : overall === "review" ? `The QR code can still be generated, but ${n === 1 ? "one setting" : `${n} settings`} may reduce readability.`
      : `The current QR configuration has ${n === 1 ? "an issue" : `${n} issues`} that should be corrected before use.`,
    checks,
    firstIssue: fails[0] ?? warns[0],
  };
}
