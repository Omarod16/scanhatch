/**
 * Bulk QR: row validation and rendering, reusing the Phase 2 content builders,
 * matrix and SVG renderer, and the Phase 5 content validator.
 */
import { findColumn, type CsvTable } from "@/lib/csv/read";
import { contentType } from "@/lib/qr/content";
import { buildMatrix, QrDataTooLongError, type Ecc } from "@/lib/qr/matrix";
import { renderQrSvg } from "@/lib/qr/render";
import { DEFAULT_STYLE, type QrStyle } from "@/lib/qr/style";
import { validateQrContent } from "@/lib/validate/qr-content";
import { MAX_NAME_LENGTH } from "./limits";
import { markDuplicates, type BulkRow } from "./rows";

export type BulkQrType = "auto" | "url" | "text" | "email" | "phone";
export const QR_TYPE_LABEL: Record<BulkQrType, string> = { auto: "Auto", url: "URL", text: "Text", email: "Email", phone: "Phone" };
const TYPE_ALIASES: Record<string, BulkQrType> = {
  auto: "auto", generic: "auto", url: "url", link: "url", website: "url", web: "url",
  text: "text", email: "email", mail: "email", mailto: "email", phone: "phone", tel: "phone", telephone: "phone",
};

export const QR_COLUMNS = {
  data: ["data", "content", "url", "text", "value", "payload"],
  name: ["name", "filename", "file_name", "file", "label", "title"],
  type: ["type", "qr_type", "kind"],
};

export interface QrPlan { payload: string }

export interface QrCheckResult {
  rows: BulkRow<QrPlan>[];
  fileError?: string;
  warnings: string[];
  hasTypeColumn: boolean;
  hasNameColumn: boolean;
}

function buildPayload(type: Exclude<BulkQrType, "auto">, data: string): { payload?: string; error?: string; notes: string[] } {
  const notes: string[] = [];
  if (type === "text") return { payload: data, notes };
  const id = type === "url" ? "url" : type === "email" ? "email" : "phone";
  const t = contentType(id)!;
  const field = t.fields[0].name;
  const r = t.build({ ...t.defaults, [field]: data });
  if (!r.ok) {
    const msg = Object.values(r.errors)[0] ?? "";
    const label = type === "url" ? "Invalid URL" : type === "email" ? "Invalid email address" : "Invalid phone number";
    return { error: type === "email" || !msg ? `${label}.` : `${label}: ${msg}`, notes };
  }
  if (type === "url" && r.payload !== data) notes.push("https:// was added.");
  return { payload: r.payload, notes };
}

