/**
 * Barcode value validation. Unlike the generator (which completes values for you),
 * this checks a value exactly as given and explains every rule it applies.
 * Only rules that the format actually defines are checked.
 */
import { gs1CheckDigitSteps, upcEToUpcABody, type CheckDigitSteps } from "@/lib/barcode/checkdigit";
import { code39Mod43, type MsiCheck } from "@/lib/barcode/formats";
import { MSI_CHECK_LABELS, msiCheckDigits } from "@/lib/barcode/msi";

export type ValidatorFormatId =
  | "ean13" | "ean8" | "upca" | "upce" | "itf14" | "itf"
  | "code128" | "code39" | "code93" | "codabar" | "msi" | "pharmacode";

export interface ValidatorFormat {
  id: ValidatorFormatId;
  name: string;
  placeholder: string;
  hint: string;
  /** Numeric formats ignore spaces/hyphens people copy from printed numbers. */
  numeric: boolean;
}

export const VALIDATOR_FORMATS: ValidatorFormat[] = [
  { id: "ean13", name: "EAN-13", placeholder: "4006381333931", hint: "13 digits, including the check digit.", numeric: true },
  { id: "ean8", name: "EAN-8", placeholder: "96385074", hint: "8 digits, including the check digit.", numeric: true },
  { id: "upca", name: "UPC-A", placeholder: "036000291452", hint: "12 digits, including the check digit.", numeric: true },
  { id: "upce", name: "UPC-E", placeholder: "04252614", hint: "8 digits: number system (0 or 1), 6 digits and a check digit.", numeric: true },
  { id: "itf14", name: "ITF-14", placeholder: "15400141288763", hint: "14 digits, including the check digit.", numeric: true },
  { id: "itf", name: "ITF (Interleaved 2 of 5)", placeholder: "12345678", hint: "An even number of digits.", numeric: true },
  { id: "code128", name: "Code 128", placeholder: "ABC-12345", hint: "The text or data the barcode contains.", numeric: false },
  { id: "code39", name: "Code 39", placeholder: "PART-0042", hint: "Capital letters, digits, spaces and - . $ / + %.", numeric: false },
  { id: "code93", name: "Code 93", placeholder: "CODE-93", hint: "Capital letters, digits, spaces and - . $ / + %.", numeric: false },
  { id: "codabar", name: "Codabar", placeholder: "A40156B", hint: "Digits and - $ : / . +, usually with start/stop letters A–D.", numeric: false },
  { id: "msi", name: "MSI (Modified Plessey)", placeholder: "12345674", hint: "Digits, including any check digits.", numeric: true },
  { id: "pharmacode", name: "Pharmacode", placeholder: "1234", hint: "A whole number from 3 to 131070.", numeric: true },
];

export const validatorFormat = (id: string) => VALIDATOR_FORMATS.find((f) => f.id === id);

export type CheckStatus = "pass" | "fail" | "skip" | "info";
export interface Check {
  status: CheckStatus;
  label: string;
  detail?: string;
}
export interface Fact {
  label: string;
  value: string;
}
export interface BarcodeValidation {
  valid: boolean;
  /** One-line reason(s) for an invalid result. */
  problems: string[];
  checks: Check[];
  facts: Fact[];
  notes: string[];
  steps?: CheckDigitSteps;
  /** The value that was checked (after ignoring spaces/hyphens for numeric formats). */
  checked: string;
}

export interface ValidatorOptions {
  code39HasCheck: boolean;
  msiCheck: MsiCheck;
}
export const DEFAULT_VALIDATOR_OPTIONS: ValidatorOptions = { code39HasCheck: false, msiCheck: "mod10" };

const pass = (label: string, detail?: string): Check => ({ status: "pass", label, detail });
const failC = (label: string, detail: string): Check => ({ status: "fail", label, detail });
const skip = (label: string, detail = "Not checked until the problems above are fixed."): Check => ({ status: "skip", label, detail });
const info = (label: string, detail?: string): Check => ({ status: "info", label, detail });

