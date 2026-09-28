/**
 * CSV output for reports and ZIP indexes. Cells that a spreadsheet would treat as
 * a formula (starting with = + - @ tab or CR) are prefixed with ' so they're shown
 * as text, protecting against CSV/formula injection.
 */
export function csvCell(value: string | number, { escapeFormulas = true } = {}) {
  let v = String(value);
  if (escapeFormulas && /^[=+\-@\t\r]/.test(v)) v = `'${v}`;
  return /[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

export function toCsv(rows: (string | number)[][], opts?: { escapeFormulas?: boolean }) {
  // BOM so Excel opens UTF-8 (accents, emoji) correctly.
  return "\uFEFF" + rows.map((r) => r.map((c) => csvCell(c, opts)).join(",")).join("\r\n") + "\r\n";
}

export const csvBlob = (text: string) => new Blob([text], { type: "text/csv;charset=utf-8" });
