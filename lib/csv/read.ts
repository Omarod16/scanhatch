/**
 * Safe CSV intake: checks the file, detects the text encoding and delimiter,
 * and parses with PapaParse (quoted commas, quotes, newlines, BOM). Row numbers
 * match spreadsheet row numbers (the header is row 1).
 */
import Papa from "papaparse";

export interface CsvRecord {
  /** Spreadsheet row number (header = 1). */
  row: number;
  cells: string[];
  /** More cells than headers: usually an unquoted comma. */
  extraCells: number;
}

export interface CsvTable {
  headers: string[];
  records: CsvRecord[];
  delimiter: string;
  warnings: string[];
  skippedEmpty: number;
}

export type CsvResult = { ok: true; table: CsvTable } | { ok: false; error: string };

const DELIMS = [",", ";", "\t"] as const;
const DELIM_NAMES: Record<string, string> = { ",": "comma", ";": "semicolon", "\t": "tab" };

function decode(bytes: Uint8Array): { text: string; warning?: string } | { error: string } {
  if (bytes[0] === 0xff && bytes[1] === 0xfe) return { text: new TextDecoder("utf-16le").decode(bytes) };
  if (bytes[0] === 0xfe && bytes[1] === 0xff) return { text: new TextDecoder("utf-16be").decode(bytes) };
  try {
    return { text: new TextDecoder("utf-8", { fatal: true }).decode(bytes) };
  } catch {
    return {
      text: new TextDecoder("windows-1252").decode(bytes),
      warning: "This file isn't UTF-8, so it was read as Windows-1252 (Excel's older default). Check accented characters, or re-save it as \"CSV UTF-8\".",
    };
  }
}

/** Picks the delimiter from the header line (unquoted characters only). */
function detectDelimiter(text: string) {
  let line = "";
  let quoted = false;
  for (const ch of text) {
    if (ch === '"') quoted = !quoted;
    else if ((ch === "\n" || ch === "\r") && !quoted) { if (line.trim()) break; line = ""; continue; }
    if (!quoted) line += ch;
  }
  let best = ",";
  let bestCount = 0;
  for (const d of DELIMS) {
    const n = line.split(d).length - 1;
    if (n > bestCount) { best = d; bestCount = n; }
  }
  return best;
}

export async function readCsvFile(file: File, opts: { maxBytes: number; maxRows: number }): Promise<CsvResult> {
  const name = file.name.toLowerCase();
  if (/\.(xlsx|xlsm|xls|ods|numbers)$/.test(name)) {
    return { ok: false, error: "This is a spreadsheet file, not a CSV. In your spreadsheet app choose File → Save As (or Download) → CSV UTF-8, then upload that file." };
  }
  if (file.size === 0) return { ok: false, error: "The file is empty." };
  if (file.size > opts.maxBytes) {
    return { ok: false, error: `The file is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is ${opts.maxBytes / 1024 / 1024} MB. Split it into smaller files.` };
  }
  const allowedTypes = ["", "text/csv", "text/plain", "application/csv", "text/x-csv", "application/vnd.ms-excel", "text/tab-separated-values"];
  if (!/\.(csv|txt|tsv)$/.test(name) && !allowedTypes.includes(file.type)) {
    return { ok: false, error: "Upload a .csv file (or a .txt/.tsv file containing comma, semicolon or tab separated values)." };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04) {
    return { ok: false, error: "This is an Excel workbook, even though it's named like a CSV. Save it as \"CSV UTF-8\" and upload that." };
  }
  if (bytes[0] === 0xd0 && bytes[1] === 0xcf && bytes[2] === 0x11 && bytes[3] === 0xe0) {
    return { ok: false, error: "This is an old Excel (.xls) file. Save it as \"CSV UTF-8\" and upload that." };
  }
  const decoded = decode(bytes);
  if ("error" in decoded) return { ok: false, error: decoded.error };
  let text = decoded.text.replace(/^\uFEFF/, "");
  if (text.includes("\u0000")) return { ok: false, error: "This doesn't look like a text file. Upload a CSV." };
  const warnings: string[] = decoded.warning ? [decoded.warning] : [];

  const delimiter = detectDelimiter(text);
  const parsed = Papa.parse<string[]>(text, { delimiter, header: false, skipEmptyLines: false });
  text = "";

  const quoteErr = parsed.errors.find((e) => e.type === "Quotes");
  if (quoteErr) {
    const row = (quoteErr.row ?? 0) + 1;
    return { ok: false, error: `The CSV is malformed near row ${row}: a quoted value is never closed. Check for a missing closing double quote ("). To include a quote inside a value, write it twice ("").` };
  }

  const all = parsed.data;
  let headerIdx = all.findIndex((r) => r.some((c) => c.trim() !== ""));
  if (headerIdx < 0) return { ok: false, error: "The file has no content." };
  const headers = all[headerIdx].map((h) => h.replace(/^\uFEFF/, "").trim().toLowerCase());

  const seen = new Map<string, number>();
  for (const h of headers) {
    if (!h) continue;
    if (seen.has(h)) return { ok: false, error: `The column "${h}" appears more than once in the header row. Rename or remove the duplicate column.` };
    seen.set(h, 1);
  }

  const records: CsvRecord[] = [];
  let skippedEmpty = 0;
  for (let i = headerIdx + 1; i < all.length; i++) {
    const cells = all[i];
    if (cells.every((c) => c.trim() === "")) { if (i < all.length - 1) skippedEmpty++; continue; }
    records.push({ row: i + 1, cells, extraCells: Math.max(0, cells.length - headers.length) });
  }
  headerIdx = -1;

  if (!records.length) return { ok: false, error: "The file has a header row but no data rows." };
  if (records.length > opts.maxRows) {
    return { ok: false, error: `The file has ${records.length} rows. The maximum is ${opts.maxRows} per batch. Split it into smaller files and generate them one at a time.` };
  }
  if (skippedEmpty) warnings.push(`${skippedEmpty} empty row${skippedEmpty === 1 ? " was" : "s were"} skipped.`);
  if (delimiter !== ",") warnings.push(`Values are separated by ${DELIM_NAMES[delimiter]}s.`);
  return { ok: true, table: { headers, records, delimiter, warnings, skippedEmpty } };
}

/** Finds a column by any of its accepted names. */
export function findColumn(headers: string[], aliases: string[]) {
  return headers.findIndex((h) => aliases.includes(h.replace(/[\s-]+/g, "_")));
}
