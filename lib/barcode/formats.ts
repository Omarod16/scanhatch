/**
 * Barcode format definitions and validation. Validation runs before any
 * rendering and never silently changes the user's data: anything added
 * (like a calculated check digit) is reported back in `notes`.
 */
import { gs1CheckDigit, upcABodyToUpcE, upcECheckDigit } from "./checkdigit";

export type BarcodeFormatId =
  | "code128" | "code39" | "code93" | "ean13" | "ean8" | "upca" | "upce"
  | "itf" | "itf14" | "codabar" | "msi" | "pharmacode"
  | "datamatrix" | "pdf417" | "aztec";

export type FormatGroup = "retail" | "logistics" | "general" | "specialist" | "2d";

export const GROUP_LABELS: Record<FormatGroup, string> = {
  retail: "Retail products",
  logistics: "Shipping & cartons",
  general: "General purpose",
  specialist: "Specialist",
  "2d": "2D codes",
};

export type MsiCheck = "none" | "mod10" | "mod1010" | "mod11" | "mod1110";
export type CodabarGuard = "A" | "B" | "C" | "D";

export interface FormatOptions {
  code39Check: boolean;
  msiCheck: MsiCheck;
  codabarStart: CodabarGuard;
  codabarStop: CodabarGuard;
}

export const DEFAULT_FORMAT_OPTIONS: FormatOptions = {
  code39Check: false,
  msiCheck: "mod10",
  codabarStart: "A",
  codabarStop: "A",
};

export type Validation =
  | {
      ok: true;
      /** Text passed to the encoder. */
      encode: string;
      /** The complete value the barcode represents (what a scanner should return). */
      value: string;
      /** Extra encoder options for this input. */
      bwip?: Record<string, string | number | boolean>;
      notes: string[];
      checkDigit?: { digit: number; calculated: boolean };
    }
  | { ok: false; error: string; empty: boolean };

export interface BarcodeFormat {
  id: BarcodeFormatId;
  name: string;
  bcid: string;
  group: FormatGroup;
  kind: "1d" | "2d";
  summary: string;
  placeholder: string;
  instructions: string;
  example: string;
  /** Recommended quiet zone in modules (each side). */
  quietZone: number;
  /** bwip-js units per module for 2D symbols (used for quiet zone). */
  unitsPerModule?: number;
  /** Default narrow bar (module) width in mm for 1D formats. */
  moduleMm?: number;
  heightMm?: number;
  /** Human-readable text can be positioned above the bars. */
  textPlacement: boolean;
  /** ScanHatch's decoder (ZXing) can read this format. */
  decodable: boolean;
  validate: (input: string, opts: FormatOptions) => Validation;
}

const empty = (): Validation => ({ ok: false, error: "", empty: true });
const fail = (error: string): Validation => ({ ok: false, error, empty: false });

function firstInvalid(input: string, allowed: RegExp) {
  for (const ch of input) if (!allowed.test(ch)) return ch;
  return null;
}

const describeChar = (ch: string) =>
  ch === " " ? "a space" : ch === "\n" ? "a line break" : ch === "\t" ? "a tab" : `"${ch}"`;

/** Shared GS1 handler for fixed-length numeric formats with a mod-10 check digit. */
function gs1Validator(name: string, len: number) {
  return (raw: string): Validation => {
    const input = raw.replace(/[\s-]/g, "");
    if (!input) return empty();
    if (!/^\d+$/.test(input)) return fail(`${name} can only contain digits (0–9).`);
    if (input.length === len - 1) {
      const digit = gs1CheckDigit(input);
      return {
        ok: true, encode: input + digit, value: input + digit,
        notes: [`Check digit ${digit} was calculated and added. Complete ${name}: ${input + digit}`],
        checkDigit: { digit, calculated: true },
      };
    }
    if (input.length === len) {
      const body = input.slice(0, -1);
      const given = Number(input.slice(-1));
      const digit = gs1CheckDigit(body);
      if (digit !== given) {
        return fail(`Invalid check digit. The last digit should be ${digit}, not ${given}. Check the number for typos, or enter the first ${len - 1} digits to calculate it.`);
      }
      return { ok: true, encode: input, value: input, notes: ["Check digit is valid."], checkDigit: { digit, calculated: false } };
    }
    return fail(`${name} needs ${len - 1} digits (check digit calculated for you) or ${len} digits (check digit validated). You entered ${input.length}.`);
  };
}