export function checkQrRows(table: CsvTable, opts: { defaultType: BulkQrType; ecc: Ecc }): QrCheckResult {
  const { headers } = table;
  const di = findColumn(headers, QR_COLUMNS.data);
  const ni = findColumn(headers, QR_COLUMNS.name);
  const ti = findColumn(headers, QR_COLUMNS.type);
  if (di < 0) {
    return { rows: [], warnings: [], hasTypeColumn: false, hasNameColumn: false,
      fileError: `The CSV needs a "data" column. Found: ${headers.filter(Boolean).map((h) => `"${h}"`).join(", ") || "no column names"}. Use the template to see the expected layout.` };
  }
  const known = new Set([di, ni, ti].filter((i) => i >= 0));
  const ignored = headers.filter((h, i) => h && !known.has(i));
  const warnings = ignored.length ? [`Ignored column${ignored.length > 1 ? "s" : ""}: ${ignored.join(", ")}.`] : [];

  const rows: BulkRow<QrPlan>[] = table.records.map((rec) => {
    const cell = (i: number) => (i >= 0 ? rec.cells[i] ?? "" : "");
    const input = cell(di);
    const name = cell(ni).trim();
    const typeRaw = cell(ti).trim().toLowerCase();
    const errors: string[] = [];
    const warn: string[] = [];
    const notes: string[] = [];

    let type: BulkQrType = opts.defaultType;
    if (typeRaw) {
      const t = TYPE_ALIASES[typeRaw];
      if (!t) errors.push(`Unsupported QR type "${cell(ti).trim()}". Use url, text, email or phone.`);
      else type = t;
    }
    if (Array.from(name).length > MAX_NAME_LENGTH) errors.push(`Name is too long (${Array.from(name).length} characters; the maximum is ${MAX_NAME_LENGTH}).`);
    if (rec.extraCells) errors.push(`This row has ${rec.extraCells} more value${rec.extraCells > 1 ? "s" : ""} than there are columns. If the data contains commas, wrap it in double quotes.`);

    const data = input.trim();
    if (data !== input && data) notes.push("Spaces at the start or end were removed.");
    let resolved: Exclude<BulkQrType, "auto"> = type === "auto" ? (/^https?:\/\//i.test(data) ? "url" : "text") : type;
    let payload: string | undefined;
    if (!data) errors.push("Missing data.");
    else if (!errors.some((e) => e.startsWith("Unsupported"))) {
      const b = buildPayload(resolved, data);
      if (b.error) errors.push(b.error);
      payload = b.payload;
      notes.push(...b.notes);
    }
    if (payload !== undefined && !errors.length) {
      try {
        buildMatrix(payload, opts.ecc);
      } catch (e) {
        if (e instanceof QrDataTooLongError) errors.push(`Too much data for one QR code at error correction ${opts.ecc} (${new TextEncoder().encode(payload).length} bytes). Shorten it or choose a lower error correction level.`);
        else errors.push("This data can't be encoded as a QR code.");
      }
      if (!errors.length) {
        const cv = validateQrContent(payload);
        for (const c of cv.checks) {
          if (c.level === "error") errors.push(c.message);
          else if (c.level === "warn") warn.push(c.message);
        }
        if (type === "auto") resolved = cv.type === "url" ? "url" : resolved;
      }
    }
    return {
      row: rec.row, name, typeLabel: typeRaw && !TYPE_ALIASES[typeRaw] ? cell(ti).trim() : QR_TYPE_LABEL[resolved], input, output: payload ?? "",
      valid: errors.length === 0, errors, warnings: warn, notes, plan: payload !== undefined ? { payload } : undefined,
    };
  });
  markDuplicates(rows, (r) => r.output);
  for (const r of rows) if (r.duplicateOf !== undefined) r.warnings.unshift(`Duplicate data detected (same as row ${r.duplicateOf}).`);
  return { rows, warnings, hasTypeColumn: ti >= 0, hasNameColumn: ni >= 0 };
}

export interface BulkQrDesign {
  foreground: string;
  background: string;
  ecc: Ecc;
  margin: number;
  sizePx: number;
  format: "png" | "svg";
  logo: { dataUrl: string; width: number; height: number; size: number } | null;
}

export const DEFAULT_BULK_QR_DESIGN: BulkQrDesign = {
  foreground: "#000000", background: "#ffffff", ecc: "M", margin: 4, sizePx: 1024, format: "png", logo: null,
};

export function bulkQrStyle(d: BulkQrDesign): QrStyle {
  return {
    ...DEFAULT_STYLE,
    foreground: d.foreground,
    background: d.background,
    eyeColor: { frame: d.foreground, ball: d.foreground },
    eyeColors: [0, 1, 2].map(() => ({ frame: d.foreground, ball: d.foreground })) as QrStyle["eyeColors"],
    margin: d.margin,
    ecc: d.logo ? "H" : d.ecc,
    logo: d.logo ? { ...d.logo, padding: 0.08, background: true, backgroundColor: d.background, rounded: false, excavate: true } : null,
  };
}

export function renderBulkQrSvg(payload: string, d: BulkQrDesign, title: string) {
  const style = bulkQrStyle(d);
  return renderQrSvg(buildMatrix(payload, style.ecc), style, { pixelSize: d.sizePx, title });
}