const describe = (ch: string) => (ch === " " ? "space" : ch === "\t" ? "tab" : ch === "\n" ? "line break" : `"${ch}"`);
function badChars(value: string, allowed: RegExp) {
  const bad = [...new Set([...value].filter((c) => !allowed.test(c)))];
  return bad.slice(0, 6).map(describe).join(", ") + (bad.length > 6 ? "…" : "");
}

function finish(checked: string, checks: Check[], facts: Fact[] = [], notes: string[] = [], steps?: CheckDigitSteps): BarcodeValidation {
  const problems = checks.filter((c) => c.status === "fail").map((c) => c.detail ?? c.label);
  return { valid: problems.length === 0, problems, checks, facts, notes, steps, checked };
}

// ---------- GS1 (EAN / UPC / ITF-14) ----------

function gs1Facts(id: ValidatorFormatId, v: string): Fact[] {
  const facts: Fact[] = [];
  if (id === "ean13") {
    if (v.startsWith("0")) facts.push({ label: "UPC-A", value: `Starts with 0, so this is the UPC-A number ${v.slice(1)} written as EAN-13.` });
    if (/^97[89]/.test(v)) facts.push({ label: "Book number", value: v.startsWith("9790") ? "Prefix 979-0 is used for ISMN (printed music)." : "Prefix 978/979 is the \"Bookland\" range: this is an ISBN." });
    else if (v.startsWith("977")) facts.push({ label: "Periodical", value: "Prefix 977 is used for ISSN numbers (magazines and other periodicals)." });
    else if (/^2/.test(v) || /^0[24]/.test(v)) facts.push({ label: "Restricted use", value: "This prefix is reserved for restricted circulation numbers (for example variable-weight or in-store items). It's only meaningful inside the company that assigned it." });
    else if (!v.startsWith("0")) facts.push({ label: "GS1 prefix", value: `${v.slice(0, 3)}: shows which GS1 member organisation issued the company prefix. It doesn't tell you where the product was made.` });
  }
  if (id === "upca") {
    const ns: Record<string, string> = {
      "2": "Number system 2: variable-measure or in-store items (restricted circulation).",
      "3": "Number system 3: used for drugs and health products in the US (often built from an NDC).",
      "4": "Number system 4: reserved for in-store use (restricted circulation).",
      "5": "Number system 5: traditionally used for coupons.",
    };
    if (ns[v[0]]) facts.push({ label: "Number system", value: ns[v[0]] });
    facts.push({ label: "GTIN-13 form", value: `0${v}` });
  }
  if (id === "ean8" && /^[02]/.test(v)) {
    facts.push({ label: "Restricted use", value: "EAN-8 numbers starting with 0 or 2 are restricted circulation numbers, used only inside a company." });
  }
  if (id === "itf14") {
    const d = v[0];
    facts.push({
      label: "Indicator digit",
      value: d === "0" ? "0: the carton uses the same number as the item inside (a GTIN-13 or GTIN-12 padded to 14 digits)."
        : d === "9" ? "9: a variable-measure trade item (contents vary in quantity or weight)."
        : `${d}: a packaging-level indicator (1–8), used to give different pack sizes of the same product their own numbers.`,
    });
  }
  return facts;
}

