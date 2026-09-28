import { toCsv } from "@/lib/csv/write";

export interface BulkRow<P = unknown> {
  /** Spreadsheet row number (header = 1). */
  row: number;
  name: string;
  typeLabel: string;
  /** Value exactly as it appears in the file. */
  input: string;
  /** Value that will actually be encoded (may differ, e.g. added check digit). */
  output: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
  notes: string[];
  duplicateOf?: number;
  /** Whatever the generator needs to render this row. */
  plan?: P;
}

export function markDuplicates<P>(rows: BulkRow<P>[], key: (r: BulkRow<P>) => string) {
  const first = new Map<string, number>();
  for (const r of rows) {
    if (!r.valid) continue;
    const k = key(r);
    const prev = first.get(k);
    if (prev !== undefined) r.duplicateOf = prev;
    else first.set(k, r.row);
  }
  return rows;
}

export function summarise(rows: BulkRow[]) {
  const valid = rows.filter((r) => r.valid);
  return {
    total: rows.length,
    valid: valid.length,
    invalid: rows.length - valid.length,
    duplicates: valid.filter((r) => r.duplicateOf !== undefined).length,
    warnings: valid.filter((r) => r.warnings.length).length,
  };
}

/** row,name,value,error — one line per problem. Formula-looking cells are neutralised. */
export function errorReportCsv(rows: BulkRow[], valueLabel: string) {
  const lines: (string | number)[][] = [["row", "name", valueLabel, "error"]];
  for (const r of rows) for (const e of r.errors) lines.push([r.row, r.name, r.input, e]);
  return toCsv(lines);
}
