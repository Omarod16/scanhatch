/**
 * Single source of truth for every tool on ScanHatch.
 *
 * `status: "live"` tools are linked from the header, footer and sitemap.
 * `status: "soon"` tools are shown only where they are clearly labelled
 * "Coming soon" and are never rendered as links. Flip a tool to "live"
 * once its page exists and works.
 */

export type ToolCategory = "qr" | "barcode" | "format" | "scanner" | "utility";
export type ToolStatus = "live" | "soon";

export interface Tool {
  id: string;
  name: string;
  /** One plain sentence describing what the tool does. */
  summary: string;
  href: string;
  category: ToolCategory;
  status: ToolStatus;
  /** Include in sitemap.xml (only real, standalone pages). */
  indexable?: boolean;
}

export const TOOLS: Tool[] = [
  // QR tools
  { id: "qr-generator", name: "QR Code Generator", summary: "Create styled QR codes for links, WiFi, contacts, events and more.", href: "/qr-code-generator/", category: "qr", status: "live", indexable: true },
  { id: "qr-url", name: "URL QR Generator", summary: "Turn any web address into a QR code.", href: "/url-qr-code-generator/", category: "qr", status: "live", indexable: true },
  { id: "qr-wifi", name: "WiFi QR Generator", summary: "Let guests join your network without typing the password.", href: "/wifi-qr-code-generator/", category: "qr", status: "live", indexable: true },
  { id: "qr-email", name: "Email QR Generator", summary: "Open a pre-filled email with address, subject and message.", href: "/email-qr-code-generator/", category: "qr", status: "live", indexable: true },
  { id: "qr-phone", name: "Phone QR Generator", summary: "Start a phone call with one scan.", href: "/phone-qr-code-generator/", category: "qr", status: "live", indexable: true },
  { id: "qr-sms", name: "SMS QR Generator", summary: "Open a text message with the number and message filled in.", href: "/sms-qr-code-generator/", category: "qr", status: "live", indexable: true },
  { id: "qr-whatsapp", name: "WhatsApp QR Generator", summary: "Open a WhatsApp chat with an optional starter message.", href: "/whatsapp-qr-code-generator/", category: "qr", status: "live", indexable: true },
  { id: "qr-vcard", name: "vCard QR Generator", summary: "Share a full contact card that saves straight to a phone.", href: "/vcard-qr-code-generator/", category: "qr", status: "live", indexable: true },
  { id: "qr-contact", name: "Contact QR Generator", summary: "A compact contact code for business cards and badges.", href: "/qr-code-generator/#contact", category: "qr", status: "live" },
  { id: "qr-maps", name: "Google Maps QR Generator", summary: "Open a place or coordinates in Google Maps.", href: "/google-maps-qr-code-generator/", category: "qr", status: "live", indexable: true },
  { id: "qr-event", name: "Event QR Generator", summary: "Add an event with time and location to a calendar.", href: "/qr-code-generator/#event", category: "qr", status: "live" },
  { id: "qr-scanner", name: "QR Scanner", summary: "Scan QR codes with your camera.", href: "/qr-scanner/", category: "scanner", status: "live", indexable: true },
  { id: "qr-decoder", name: "QR Decoder", summary: "Read a QR code from an image file.", href: "/qr-decoder/", category: "qr", status: "live", indexable: true },
  { id: "qr-validator", name: "QR Validator", summary: "Check that a QR image decodes and see what it contains.", href: "/qr-validator/", category: "qr", status: "live", indexable: true },
  { id: "qr-size", name: "QR Size Calculator", summary: "Work out how big to print a QR code for a scanning distance.", href: "/qr-size-calculator/", category: "utility", status: "soon" },

  // Barcode tools
  { id: "barcode-generator", name: "Barcode Generator", summary: "Create EAN-13, UPC, Code 128, ITF-14, Data Matrix and other barcodes.", href: "/barcode-generator/", category: "barcode", status: "live", indexable: true },
  { id: "barcode-scanner", name: "Barcode Scanner", summary: "Scan 1D and 2D barcodes with your camera.", href: "/barcode-scanner/", category: "scanner", status: "live", indexable: true },
  { id: "barcode-decoder", name: "Barcode Decoder", summary: "Read a barcode from an image file.", href: "/barcode-decoder/", category: "barcode", status: "live", indexable: true },
  { id: "barcode-validator", name: "Barcode Validator", summary: "Check a barcode number's structure and check digit.", href: "/barcode-validator/", category: "barcode", status: "live", indexable: true },
  { id: "check-digit", name: "Check Digit Calculator", summary: "Calculate EAN, UPC and ITF-14 check digits step by step.", href: "/check-digit-calculator/", category: "barcode", status: "live", indexable: true },
  { id: "ean-upc-validator", name: "EAN/UPC Validator", summary: "Validate EAN-13, EAN-8, UPC-A and UPC-E numbers and convert UPC-E.", href: "/ean-upc-validator/", category: "barcode", status: "live", indexable: true },
  { id: "itf-14-validator", name: "ITF-14 Validator", summary: "Check a GTIN-14 carton number or calculate its check digit.", href: "/itf-14-validator/", category: "barcode", status: "live", indexable: true },
  { id: "bc-ean13", name: "EAN-13 Barcode Generator", summary: "Retail product barcodes with check digit calculation.", href: "/ean-13-barcode-generator/", category: "format", status: "live", indexable: true },
  { id: "bc-ean8", name: "EAN-8 Barcode Generator", summary: "Short retail barcodes for small packages.", href: "/ean-8-barcode-generator/", category: "format", status: "live", indexable: true },
  { id: "bc-upca", name: "UPC-A Barcode Generator", summary: "12-digit retail barcodes for North America.", href: "/upc-a-barcode-generator/", category: "format", status: "live", indexable: true },
  { id: "bc-upce", name: "UPC-E Barcode Generator", summary: "Compact UPC barcodes for small packs.", href: "/upc-e-barcode-generator/", category: "format", status: "live", indexable: true },
  { id: "bc-code128", name: "Code 128 Barcode Generator", summary: "Compact text and number barcodes for labels.", href: "/code-128-barcode-generator/", category: "format", status: "live", indexable: true },
  { id: "bc-code39", name: "Code 39 Barcode Generator", summary: "Alphanumeric barcodes for industrial and legacy systems.", href: "/code-39-barcode-generator/", category: "format", status: "live", indexable: true },
  { id: "bc-code93", name: "Code 93 Barcode Generator", summary: "A denser Code 39 alternative with check characters.", href: "/code-93-barcode-generator/", category: "format", status: "live", indexable: true },
  { id: "bc-itf", name: "ITF Barcode Generator", summary: "Interleaved 2 of 5 numeric barcodes.", href: "/itf-barcode-generator/", category: "format", status: "live", indexable: true },
  { id: "bc-itf14", name: "ITF-14 Barcode Generator", summary: "GTIN-14 barcodes for shipping cartons.", href: "/itf-14-barcode-generator/", category: "format", status: "live", indexable: true },
  { id: "bc-codabar", name: "Codabar Barcode Generator", summary: "Library and legacy barcodes with A–D start/stop.", href: "/codabar-barcode-generator/", category: "format", status: "live", indexable: true },
  { id: "bc-datamatrix", name: "Data Matrix Generator", summary: "Small square 2D codes for parts and labels.", href: "/data-matrix-generator/", category: "format", status: "live", indexable: true },
  { id: "bc-pdf417", name: "PDF417 Generator", summary: "Stacked 2D barcodes that hold lots of text.", href: "/pdf417-generator/", category: "format", status: "live", indexable: true },
  { id: "bc-aztec", name: "Aztec Code Generator", summary: "2D codes with a bullseye, used on tickets.", href: "/aztec-generator/", category: "format", status: "live", indexable: true },

  // Scanners & utilities
  { id: "scanner", name: "Universal Scanner", summary: "Scan QR codes and barcodes from one screen.", href: "/scanner/", category: "scanner", status: "live", indexable: true },
  { id: "bulk-qr", name: "Bulk QR Generator", summary: "Generate many QR codes from a CSV file and download a ZIP.", href: "/bulk-qr-generator/", category: "utility", status: "live", indexable: true },
  { id: "bulk-barcode", name: "Bulk Barcode Generator", summary: "Generate many barcodes from a CSV file and download a ZIP.", href: "/bulk-barcode-generator/", category: "utility", status: "live", indexable: true },
];

export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  qr: "QR code tools",
  barcode: "Barcode tools",
  scanner: "Scanners",
  utility: "Utility tools",
  format: "Barcode formats",
};

export const toolsIn = (category: ToolCategory) =>
  TOOLS.filter((t) => t.category === category);

export const liveTools = () => TOOLS.filter((t) => t.status === "live");

export const toolById = (id: string) => {
  const tool = TOOLS.find((t) => t.id === id);
  if (!tool) throw new Error(`Unknown tool id: ${id}`);
  return tool;
};

/** Other site pages (non-tools). Same live/soon rule applies. */
export const PAGES = {
  tools: { name: "All tools", href: "/tools/", status: "live" as ToolStatus },
  blog: { name: "Blog", href: "/blog/", status: "live" as ToolStatus },
  about: { name: "About", href: "/about/", status: "soon" as ToolStatus },
  contact: { name: "Contact", href: "/contact/", status: "live" as ToolStatus },
  privacy: { name: "Privacy Policy", href: "/privacy-policy/", status: "live" as ToolStatus },
  terms: { name: "Terms", href: "/terms/", status: "live" as ToolStatus },
  cookies: { name: "Cookie Policy", href: "/cookie-policy/", status: "live" as ToolStatus },
};