const TEXT_2D = /[\x20-\x7E\n\r\t]/;

function text2d(name: string, max: number) {
  return (input: string): Validation => {
    if (!input) return empty();
    const bad = firstInvalid(input, TEXT_2D);
    if (bad) return fail(`${describeChar(bad)} isn't supported here. ${name} on ScanHatch supports standard English letters, digits, symbols and line breaks. For other characters, use a QR code.`);
    if (input.length > max) return fail(`That's ${input.length} characters. Keep ${name} content under ${max} characters.`);
    return { ok: true, encode: input, value: input, notes: [] };
  };
}

const CODE39_SET = /[0-9A-Z \-.$/+%]/;
const CODE39_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%";

/** Code 39 mod 43 check character. */
export function code39Mod43(data: string) {
  let sum = 0;
  for (const ch of data) sum += CODE39_CHARS.indexOf(ch);
  return CODE39_CHARS[sum % 43];
}

export const BARCODE_FORMATS: BarcodeFormat[] = [
  {
    id: "code128", name: "Code 128", bcid: "code128", group: "general", kind: "1d",
    summary: "General-purpose high-density barcode for letters, numbers and symbols.",
    placeholder: "ABC-12345", instructions: "Enter the text or data to encode.", example: "SCANHATCH-128",
    quietZone: 10, moduleMm: 0.33, heightMm: 15, textPlacement: true, decodable: true,
    validate: (input) => {
      if (!input) return empty();
      const bad = firstInvalid(input, /[\x20-\x7E]/);
      if (bad) return fail(`${describeChar(bad)} can't be encoded reliably. Code 128 supports standard English letters, digits, spaces and common symbols.`);
      if (input.length > 80) return fail("Keep Code 128 under 80 characters. Longer barcodes become too wide to scan comfortably.");
      return { ok: true, encode: input, value: input, notes: [] };
    },
  },
  {
    id: "code39", name: "Code 39", bcid: "code39", group: "general", kind: "1d",
    summary: "Alphanumeric barcode with capital letters, digits and a few symbols.",
    placeholder: "PART-0042", instructions: "Capital letters A–Z, digits 0–9, spaces and - . $ / + % only.", example: "PART-0042",
    quietZone: 10, moduleMm: 0.33, heightMm: 15, textPlacement: true, decodable: true,
    validate: (input, opts) => {
      if (!input) return empty();
      if (/[a-z]/.test(input)) return fail("Code 39 only supports capital letters. Type them in capitals, or use Code 128 if you need lowercase.");
      const bad = firstInvalid(input, CODE39_SET);
      if (bad) return fail(`${describeChar(bad)} isn't allowed in Code 39. Use A–Z, 0–9, spaces and - . $ / + %.`);
      if (input.length > 50) return fail("Keep Code 39 under 50 characters. It's a wide format and long codes are hard to scan.");
      if (!opts.code39Check) return { ok: true, encode: input, value: input, notes: [] };
      const check = code39Mod43(input);
      return {
        ok: true, encode: input, value: input + check,
        bwip: { includecheck: true, includecheckintext: true },
        notes: [`Mod 43 check character "${check}" is added. Most scanners return it as part of the value (${input + check}) unless they're set to verify and remove it.`],
      };
    },
  },
  {
    id: "code93", name: "Code 93", bcid: "code93", group: "general", kind: "1d",
    summary: "More compact alternative to Code 39 with built-in check characters.",
    placeholder: "CODE-93", instructions: "Capital letters A–Z, digits 0–9, spaces and - . $ / + % only.", example: "CODE-93",
    quietZone: 10, moduleMm: 0.33, heightMm: 15, textPlacement: true, decodable: true,
    validate: (input) => {
      if (!input) return empty();
      if (/[a-z]/.test(input)) return fail("Code 93 on ScanHatch supports capital letters only. Use Code 128 if you need lowercase.");
      const bad = firstInvalid(input, CODE39_SET);
      if (bad) return fail(`${describeChar(bad)} isn't allowed in Code 93. Use A–Z, 0–9, spaces and - . $ / + %.`);
      if (input.length > 60) return fail("Keep Code 93 under 60 characters.");
      return { ok: true, encode: input, value: input, bwip: { includecheck: true }, notes: ["Code 93's two check characters are added automatically. Scanners check and remove them."] };
    },
  },
  {
    id: "ean13", name: "EAN-13", bcid: "ean13", group: "retail", kind: "1d",
    summary: "Common retail product barcode.",
    placeholder: "400638133393", instructions: "Enter 12 digits to calculate the check digit, or 13 digits to validate a complete code.", example: "400638133393",
    quietZone: 11, moduleMm: 0.33, heightMm: 22.85, textPlacement: false, decodable: true,
    validate: gs1Validator("EAN-13", 13),
  },
  {
    id: "ean8", name: "EAN-8", bcid: "ean8", group: "retail", kind: "1d",
    summary: "Short retail barcode for small packages.",
    placeholder: "9638507", instructions: "Enter 7 digits to calculate the check digit, or 8 digits to validate a complete code.", example: "9638507",
    quietZone: 7, moduleMm: 0.33, heightMm: 18.23, textPlacement: false, decodable: true,
    validate: gs1Validator("EAN-8", 8),
  },
  {
    id: "upca", name: "UPC-A", bcid: "upca", group: "retail", kind: "1d",
    summary: "Common retail barcode used in North America.",
    placeholder: "03600029145", instructions: "Enter 11 digits to calculate the check digit, or 12 digits to validate a complete code.", example: "03600029145",
    quietZone: 9, moduleMm: 0.33, heightMm: 22.85, textPlacement: false, decodable: true,
    validate: gs1Validator("UPC-A", 12),
  },
  {
    id: "upce", name: "UPC-E", bcid: "upce", group: "retail", kind: "1d",
    summary: "Shortened UPC-A for small packages. Only works for numbers with enough zeros.",
    placeholder: "0425261", instructions: "Enter 7 digits (number system 0 or 1, then 6 digits) to calculate the check digit, or 8 digits to validate. You can also enter an 11- or 12-digit UPC-A to shorten it.", example: "0425261",
    quietZone: 9, moduleMm: 0.33, heightMm: 22.85, textPlacement: false, decodable: true,
    validate: (raw) => {
      const input = raw.replace(/[\s-]/g, "");
      if (!input) return empty();
      if (!/^\d+$/.test(input)) return fail("UPC-E can only contain digits (0–9).");
      let body: string;
      let given: number | null = null;
      const notes: string[] = [];
      if (input.length === 6) {
        return fail("Add the number system digit (0 or 1) at the start, making 7 digits. Most UPC-E codes start with 0.");
      } else if (input.length === 7 || input.length === 8) {
        if (!"01".includes(input[0])) return fail(`UPC-E must start with number system 0 or 1, not ${input[0]}.`);
        body = input.slice(0, 7);
        if (input.length === 8) given = Number(input[7]);
      } else if (input.length === 11 || input.length === 12) {
        const aBody = input.slice(0, 11);
        if (input.length === 12 && gs1CheckDigit(aBody) !== Number(input[11])) {
          return fail(`Invalid check digit in that UPC-A. The last digit should be ${gs1CheckDigit(aBody)}, not ${input[11]}.`);
        }
        const e = upcABodyToUpcE(aBody);
        if (!e) return fail("This UPC-A number can't be shortened to UPC-E. It doesn't have the zeros in the positions UPC-E needs. Use UPC-A instead.");
        body = e;
        notes.push(`UPC-A ${aBody}${gs1CheckDigit(aBody)} was shortened to UPC-E.`);
      } else {
        return fail(`UPC-E needs 7 digits (check digit calculated), 8 digits (check digit validated), or an 11–12 digit UPC-A to shorten. You entered ${input.length}.`);
      }
      const digit = upcECheckDigit(body)!;
      if (given !== null && given !== digit) {
        return fail(`Invalid check digit. The last digit should be ${digit}, not ${given}. UPC-E check digits are calculated from the expanded UPC-A number.`);
      }
      const full = body + digit;
      if (given === null) notes.push(`Check digit ${digit} was calculated and added. Complete UPC-E: ${full}`);
      else notes.push("Check digit is valid.");
      return { ok: true, encode: full, value: full, notes, checkDigit: { digit, calculated: given === null } };
    },
  },
  {
    id: "itf", name: "ITF (Interleaved 2 of 5)", bcid: "interleaved2of5", group: "logistics", kind: "1d",
    summary: "Numeric barcode that encodes digits in pairs. Common on cartons.",
    placeholder: "12345678", instructions: "Digits only, and an even number of them (ITF encodes digits in pairs).", example: "12345678",
    quietZone: 10, moduleMm: 0.5, heightMm: 15, textPlacement: true, decodable: true,
    validate: (raw) => {
      const input = raw.replace(/\s/g, "");
      if (!input) return empty();
      if (!/^\d+$/.test(input)) return fail("ITF can only contain digits (0–9).");
      if (input.length % 2 !== 0) return fail(`ITF encodes digits in pairs, so it needs an even number of digits. You entered ${input.length}. If your system allows it, add a leading zero.`);
      if (input.length > 60) return fail("Keep ITF under 60 digits.");
      return { ok: true, encode: input, value: input, notes: [] };
    },
  },
  {
    id: "itf14", name: "ITF-14", bcid: "itf14", group: "logistics", kind: "1d",
    summary: "Used for identifying trade/shipping units such as outer cartons.",
    placeholder: "1540014128876", instructions: "ITF-14 is numeric only. Enter 13 digits to calculate the check digit, or 14 digits to validate a complete code.", example: "1540014128876",
    quietZone: 10, moduleMm: 0.5, heightMm: 32, textPlacement: false, decodable: true,
    validate: gs1Validator("ITF-14", 14),
  },
  {
    id: "codabar", name: "Codabar", bcid: "rationalizedCodabar", group: "specialist", kind: "1d",
    summary: "Digits and a few symbols, framed by start/stop letters. Used by libraries and older systems.",
    placeholder: "40156", instructions: "Digits 0–9 and - $ : / . + only. Choose the start and stop letters below.", example: "40156",
    quietZone: 10, moduleMm: 0.33, heightMm: 15, textPlacement: true, decodable: true,
    validate: (input, opts) => {
      if (!input) return empty();
      if (/[A-Da-d]/.test(input)) return fail("Don't type the start/stop letters in the data. Choose them with the Start and Stop options below.");
      const bad = firstInvalid(input, /[0-9\-$:/.+]/);
      if (bad) return fail(`${describeChar(bad)} isn't allowed in Codabar. Use digits 0–9 and - $ : / . +.`);
      if (input.length > 40) return fail("Keep Codabar under 40 characters.");
      const full = opts.codabarStart + input + opts.codabarStop;
      return { ok: true, encode: full, value: full, notes: [`Encoded with start ${opts.codabarStart} and stop ${opts.codabarStop}: ${full}`] };
    },
  },
  {
    id: "msi", name: "MSI (Modified Plessey)", bcid: "msi", group: "specialist", kind: "1d",
    summary: "Numeric barcode mainly used for shelf labels and warehouse bins.",
    placeholder: "1234567", instructions: "Digits only. Pick the check digit type your scanner or system expects.", example: "1234567",
    quietZone: 12, moduleMm: 0.33, heightMm: 15, textPlacement: true, decodable: false,
    validate: (raw, opts) => {
      const input = raw.replace(/\s/g, "");
      if (!input) return empty();
      if (!/^\d+$/.test(input)) return fail("MSI can only contain digits (0–9).");
      if (input.length > 30) return fail("Keep MSI under 30 digits.");
      const label: Record<MsiCheck, string> = { none: "", mod10: "Mod 10", mod1010: "two Mod 10", mod11: "Mod 11", mod1110: "Mod 11 + Mod 10" };
      return {
        ok: true, encode: input, value: input,
        bwip: opts.msiCheck === "none" ? {} : { includecheck: true, checktype: opts.msiCheck, includecheckintext: true },
        notes: opts.msiCheck === "none" ? ["No check digit. Errors in scanning won't be detected."] : [`${label[opts.msiCheck]} check digit${opts.msiCheck === "mod1010" || opts.msiCheck === "mod1110" ? "s are" : " is"} added after your digits.`],
      };
    },
  },
  {
    id: "pharmacode", name: "Pharmacode", bcid: "pharmacode", group: "specialist", kind: "1d",
    summary: "Packaging-control code used on pharmaceutical cartons and leaflets. Stores a single number.",
    placeholder: "1234", instructions: "A whole number from 3 to 131070. Pharmacode stores the number only, with no text or check digit.", example: "1234",
    quietZone: 6, moduleMm: 0.5, heightMm: 8, textPlacement: true, decodable: false,
    validate: (raw) => {
      const input = raw.trim();
      if (!input) return empty();
      if (!/^\d+$/.test(input)) return fail("Pharmacode is a whole number: digits only, no decimals or letters.");
      const n = Number(input);
      if (n < 3 || n > 131070) return fail(`Pharmacode values must be between 3 and 131070. ${n} is out of range.`);
      return { ok: true, encode: String(n), value: String(n), notes: input !== String(n) ? ["Leading zeros aren't part of a Pharmacode value and were ignored."] : [] };
    },
  },
  {
    id: "datamatrix", name: "Data Matrix", bcid: "datamatrix", group: "2d", kind: "2d",
    summary: "Small square 2D code for marking parts, electronics and healthcare products.",
    placeholder: "SN: 000123", instructions: "Enter the text to encode.", example: "SN:000123",
    quietZone: 1, unitsPerModule: 2, textPlacement: false, decodable: true,
    validate: text2d("Data Matrix", 1500),
  },
  {
    id: "pdf417", name: "PDF417", bcid: "pdf417", group: "2d", kind: "2d",
    summary: "Stacked 2D code that holds a lot of text. Used on ID cards and boarding passes.",
    placeholder: "Name: A. Smith", instructions: "Enter the text to encode. Line breaks are allowed.", example: "PDF417 test",
    quietZone: 2, unitsPerModule: 1, textPlacement: false, decodable: true,
    validate: text2d("PDF417", 1500),
  },
  {
    id: "aztec", name: "Aztec", bcid: "azteccode", group: "2d", kind: "2d",
    summary: "Square 2D code that doesn't need a quiet zone. Used on transport tickets.",
    placeholder: "TICKET-7731", instructions: "Enter the text to encode.", example: "TICKET-7731",
    quietZone: 0, unitsPerModule: 2, textPlacement: false, decodable: true,
    validate: text2d("Aztec", 1500),
  },
];

export const barcodeFormat = (id: string) => BARCODE_FORMATS.find((f) => f.id === id);
export const isBarcodeFormatId = (id: string): id is BarcodeFormatId => BARCODE_FORMATS.some((f) => f.id === id);
