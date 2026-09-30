import type { ArticleSource } from "./types";

/**
 * Primary sources for the technical claims in articles. Only pages that were checked and
 * directly support the article are listed. ScanHatch isn't affiliated with these organisations.
 */
const QR_ABOUT = { title: "What is a QR Code?", publisher: "DENSO WAVE (QRcode.com)", url: "https://www.qrcode.com/en/about/index.html" };
const QR_VERSIONS = { title: "Information capacity and versions of QR Code", publisher: "DENSO WAVE (QRcode.com)", url: "https://www.qrcode.com/en/about/version.html" };
const QR_ERROR = { title: "Error correction feature", publisher: "DENSO WAVE (QRcode.com)", url: "https://www.qrcode.com/en/about/error_correction.html" };
const QR_FAQ = { title: "QR Code FAQ", publisher: "DENSO WAVE (QRcode.com)", url: "https://www.qrcode.com/en/faq.html" };
const GS1_CHECK = { title: "How to calculate a check digit manually", publisher: "GS1", url: "https://www.gs1.org/services/how-calculate-check-digit-manually" };
const GS1_GENSPECS = { title: "GS1 General Specifications", publisher: "GS1", url: "https://ref.gs1.org/standards/genspecs/" };

/** Date the sources were added (a real content update). */
export const SOURCES_ADDED = "2026-09-30";

export const ARTICLE_SOURCES: Record<string, ArticleSource[]> = {
  "what-is-a-qr-code": [
    { ...QR_ABOUT, supports: "The QR code's origin at DENSO WAVE in 1994 and its main features." },
    { ...QR_VERSIONS, supports: "Versions 1 to 40, from 21 × 21 to 177 × 177 modules." },
    { ...QR_ERROR, supports: "Reed-Solomon error correction and the four levels." },
  ],
  "what-can-a-qr-code-contain": [
    { ...QR_VERSIONS, supports: "How capacity depends on the version, character type and error-correction level." },
  ],
  "qr-code-error-correction-explained": [
    { ...QR_ERROR, supports: "Reed-Solomon codes, the L, M, Q and H levels, and the trade-off with code size." },
    { ...QR_VERSIONS, supports: "How more data or error correction needs a larger version." },
  ],
  "qr-code-size-and-quiet-zone": [
    { ...QR_VERSIONS, supports: "Module counts per version (21 × 21 to 177 × 177)." },
  ],
  "qr-code-colours-contrast-and-logos": [
    { ...QR_ERROR, supports: "How error correction restores damaged or covered parts of a code." },
    { ...QR_FAQ, supports: "DENSO WAVE's caution about overlaying designs or illustrations on a code." },
  ],
  "what-is-a-barcode": [
    { ...GS1_GENSPECS, supports: "Which barcodes carry GTINs for retail (EAN/UPC) and distribution (ITF-14, GS1-128)." },
  ],
  "qr-code-vs-barcode": [
    { ...QR_ABOUT, supports: "QR code capacity and features." },
    { ...GS1_GENSPECS, supports: "The barcodes GS1 specifies for retail checkouts and distribution." },
  ],
  "barcode-check-digits-explained": [
    { ...GS1_CHECK, supports: "The GS1 check digit method (alternating weights of 3 and 1, then the next multiple of 10)." },
    { ...GS1_GENSPECS, supports: "The GTIN formats that use this check digit." },
  ],
  "ean-13-vs-upc-a": [
    { ...GS1_GENSPECS, supports: "UPC-A carrying a GTIN-12, EAN-13 carrying a GTIN-13, and UPC-E for GTIN-12s that can be compressed." },
    { ...GS1_CHECK, supports: "The shared check digit calculation." },
  ],
  "what-is-code-128": [
    { ...GS1_GENSPECS, supports: "GS1-128 and GS1 Application Identifiers." },
  ],
  "what-is-itf-14": [
    { ...GS1_GENSPECS, supports: "ITF-14 carrying a GTIN on outer cases, and GS1-128 for logistic units." },
    { ...GS1_CHECK, supports: "Calculating the GTIN-14 check digit." },
  ],
};