function validateGs1(id: ValidatorFormatId, name: string, len: number, v: string, notes: string[]): BarcodeValidation {
  const checks: Check[] = [];
  const digits = /^\d+$/.test(v);
  checks.push(digits ? pass("Only digits (0–9)") : failC("Only digits (0–9)", `${name} can only contain digits. Found ${badChars(v, /\d/)}.`));
  const lenOk = v.length === len;
  checks.push(lenOk ? pass(`Correct length (${len} digits)`) : failC(`Correct length (${len} digits)`, `${name} requires ${len} digits. You entered ${v.length}.`));
  if (digits && v.length === len - 1) {
    const c = gs1CheckDigitSteps(v).check;
    notes.push(`If ${v} is the number without its check digit, the check digit would be ${c}, making ${v}${c}.`);
  }
  let steps: CheckDigitSteps | undefined;
  if (digits && lenOk) {
    steps = gs1CheckDigitSteps(v.slice(0, -1));
    const given = Number(v.at(-1));
    checks.push(steps.check === given
      ? pass("Check digit valid", `The last digit (${given}) matches the calculated check digit.`)
      : failC("Check digit valid", `The final digit is an invalid check digit: expected ${steps.check}, found ${given}.`));
  } else checks.push(skip("Check digit valid"));
  const facts = digits && lenOk && checks.every((c) => c.status !== "fail") ? gs1Facts(id, v) : [];
  return finish(v, checks, facts, notes, steps);
}

function validateUpcE(v: string, notes: string[]): BarcodeValidation {
  const checks: Check[] = [];
  const digits = /^\d+$/.test(v);
  checks.push(digits ? pass("Only digits (0–9)") : failC("Only digits (0–9)", `UPC-E can only contain digits. Found ${badChars(v, /\d/)}.`));
  const lenOk = v.length === 8;
  checks.push(lenOk ? pass("Correct length (8 digits)") : failC("Correct length (8 digits)", `UPC-E must contain 8 digits. You entered ${v.length}.`));
  if (digits && (v.length === 11 || v.length === 12)) notes.push("That looks like a UPC-A number. Use the UPC-E ↔ UPC-A converter to see whether it can be shortened.");
  if (digits && v.length === 7) notes.push(`If ${v} is missing its check digit, it would be ${gs1CheckDigitSteps(upcEToUpcABody(v) ?? "0").check} (if the number system is valid).`);
  let steps: CheckDigitSteps | undefined;
  const facts: Fact[] = [];
  if (digits && lenOk) {
    const nsOk = v[0] === "0" || v[0] === "1";
    checks.push(nsOk ? pass("Number system is 0 or 1") : failC("Number system is 0 or 1", `UPC-E must start with number system 0 or 1, not ${v[0]}.`));
    if (nsOk) {
      const a = upcEToUpcABody(v.slice(0, 7))!;
      steps = gs1CheckDigitSteps(a);
      const given = Number(v[7]);
      checks.push(steps.check === given
        ? pass("Check digit valid", `Calculated from the expanded UPC-A (${a}${steps.check}), the check digit is ${steps.check}.`)
        : failC("Check digit valid", `The final digit is an invalid check digit: expected ${steps.check}, found ${given}. UPC-E check digits are calculated from the expanded UPC-A number.`));
      facts.push({ label: "Expands to UPC-A", value: `${a}${steps.check}` });
    } else checks.push(skip("Check digit valid"));
  } else checks.push(skip("Number system is 0 or 1"), skip("Check digit valid"));
  return finish(v, checks, checks.some((c) => c.status === "fail") ? [] : facts, notes, steps);
}

// ---------- Other formats ----------

