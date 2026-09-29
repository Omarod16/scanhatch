import type { BarcodeFormatId } from "./formats";

export interface FormatGuide {
  what: string;
  usedFor: string;
  data: string;
  mistakes: string[];
  printing: string;
  related: BarcodeFormatId[];
}

export const FORMAT_GUIDES: Record<BarcodeFormatId, FormatGuide> = {
  code128: {
    what: "Code 128 encodes all standard keyboard characters and packs digits two per symbol, which makes it one of the most compact linear barcodes. It always contains a hidden check character that scanners verify automatically.",
    usedFor: "Shipping labels, warehouse and inventory systems, asset tags, and anywhere you control both the label and the scanner. The GS1-128 variant carries structured supply-chain data (that variant isn't generated here).",
    data: "Letters (upper and lower case), digits, spaces and common punctuation. Long runs of digits produce a shorter barcode than letters do.",
    mistakes: [
      "Encoding very long text. Every character adds width; beyond about 20–30 characters handheld scanners struggle.",
      "Using it for retail products. Shops expect EAN-13 or UPC-A with a GS1-registered number, not Code 128.",
    ],
    printing: "A module width of 0.25–0.5 mm and a bar height of at least 15% of the barcode's length (and no less than about 6 mm) suit most handheld scanners. Keep at least 10 modules of blank space at each end.",
    related: ["code39", "code93", "datamatrix"],
  },
  code39: {
    what: "Code 39 is one of the oldest alphanumeric barcodes. Each character is made of nine elements, three of them wide. That makes it easy to print, but wide: it needs far more space per character than Code 128.",
    usedFor: "Industrial part marking, ID badges and legacy systems. The US Department of Defense (LOGMARS) and parts of the automotive industry have long used it.",
    data: "Capital letters A–Z, digits 0–9, space, and - . $ / + %. Lowercase needs \"Full ASCII\" mode, which many scanners must be configured for, so ScanHatch doesn't generate it.",
    mistakes: [
      "Typing lowercase letters. Standard Code 39 has none; use Code 128 instead.",
      "Turning on the optional mod 43 check character without setting up the scanner. The scanner will then return an extra character at the end.",
    ],
    printing: "Because the format is wide, keep data short. Its tolerance for print variation makes it a good fit for dot-matrix and thermal-transfer printers on basic equipment.",
    related: ["code93", "code128", "codabar"],
  },
  code93: {
    what: "Code 93 was designed to replace Code 39 with a denser encoding. It supports the same basic character set but produces a noticeably shorter barcode, and it always includes two check characters.",
    usedFor: "Logistics and electronics labelling, and some postal applications. It is less widely deployed than Code 128, so check that your scanners have it enabled.",
    data: "Capital letters, digits, space and - . $ / + %. The two check characters are calculated for you and are not part of the scanned value.",
    mistakes: [
      "Assuming every scanner reads it by default. Some ship with Code 93 disabled.",
      "Choosing it for new systems where Code 128 would be more widely supported.",
    ],
    printing: "Similar to Code 128: a module width around 0.33 mm, a quiet zone of 10 modules on each side, and a comfortable bar height.",
    related: ["code39", "code128"],
  },
  ean13: {
    what: "EAN-13 is the standard barcode on retail products outside North America. The 13 digits are a GTIN (Global Trade Item Number): a GS1 company prefix, an item reference and a final check digit.",
    usedFor: "Products sold in shops. Books use EAN-13 with ISBN numbers starting 978 or 979.",
    data: "Exactly 13 digits including the check digit. Enter 12 and ScanHatch calculates the 13th.",
    mistakes: [
      "Making up a number. Retailers only accept GTINs licensed from GS1 (or a legitimate reseller of GS1 numbers). A barcode generator can't register a number for you.",
      "Printing it too small or truncating the bars. Retailers may reject labels below 80% of nominal size.",
    ],
    printing: "Nominal size is a 0.33 mm module (about 37.3 × 25.9 mm including quiet zones); GS1 allows 80% to 200%. ScanHatch's download is somewhat larger at the same module width because it adds a full quiet zone on both sides and prints the digits outside the bars. Keep the light margins clear, especially the 11-module zone on the left.",
    related: ["upca", "ean8", "itf14"],
  },
  ean8: {
    what: "EAN-8 is a shortened retail barcode for packages too small for EAN-13. It holds a separate, scarcer type of GS1 number, not a shortened EAN-13.",
    usedFor: "Small retail items such as cosmetics, confectionery and pens, where an EAN-13 won't fit.",
    data: "Exactly 8 digits including the check digit. Enter 7 to have the check digit calculated.",
    mistakes: [
      "Chopping digits off an existing EAN-13. EAN-8 numbers are issued separately by GS1.",
      "Using EAN-8 when an EAN-13 would fit. GS1 only issues EAN-8 numbers when space is genuinely limited.",
    ],
    printing: "Same module-width rules as EAN-13 (0.264–0.66 mm). Nominal size is roughly 26.7 × 21.6 mm including quiet zones; ScanHatch's download is somewhat larger because it adds a quiet zone on both sides and prints the digits outside the bars.",
    related: ["ean13", "upce"],
  },
  upca: {
    what: "UPC-A is the 12-digit retail barcode used in the United States and Canada. It's identical in structure to an EAN-13 that starts with 0, which is why scanners often report it as a 13-digit number.",
    usedFor: "Retail products sold in North America. Scanners worldwide read it.",
    data: "Exactly 12 digits including the check digit. Enter 11 to have the check digit calculated.",
    mistakes: [
      "Expecting a scanner to return exactly 12 digits. Many report the 13-digit GTIN form with a leading 0; both refer to the same product.",
      "Using an unregistered number for products you plan to sell through retailers.",
    ],
    printing: "Nominal module width 0.33 mm, allowed 80–200%. Keep 9 modules of clear space on each side and avoid shortening the bars.",
    related: ["upce", "ean13"],
  },
  upce: {
    what: "UPC-E compresses a UPC-A number to 8 digits by removing zeros, producing a barcode about half the width. Only UPC-A numbers with zeros in specific positions can be compressed.",
    usedFor: "Small packages in North America, such as cans and single-serve items.",
    data: "Number system 0 or 1, six digits, and a check digit that's calculated from the expanded UPC-A number (not from the 8 digits directly). You can also enter a full UPC-A to see whether it can be shortened.",
    mistakes: [
      "Calculating the check digit from the 8 UPC-E digits. It must be calculated from the expanded 12-digit UPC-A.",
      "Trying to compress a number without the right zeros. Not every UPC-A has a UPC-E form.",
    ],
    printing: "Same module-width guidance as UPC-A. Scanners usually return the expanded UPC-A (or 13-digit GTIN), not the 8 printed digits.",
    related: ["upca", "ean8"],
  },
  itf: {
    what: "Interleaved 2 of 5 encodes digits in pairs: one digit in the bars and the next in the spaces between them. That makes it compact for numbers and forgiving of rough printing.",
    usedFor: "Warehouse and distribution labels, cartons and industrial applications where only numbers are needed.",
    data: "Digits only, and an even number of them. There's no built-in check, so a partial scan can be misread as a shorter valid number.",
    mistakes: [
      "Using very short codes. Scanners often refuse ITF shorter than 6 digits to avoid misreads; set a fixed length in the scanner if you can.",
      "Using it where letters might be needed later.",
    ],
    printing: "Bearer bars (a border above and below) help prevent partial reads on corrugated cardboard. The ITF-14 format adds them for you.",
    related: ["itf14", "code128"],
  },
  itf14: {
    what: "ITF-14 is Interleaved 2 of 5 carrying a 14-digit GTIN for a group of products, usually printed with a thick bearer border so it survives printing on corrugated board.",
    usedFor: "Outer cartons and cases in the supply chain, rather than individual items sold at a till.",
    data: "Exactly 14 digits including a GS1 check digit. The first digit is typically a packaging indicator (1–8), followed by the product's company prefix and item reference.",
    mistakes: [
      "Using the product's own EAN-13 number unchanged. A case of products usually needs its own GTIN-14 with a packaging indicator.",
      "Printing too small. ITF-14 is meant to be large, with a module width around 0.5–1 mm on cartons.",
    ],
    printing: "Print it large on cartons, with the full bearer border and a quiet zone of at least 10 modules. Scanning from a distance on a conveyor is normal.",
    related: ["itf", "ean13"],
  },
  codabar: {
    what: "Codabar is a simple, self-checking numeric format from the 1970s. Every code starts and ends with one of the letters A, B, C or D, which some systems use to identify the type of item.",
    usedFor: "Library books, and historically blood banks, courier airbills and photo labs. Many of those have since moved to Code 128.",
    data: "Digits 0–9 and - $ : / . +, framed by start and stop letters (A–D). Scanners usually return the start and stop letters too.",
    mistakes: [
      "Choosing start/stop letters your system doesn't expect. Check which ones your software uses.",
      "Choosing Codabar for a new system. Code 128 is more compact and more widely supported.",
    ],
    printing: "Tolerates low-resolution printing. Keep a quiet zone of about 10 modules and a comfortable bar height.",
    related: ["code39", "code128"],
  },
  msi: {
    what: "MSI (also called Modified Plessey) is a numeric-only barcode in which each digit is encoded as four binary bits. It usually carries one or two check digits calculated with mod 10 or mod 11.",
    usedFor: "Retail shelf-edge labels, warehouse bin locations and inventory systems, mostly in older installations.",
    data: "Digits only. Choose the check-digit method your scanner is configured for: mod 10 is the most common.",
    mistakes: [
      "Choosing a check-digit type that doesn't match the scanner's setting, so every scan is rejected.",
      "Expecting phone apps to read it. Many, including ScanHatch's scanner, don't support MSI.",
    ],
    printing: "MSI is relatively wide per digit. Keep data short and use a dedicated barcode scanner for reading.",
    related: ["code128", "itf"],
  },
  pharmacode: {
    what: "Pharmacode (Laetus) stores a single number as a pattern of thick and thin bars. It's a packaging-control code: machines on a packaging line check that the correct carton or leaflet is being used.",
    usedFor: "Pharmaceutical cartons, labels and patient leaflets on production lines. It doesn't identify products for retail.",
    data: "A whole number from 3 to 131070. There is no check digit and no human-readable text as standard.",
    mistakes: [
      "Using it as a product identifier. For that, pharmaceuticals use GTINs in EAN-13 or GS1 Data Matrix.",
      "Printing the code upside down relative to the reader's expectation. It can read as a different number.",
    ],
    printing: "Print in the position and orientation your packaging-line reader expects. General-purpose phone apps usually can't read Pharmacode.",
    related: ["code128", "datamatrix"],
  },
  datamatrix: {
    what: "Data Matrix is a square 2D code that can hold dozens to hundreds of characters in a tiny space, with strong error correction so it still reads when partly damaged.",
    usedFor: "Marking electronic components and industrial parts, and on healthcare products. Those often use GS1 Data Matrix, a structured variant that isn't generated here.",
    data: "Letters, digits, symbols and line breaks. More data makes a bigger symbol.",
    mistakes: [
      "Assuming a normal Data Matrix is a GS1 Data Matrix. Regulated healthcare uses need the GS1 format with specific data structure.",
      "Printing it too small for the camera or scanner that will read it.",
    ],
    printing: "Leave at least one module of blank space around the symbol. For phone scanning, 10–15 mm across or larger works well.",
    related: ["aztec", "pdf417"],
  },
  pdf417: {
    what: "PDF417 is a stacked barcode: many short rows of linear codewords, which a scanner reads as one symbol. It holds several hundred characters with error correction.",
    usedFor: "Driving licences and ID cards, airline boarding passes and shipping documents.",
    data: "Text including line breaks. Longer text adds rows and columns.",
    mistakes: [
      "Squeezing it too short. Rows need enough height for the scanner to track them.",
      "Cropping the start and stop patterns at the edges.",
    ],
    printing: "Give it a quiet zone of at least two modules and avoid very narrow modules; PDF417 needs a decent print resolution.",
    related: ["datamatrix", "aztec"],
  },
  aztec: {
    what: "Aztec code is a square 2D code with a bullseye in the centre. Because scanners find it from the middle, it doesn't need a blank margin around it.",
    usedFor: "Rail and airline tickets and mobile boarding passes, especially where the code is shown on a phone screen.",
    data: "Letters, digits, symbols and line breaks.",
    mistakes: [
      "Adding decoration over the central bullseye, which scanners use to locate the code.",
      "Choosing it where users will scan with generic apps. QR codes are more universally recognised.",
    ],
    printing: "No quiet zone is required, but a small margin doesn't hurt. Keep good contrast; screen brightness matters when shown on a phone.",
    related: ["datamatrix", "pdf417"],
  },
};
