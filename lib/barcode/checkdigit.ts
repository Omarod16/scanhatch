/**
 * GS1 check digits (EAN-13, EAN-8, UPC-A, UPC-E, ITF-14 / GTIN) and UPC-E ↔ UPC-A conversion.
 * Pure functions; no library needed.
 */

/** Explains the mod-10 calculation step by step (used in the UI). */
export interface CheckDigitSteps {
  body: string;
  weights: number[];
  products: number[];
  sum: number;
  check: number;
}

/**
 * GS1 mod-10: working right to left over the digits (excluding the check digit),
 * multiply alternately by 3 and 1, sum, and take the amount needed to reach
 * the next multiple of 10.
 */
export function gs1CheckDigitSteps(body: string): CheckDigitSteps {
  if (!/^\d+$/.test(body)) throw new Error("Digits only");
  const digits = body.split("").map(Number);
  const weights = digits.map((_, i) => ((digits.length - i) % 2 === 1 ? 3 : 1));
  const products = digits.map((d, i) => d * weights[i]);
  const sum = products.reduce((a, b) => a + b, 0);
  return { body, weights, products, sum, check: (10 - (sum % 10)) % 10 };
}

export const gs1CheckDigit = (body: string) => gs1CheckDigitSteps(body).check;

export const isValidGs1 = (full: string) =>
  /^\d{2,}$/.test(full) && gs1CheckDigit(full.slice(0, -1)) === Number(full.slice(-1));

/**
 * Expands a UPC-E body (number system + 6 digits) to the 11-digit UPC-A body.
 * Returns null if the number system isn't 0 or 1.
 */
export function upcEToUpcABody(nsPlus6: string): string | null {
  if (!/^[01]\d{6}$/.test(nsPlus6)) return null;
  const ns = nsPlus6[0];
  const [d1, d2, d3, d4, d5, d6] = nsPlus6.slice(1).split("");
  switch (d6) {
    case "0":
    case "1":
    case "2":
      return `${ns}${d1}${d2}${d6}0000${d3}${d4}${d5}`;
    case "3":
      return `${ns}${d1}${d2}${d3}00000${d4}${d5}`;
    case "4":
      return `${ns}${d1}${d2}${d3}${d4}00000${d5}`;
    default:
      return `${ns}${d1}${d2}${d3}${d4}${d5}0000${d6}`;
  }
}

/** UPC-E check digit = the check digit of its expanded UPC-A form. */
export function upcECheckDigit(nsPlus6: string): number | null {
  const a = upcEToUpcABody(nsPlus6);
  return a ? gs1CheckDigit(a) : null;
}

/**
 * Compresses an 11-digit UPC-A body to UPC-E (ns + 6 digits), or null if the
 * number can't be expressed as UPC-E. Verified by expanding back.
 */
export function upcABodyToUpcE(body11: string): string | null {
  if (!/^[01]\d{10}$/.test(body11)) return null;
  const ns = body11[0];
  const m = body11.slice(1, 6);
  const p = body11.slice(6, 11);
  const candidates: string[] = [];
  if ("012".includes(m[2]) && m.slice(3) === "00" && p.slice(0, 2) === "00") candidates.push(m[0] + m[1] + p.slice(2) + m[2]);
  if (m.slice(3) === "00" && p.slice(0, 3) === "000") candidates.push(m.slice(0, 3) + p.slice(3) + "3");
  if (m[4] === "0" && p.slice(0, 4) === "0000") candidates.push(m.slice(0, 4) + p[4] + "4");
  if (m[4] !== "0" && p.slice(0, 4) === "0000" && "56789".includes(p[4])) candidates.push(m + p[4]);
  for (const c of candidates) {
    if (upcEToUpcABody(ns + c) === body11) return ns + c;
  }
  return null;
}
