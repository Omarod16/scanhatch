/**
 * Bulk barcodes: row validation reuses the Phase 5 validator (complete values,
 * check digits) and the Phase 3 format rules (what the encoder accepts);
 * rendering reuses the Phase 3 renderer.
 */
import { gs1CheckDigit, upcECheckDigit } from "@/lib/barcode/checkdigit";
import {
  BARCODE_FORMATS, DEFAULT_FORMAT_OPTIONS, barcodeFormat,
  type BarcodeFormat, type BarcodeFormatId, type CodabarGuard, type FormatOptions, type MsiCheck, type Validation,
} from "@/lib/barcode/formats";
import { findColumn, type CsvTable } from "@/lib/csv/read";
import { validateBarcode, type ValidatorFormatId } from "@/lib/validate/barcode";
import { MAX_NAME_LENGTH } from "./limits";
import { markDuplicates, type BulkRow } from "./rows";

export const BARCODE_COLUMNS = {
  value: ["value", "data", "barcode", "code", "number", "gtin", "content"],
  name: ["name", "filename", "file_name", "file", "label", "title", "product"],
  type: ["type", "format", "symbology", "barcode_type"],
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const ALIASES: Record<string, BarcodeFormatId> = {
  upc: "upca", gtin13: "ean13", gtin8: "ean8", gtin12: "upca", gtin14: "itf14", interleaved2of5: "itf", i2of5: "itf",
  interleaved25: "itf", nw7: "codabar", msiplessey: "msi", modifiedplessey: "msi", plessey: "msi", laetus: "pharmacode",
  azteccode: "aztec", datamatrixecc200: "datamatrix", code128auto: "code128",
};
for (const f of BARCODE_FORMATS) { ALIASES[norm(f.id)] = f.id; ALIASES[norm(f.name)] = f.id; }

export function resolveBarcodeType(raw: string): BarcodeFormatId | null | "qr" {
  const n = norm(raw);
  if (["qr", "qrcode"].includes(n)) return "qr";
  return ALIASES[n] ?? null;
}

const GS1_LEN: Partial<Record<BarcodeFormatId, number>> = { ean13: 13, ean8: 8, upca: 12, itf14: 14, upce: 8 };
const VALIDATOR_IDS = new Set<string>(["ean13", "ean8", "upca", "upce", "itf14", "itf", "code128", "code39", "code93", "codabar", "msi", "pharmacode"]);

export interface BarcodePlan {
  formatId: BarcodeFormatId;
  validation: Extract<Validation, { ok: true }>;
}

export interface BarcodeCheckOptions {
  defaultType: BarcodeFormatId;
  autoCheckDigit: boolean;
  msiCheck: MsiCheck;
}

export interface BarcodeCheckResult {
  rows: BulkRow<BarcodePlan>[];
  fileError?: string;
  warnings: string[];
  hasTypeColumn: boolean;
  hasNameColumn: boolean;
}

export function checkBarcodeRows(table: CsvTable, opts: BarcodeCheckOptions): BarcodeCheckResult {
  const { headers } = table;
  const vi = findColumn(headers, BARCODE_COLUMNS.value);
  const ni = findColumn(headers, BARCODE_COLUMNS.name);
  const ti = findColumn(headers, BARCODE_COLUMNS.type);
  if (vi < 0) {
    return { rows: [], warnings: [], hasTypeColumn: false, hasNameColumn: false,
      fileError: `The CSV needs a "value" column. Found: ${headers.filter(Boolean).map((h) => `"${h}"`).join(", ") || "no column names"}. Use a template to see the expected layout.` };
  }
  const known = new Set([vi, ni, ti].filter((i) => i >= 0));
  const ignored = headers.filter((h, i) => h && !known.has(i));
  const warnings = ignored.length ? [`Ignored column${ignored.length > 1 ? "s" : ""}: ${ignored.join(", ")}.`] : [];

  const rows: BulkRow<BarcodePlan>[] = table.records.map((rec) => {
    const cell = (i: number) => (i >= 0 ? rec.cells[i] ?? "" : "");
    const input = cell(vi);
    const name = cell(ni).trim();
    const typeRaw = cell(ti).trim();
    const errors: string[] = [];
    const notes: string[] = [];

    let formatId = opts.defaultType;
    let badType = false;
    if (typeRaw) {
      const t = resolveBarcodeType(typeRaw);
      if (t === "qr") { badType = true; errors.push("QR codes aren't generated here. Use the Bulk QR Generator."); }
      else if (!t) { badType = true; errors.push(`Unsupported barcode type "${typeRaw}".`); }
      else formatId = t;
    }
    const format = barcodeFormat(formatId) as BarcodeFormat;
    if (Array.from(name).length > MAX_NAME_LENGTH) errors.push(`Name is too long (${Array.from(name).length} characters; the maximum is ${MAX_NAME_LENGTH}).`);
    if (rec.extraCells) errors.push(`This row has ${rec.extraCells} more value${rec.extraCells > 1 ? "s" : ""} than there are columns. If the value contains commas, wrap it in double quotes.`);

    let value = input.trim();
    if (value !== input && value) notes.push("Spaces at the start or end were removed.");
    let plan: BarcodePlan | undefined;

    if (!value) errors.push("Missing value.");
    else if (!errors.length) {
      const fopts: FormatOptions = { ...DEFAULT_FORMAT_OPTIONS, msiCheck: opts.msiCheck };
      const len = GS1_LEN[formatId];
      if (len) {
        const digits = value.replace(/[\s-]/g, "");
        if (opts.autoCheckDigit && /^\d+$/.test(digits) && digits.length === len - 1) {
          const c = formatId === "upce" ? upcECheckDigit(digits) : gs1CheckDigit(digits);
          if (c !== null) { value = digits + c; notes.push(`Check digit added: ${value}`); }
        }
      }
      let genValue = value;
      if (VALIDATOR_IDS.has(formatId)) {
        const v = validateBarcode(formatId as ValidatorFormatId, value, { code39HasCheck: false, msiCheck: "none" });
        if (v && !v.valid) errors.push(...v.problems);
        if (v?.valid) genValue = v.checked;
        if (formatId === "codabar" && v?.valid && /^[A-D].*[A-D]$/i.test(genValue) && genValue.length > 1) {
          fopts.codabarStart = genValue[0].toUpperCase() as CodabarGuard;
          fopts.codabarStop = genValue.at(-1)!.toUpperCase() as CodabarGuard;
          genValue = genValue.slice(1, -1);
        }
      }
      if (!errors.length) {
        const g = format.validate(genValue, fopts);
        if (!g.ok) errors.push(g.error || "This value can't be encoded in this format.");
        else plan = { formatId, validation: g };
      }
    }
    return {
      row: rec.row, name, typeLabel: badType ? typeRaw : format.name, input, output: plan?.validation.value ?? value,
      valid: errors.length === 0, errors, warnings: [], notes, plan,
    };
  });
  markDuplicates(rows, (r) => `${r.plan?.formatId}|${r.output}`);
  for (const r of rows) if (r.duplicateOf !== undefined) r.warnings.push(`Duplicate data detected (same as row ${r.duplicateOf}).`);
  return { rows, warnings, hasTypeColumn: ti >= 0, hasNameColumn: ni >= 0 };
}