export function validateBarcode(id: ValidatorFormatId, raw: string, opts: ValidatorOptions = DEFAULT_VALIDATOR_OPTIONS): BarcodeValidation | null {
  const fmt = validatorFormat(id)!;
  const notes: string[] = [];
  let v = raw;
  if (fmt.numeric) {
    v = raw.replace(/[\s-]/g, "");
    if (v !== raw.trim() && v) notes.push("Spaces and hyphens were ignored.");
  }
  if (!v) return null;

  switch (id) {
    case "ean13": return validateGs1(id, "EAN-13", 13, v, notes);
    case "ean8": return validateGs1(id, "EAN-8", 8, v, notes);
    case "upca": return validateGs1(id, "UPC-A", 12, v, notes);
    case "itf14": return validateGs1(id, "ITF-14", 14, v, notes);
    case "upce": return validateUpcE(v, notes);

    case "itf": {
      const digits = /^\d+$/.test(v);
      const checks = [
        digits ? pass("Only digits (0–9)") : failC("Only digits (0–9)", `ITF can only contain digits. Found ${badChars(v, /\d/)}.`),
        v.length % 2 === 0 ? pass("Even number of digits", `${v.length} digits, encoded as ${v.length / 2} pairs.`) : failC("Even number of digits", `ITF encodes digits in pairs, so it needs an even number of digits. This has ${v.length}.`),
        info("No check digit", "Plain ITF has no built-in check digit, so a mistyped digit can't be detected from the value alone."),
      ];
      if (digits && v.length < 6) checks.push(info("Short code", "Many scanners ignore ITF shorter than 6 digits to avoid misreads."));
      return finish(v, checks, [], notes);
    }

    case "code128": {
      const ascii = /^[\x00-\x7F]+$/.test(v);
      const checks: Check[] = [
        ascii ? pass("Characters can be encoded", "All characters are standard ASCII, which Code 128 encodes directly.")
          : failC("Characters can be encoded", `Code 128 contains unsupported characters: ${badChars(v, /[\x00-\x7F]/)}. Code 128 encodes standard ASCII; accented letters and symbols need an extended mode most scanners don't support.`),
      ];
      if (ascii && /[\x00-\x1F\x7F]/.test(v)) checks.push(info("Control characters", "Contains control characters such as tabs. They're valid in Code 128, but ScanHatch's generator only accepts printable characters."));
      checks.push(info("Check character", "Code 128's check character is part of the printed bars and never appears in the text, so there's nothing to verify from the value."));
      return finish(v, checks, [{ label: "Length", value: `${v.length} characters` }], notes);
    }

    case "code39": {
      const star = v.startsWith("*") && v.endsWith("*") && v.length > 2;
      const body = star ? v.slice(1, -1) : v;
      if (star) notes.push("The * start/stop characters were ignored. They're part of the printed symbol, not the data.");
      const okChars = /^[0-9A-Z \-.$/+%]+$/.test(body);
      const checks: Check[] = [
        okChars ? pass("Allowed characters", "Capital letters, digits, spaces and - . $ / + %.")
          : failC("Allowed characters", `Code 39 contains unsupported characters: ${badChars(body, /[0-9A-Z \-.$/+%]/)}.${/[a-z]/.test(body) ? " Standard Code 39 has no lowercase letters." : ""}${body.includes("*") ? " * is reserved for start/stop." : ""}`),
      ];
      if (opts.code39HasCheck) {
        if (okChars && body.length >= 2) {
          const exp = code39Mod43(body.slice(0, -1));
          checks.push(exp === body.at(-1) ? pass("Mod 43 check character valid", `The last character "${exp}" matches.`)
            : failC("Mod 43 check character valid", `The final character is an invalid check character: expected "${exp}", found "${body.at(-1)}".`));
        } else checks.push(okChars ? failC("Mod 43 check character valid", "There must be at least one data character before the check character.") : skip("Mod 43 check character valid"));
      } else checks.push(info("Check character", "Code 39's mod 43 check character is optional. Turn on the option above if this value should end with one."));
      return finish(body, checks, [], notes);
    }

    case "code93": {
      const okChars = /^[0-9A-Z \-.$/+%]+$/.test(v);
      return finish(v, [
        okChars ? pass("Allowed characters", "Capital letters, digits, spaces and - . $ / + %.")
          : failC("Allowed characters", `Code 93 contains unsupported characters: ${badChars(v, /[0-9A-Z \-.$/+%]/)}.`),
        info("Check characters", "Code 93's two check characters are part of the printed bars and are removed by scanners, so they can't be checked from the text value."),
      ], [], notes);
    }

    case "codabar": {
      const guards = /[A-D]/i;
      const startG = guards.test(v[0]);
      const endG = v.length > 1 && guards.test(v.at(-1)!);
      const checks: Check[] = [];
      let data = v;
      if (startG || endG) {
        if (startG && endG) {
          checks.push(pass("Start and stop characters", `Start ${v[0].toUpperCase()}, stop ${v.at(-1)!.toUpperCase()}.`));
          data = v.slice(1, -1);
        } else checks.push(failC("Start and stop characters", "Codabar needs both a start and a stop letter (A–D), or neither. Only one was found."));
      } else checks.push(info("Start and stop characters", "None included. They're added when the barcode is created (for example A…A)."));
      if (startG && endG && !data) checks.push(failC("Data present", "There's no data between the start and stop letters."));
      else if (!(startG !== endG)) {
        const ok = /^[0-9\-$:/.+]+$/.test(data);
        checks.push(ok ? pass("Allowed characters", "Digits and - $ : / . +.")
          : failC("Allowed characters", `Codabar contains unsupported characters: ${badChars(data, /[0-9\-$:/.+]/)}. Letters are only allowed as the first and last character (A–D).`));
      }
      checks.push(info("Check digit", "Codabar has no mandatory check digit; some systems add their own."));
      return finish(v, checks, [], notes);
    }

    case "msi": {
      const digits = /^\d+$/.test(v);
      const scheme = opts.msiCheck;
      const k = scheme === "none" ? 0 : scheme === "mod1010" || scheme === "mod1110" ? 2 : 1;
      const checks: Check[] = [digits ? pass("Only digits (0–9)") : failC("Only digits (0–9)", `MSI can only contain digits. Found ${badChars(v, /\d/)}.`)];
      if (scheme === "none") checks.push(info("Check digit", "No check digit selected, so errors can't be detected from the value."));
      else if (!digits) checks.push(skip(`${MSI_CHECK_LABELS[scheme]} check`));
      else if (v.length <= k) checks.push(failC(`${MSI_CHECK_LABELS[scheme]} check`, `The value is too short to contain data and ${k === 1 ? "a check digit" : "two check digits"}.`));
      else {
        const data = v.slice(0, -k);
        const exp = msiCheckDigits(data, scheme);
        if (exp === null) checks.push(failC(`${MSI_CHECK_LABELS[scheme]} check`, `The data ${data} has no valid Mod 11 check digit (the calculation gives 10). This can't be a valid Mod 11 MSI code.`));
        else checks.push(exp === v.slice(-k)
          ? pass(`${MSI_CHECK_LABELS[scheme]} check`, `The last ${k === 1 ? "digit" : "two digits"} (${exp}) match the calculation for data ${data}.`)
          : failC(`${MSI_CHECK_LABELS[scheme]} check`, `The final ${k === 1 ? "digit is an invalid check digit" : "two digits are invalid check digits"}: expected ${exp}, found ${v.slice(-k)}.`));
      }
      return finish(v, checks, [], notes);
    }

    case "pharmacode": {
      const digits = /^\d+$/.test(v);
      const n = Number(v);
      const checks: Check[] = [
        digits ? pass("Whole number", "Digits only.") : failC("Whole number", `Pharmacode is a whole number. Found ${badChars(v, /\d/)}.`),
        !digits ? skip("In range (3–131070)") : n >= 3 && n <= 131070 ? pass("In range (3–131070)") : failC("In range (3–131070)", `Pharmacode values must be between 3 and 131070. ${n} is out of range.`),
        info("Check digit", "Pharmacode has no check digit. The packaging-line reader verifies the value it expects."),
      ];
      if (digits && /^0\d/.test(v)) notes.push(`Leading zeros aren't part of a Pharmacode value; this is ${n}.`);
      const facts = digits && n >= 3 && n <= 131070 ? [{ label: "Bars", value: `${Math.floor(Math.log2(n + 1))} bars` }] : [];
      return finish(v, checks, facts, notes);
    }
  }
}
