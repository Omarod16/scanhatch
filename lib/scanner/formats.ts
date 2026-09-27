import type { ReadInputBarcodeFormat } from "zxing-wasm/reader";
import { upcABodyToUpcE } from "@/lib/barcode/checkdigit";

export type ScanMode = "qr" | "barcode" | "all";

export const QR_FORMATS: ReadInputBarcodeFormat[] = ["QRCode", "MicroQRCode", "RMQRCode"];
export const NON_QR_FORMATS: ReadInputBarcodeFormat[] = [
  "Code128", "Code39", "Code93", "Codabar", "ITF", "EAN13", "EAN8", "UPCA", "UPCE",
  "DataBar", "DataBarExpanded", "DataBarLimited", "DataMatrix", "PDF417", "Aztec",
];

export const formatsFor = (mode: ScanMode): ReadInputBarcodeFormat[] =>
  mode === "qr" ? QR_FORMATS : mode === "barcode" ? NON_QR_FORMATS : [...QR_FORMATS, ...NON_QR_FORMATS];

/** Human-readable list for page copy. */
export const READABLE_FORMAT_NAMES = {
  qr: ["QR Code", "Micro QR", "rMQR"],
  barcode: [
    "Code 128", "Code 39", "Code 93", "Codabar", "ITF / ITF-14", "EAN-13", "EAN-8", "UPC-A", "UPC-E",
    "GS1 DataBar", "Data Matrix", "PDF417", "Aztec",
  ],
};

const LABELS: Record<string, string> = {
  QRCode: "QR Code", MicroQRCode: "Micro QR", RMQRCode: "rMQR", Code128: "Code 128", Code39: "Code 39",
  Code93: "Code 93", Codabar: "Codabar", ITF: "ITF", ITF14: "ITF-14", EAN13: "EAN-13", EAN8: "EAN-8",
  UPCA: "UPC-A", UPCE: "UPC-E", DataBar: "GS1 DataBar", DataBarExpanded: "GS1 DataBar Expanded",
  DataBarLimited: "GS1 DataBar Limited", DataMatrix: "Data Matrix", PDF417: "PDF417", Aztec: "Aztec",
};

export const isQrFormat = (f: string) => ["QRCode", "MicroQRCode", "RMQRCode"].includes(f);

export interface NormalisedResult {
  format: string;
  formatLabel: string;
  /** The value as printed/encoded, in its conventional form. */
  value: string;
  /** Extra facts worth showing (e.g. the GTIN-13 form of a UPC). */
  notes: string[];
}

/**
 * ZXing reports every EAN/UPC as a 13-digit GTIN. Convert back to the form
 * people expect (12-digit UPC-A, 8-digit UPC-E) and keep the GTIN as a note.
 */
export function normaliseResult(format: string, text: string): NormalisedResult {
  const formatLabel = LABELS[format] ?? format;
  const notes: string[] = [];
  let value = text;
  if (format === "UPCA" && /^0\d{12}$/.test(text)) {
    value = text.slice(1);
    notes.push(`GTIN-13 form: ${text}`);
  } else if (format === "UPCE" && /^0[01]\d{11}$/.test(text)) {
    const upcA = text.slice(1);
    const e = upcABodyToUpcE(upcA.slice(0, 11));
    if (e) {
      value = e + upcA[11];
      notes.push(`Expands to UPC-A ${upcA}`);
    }
  } else if (format === "EAN13" && /^0\d{12}$/.test(text)) {
    notes.push(`Starts with 0, so this is also the UPC-A number ${text.slice(1)}`);
  } else if (format === "ITF" && /^\d{14}$/.test(text)) {
    notes.push("14 digits: this may be an ITF-14 carton code (GTIN-14).");
  }
  return { format, formatLabel, value, notes };
}

/** "a" or "an" for a format label, by how it's spoken (an EAN-13, a UPC-A, an ITF). */
export const withArticle = (label: string) => `${/^(EAN|ITF|Aztec|MSI|rMQR|RSS)/.test(label) ? "an" : "a"} ${label}`;
