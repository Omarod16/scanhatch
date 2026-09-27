/** MSI (Modified Plessey) check digits, matching bwip-js/BWIPP. Verified against bwip-js output. */
import type { MsiCheck } from "./formats";

/** MSI Mod 10: double the number formed by alternate digits (rightmost first), add its digits to the others. */
export function msiMod10(s: string): number {
  const d = s.split("").map(Number);
  let odd = "";
  let other = 0;
  for (let i = 0; i < d.length; i++) {
    if ((d.length - 1 - i) % 2 === 0) odd += d[i];
    else other += d[i];
  }
  const doubled = String(Number(odd || "0") * 2).split("").reduce((a, b) => a + Number(b), 0);
  return (10 - ((doubled + other) % 10)) % 10;
}

/** MSI Mod 11 (IBM weights 2–7 from the right). Returns 10 when no single check digit exists. */
export function msiMod11(s: string): number {
  let sum = 0;
  let w = 2;
  for (let i = s.length - 1; i >= 0; i--) {
    sum += Number(s[i]) * w;
    w = w === 7 ? 2 : w + 1;
  }
  return (11 - (sum % 11)) % 11;
}

/** Check digits appended for a scheme, or null if the number has no valid Mod 11 check digit. */
export function msiCheckDigits(data: string, scheme: MsiCheck): string | null {
  switch (scheme) {
    case "none":
      return "";
    case "mod10":
      return String(msiMod10(data));
    case "mod1010": {
      const a = String(msiMod10(data));
      return a + msiMod10(data + a);
    }
    case "mod11": {
      const a = msiMod11(data);
      return a === 10 ? null : String(a);
    }
    case "mod1110": {
      const a = msiMod11(data);
      return a === 10 ? null : String(a) + msiMod10(data + a);
    }
  }
}

export const MSI_CHECK_LABELS: Record<MsiCheck, string> = {
  none: "No check digit",
  mod10: "Mod 10",
  mod1010: "Mod 10 + Mod 10",
  mod11: "Mod 11",
  mod1110: "Mod 11 + Mod 10",
};
