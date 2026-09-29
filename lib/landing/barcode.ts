import type { BarcodeLanding } from "./types";

const RETAIL = ["barcode-generator", "ean-upc-validator", "check-digit", "barcode-scanner", "bulk-barcode"];
const GENERAL = ["barcode-generator", "barcode-validator", "barcode-scanner", "barcode-decoder", "bulk-barcode"];
const TWO_D = ["barcode-generator", "barcode-scanner", "barcode-decoder", "bulk-barcode", "qr-generator"];

export const BARCODE_LANDINGS: BarcodeLanding[] = [
  {
    kind: "barcode", format: "ean13", slug: "ean-13-barcode-generator", registryId: "bc-ean13",
    name: "EAN-13 Barcode Generator",
    title: "EAN-13 Barcode Generator",
    description: "Create an EAN-13 barcode from your 12 or 13-digit number. The check digit is calculated or verified, and you can download print-ready SVG, PDF or PNG.",
    intro: "Enter your product number to get a print-ready EAN-13 barcode. Type 12 digits and the check digit is calculated, or all 13 to have it verified.",
    howTo: [
      "Enter the 12 digits of your GTIN to have the check digit added, or all 13 digits to check it.",
      "Keep the recommended size (0.33 mm bars) unless your packaging designer or retailer asks for another size.",
      "Download SVG or PDF for packaging artwork, so the bars stay sharp.",
      "Print a test copy and scan it before sending artwork to print.",
    ],
    sections: [
      {
        heading: "How an EAN-13 number is built",
        paragraphs: [
          "EAN-13 carries a 13-digit GTIN (Global Trade Item Number). It starts with your GS1 company prefix, which identifies your business and varies in length, followed by an item reference you assign to each product, and ends with one check digit.",
          "Only 12 digits are drawn as bars. The first digit isn't encoded directly: it's expressed by the pattern of how the next six digits are drawn, which is why it's printed outside the barcode on the left.",
          "The first two or three digits show which national GS1 organisation issued the prefix, not where the product was made. Prefixes 978 and 979 are used for books (ISBN), 977 for magazines, and 20–29 for in-store numbers such as weighed goods.",
        ],
      },
      {
        heading: "The check digit",
        paragraphs: [
          "The 13th digit is calculated from the first 12 by weighting them alternately 1 and 3, adding the results, and taking the amount needed to reach the next multiple of 10. For 400638133393 the total is 89, so the check digit is 1 and the full number is 4006381333931. The check digit calculator shows each step for any number.",
        ],
      },
      {
        heading: "Getting a number: what this generator can't do",
        paragraphs: [
          "ScanHatch draws the barcode for a number you already have. It can't issue or register EAN numbers. For products sold through shops and major online marketplaces, retailers expect GTINs licensed from GS1, which checks that each number belongs to your company. A barcode with an invented number can scan perfectly and still be rejected, or clash with another company's product.",
          "For internal uses such as stock rooms, the 20–29 in-store range or a different format like Code 128 avoids clashing with real product numbers.",
        ],
      },
      {
        heading: "Printing EAN-13",
        list: [
          "GS1's nominal EAN-13 is 37.29 × 25.93 mm at a 0.33 mm module width, measured with the first digit sitting inside the left margin. ScanHatch's file at the same module width is about 42.6 × 27.7 mm, because it adds a full 11-module quiet zone on both sides and prints the digits as a separate line. The bars are the same size; the extra space is blank margin. GS1 allows module widths from 80% to 200% of nominal.",
          "Keep the light margin on the left at least 11 bars' width and on the right at least 7, and keep text and borders out of them.",
          "Black bars on white are the most reliable. Avoid red bars, which many scanners can't see.",
          "Don't shorten the bars to fit a small pack without checking your retailer's rules; truncated barcodes are often rejected.",
        ],
      },
    ],
    faq: [
      { q: "Can ScanHatch give me an official EAN number?", a: "No. ScanHatch generates the barcode symbol only. Official GTINs for retail products come from GS1 (or an authorised reseller), and generating a barcode doesn't give you ownership of a number." },
      { q: "What if I only have 12 digits?", a: "Enter the 12 digits and the check digit is calculated and added. The preview shows the complete 13-digit number." },
      { q: "Is EAN-13 the same as UPC-A?", a: "A UPC-A number is an EAN-13 that starts with 0, and scanners read both. Shops in North America often ask for UPC-A; elsewhere EAN-13 is standard." },
      { q: "Which file should I send to my printer?", a: "SVG or PDF. Both are vector files, so the bars stay exactly the right width at any size." },
    ],
    related: [...RETAIL],
  },
  {
    kind: "barcode", format: "ean8", slug: "ean-8-barcode-generator", registryId: "bc-ean8",
    name: "EAN-8 Barcode Generator",
    title: "EAN-8 Barcode Generator",
    description: "Create an EAN-8 barcode for small packages. Enter 7 digits to calculate the check digit or 8 to verify it, then download SVG, PDF or PNG.",
    intro: "EAN-8 is the short retail barcode for packs too small for EAN-13. Enter 7 digits to have the check digit added, or all 8 to verify an existing number.",
    howTo: [
      "Enter your 7-digit number to calculate the check digit, or the full 8 digits to check it.",
      "Keep the recommended 0.33 mm bar width unless your artwork needs a different size.",
      "Download SVG or PDF for packaging, and test-scan a printed proof.",
    ],
    sections: [
      {
        heading: "What EAN-8 is for",
        paragraphs: [
          "EAN-8 carries an 8-digit GTIN on items where an EAN-13 barcode genuinely won't fit, such as lipsticks, pens and small confectionery. At nominal size it's about 26.7 × 21.6 mm including margins, roughly two-thirds the width of an EAN-13.",
          "An EAN-8 number isn't a shortened EAN-13. GS1 issues EAN-8 numbers individually, and usually only when a product's packaging is too small for EAN-13, because the supply of 8-digit numbers is very limited.",
        ],
      },
      {
        heading: "Structure and check digit",
        paragraphs: [
          "The 8 digits are split into two groups of four between the guard bars, with the last digit being the check digit. It's calculated the same way as for EAN-13: weight the first seven digits 3, 1, 3, 1, 3, 1, 3 from the left, add them up, and take the amount needed to reach the next multiple of 10. For 9638507 that gives 4, so the complete number is 96385074.",
          "EAN-8 numbers starting with 0 or 2 are reserved for restricted, in-store use, and aren't valid for trading between companies.",
        ],
      },
      {
        heading: "Before choosing EAN-8",
        list: [
          "Check whether an EAN-13 could fit if the bars are made slightly shorter or the barcode is placed on a different face; retailers are generally happier with EAN-13.",
          "If you're in North America, UPC-E is the usual small-pack alternative.",
        ],
      },
    ],
    faq: [
      { q: "Can I make an EAN-8 by removing digits from my EAN-13?", a: "No. EAN-8 numbers are allocated separately by GS1. Cutting digits from an EAN-13 creates a different, unassigned number." },
      { q: "Do scanners read EAN-8 automatically?", a: "Retail scanners and ScanHatch's barcode scanner read EAN-8 alongside EAN-13 and UPC." },
    ],
    related: [...RETAIL],
  },
  {
    kind: "barcode", format: "upca", slug: "upc-a-barcode-generator", registryId: "bc-upca",
    name: "UPC-A Barcode Generator",
    title: "UPC-A Barcode Generator",
    description: "Create a UPC-A barcode for products sold in the US and Canada. Enter 11 digits to add the check digit or 12 to verify it. Download SVG, PDF or PNG.",
    intro: "UPC-A is the 12-digit retail barcode used across North America. Enter 11 digits and the check digit is calculated, or 12 digits to have it checked.",
    howTo: [
      "Enter the 11 digits of your UPC to calculate the check digit, or all 12 to verify it.",
      "Keep the recommended size unless your packaging specification says otherwise.",
      "Download SVG or PDF for print artwork, and scan a printed proof.",
    ],
    sections: [
      {
        heading: "The 12 digits",
        paragraphs: [
          "A UPC-A number is a 12-digit GTIN: a GS1 company prefix issued to your business, an item reference for each product, and a final check digit. The first digit is printed small to the left of the bars and the check digit to the right.",
          "The first digit also signals special ranges: 2 is used for in-store variable-weight items, 3 for drugs and health products in the US, 4 for in-store use and 5 traditionally for coupons.",
        ],
      },
      {
        heading: "UPC-A and EAN-13",
        paragraphs: [
          "UPC-A and EAN-13 are the same system. Add a 0 in front of a UPC-A number and you get the equivalent EAN-13, and the bar pattern is identical. That's why scanners, and many databases, show a UPC-A as a 13-digit number beginning with 0. Retailers outside North America read UPC-A without any problem.",
        ],
      },
      {
        heading: "Check digit",
        paragraphs: [
          "Multiply the digits in odd positions (1st, 3rd, 5th…) by 3 and the even positions by 1, add everything up, and take the amount needed to reach the next multiple of 10. For 03600029145 the check digit is 2, giving 036000291452.",
        ],
      },
      {
        heading: "UPC-E for small packs",
        paragraphs: [
          "Some UPC-A numbers can be printed as a shorter 8-digit UPC-E barcode. This only works when the number contains zeros in specific positions. The EAN/UPC validator includes a converter that tells you whether yours can.",
        ],
      },
    ],
    faq: [
      { q: "Can ScanHatch issue a UPC number?", a: "No. UPC numbers for retail come from GS1 US (or GS1 in your country). ScanHatch creates the barcode image for a number you already have." },
      { q: "Why does my scanner show 13 digits?", a: "Many scanners report UPC-A in its 13-digit GTIN form, with a leading 0. It's the same number." },
      { q: "What size should a UPC-A be?", a: "Nominal size uses 0.33 mm bars, about 37 mm wide including margins. GS1 allows 80% to 200% of that." },
    ],
    related: [...RETAIL],
  },
  {
    kind: "barcode", format: "upce", slug: "upc-e-barcode-generator", registryId: "bc-upce",
    name: "UPC-E Barcode Generator",
    title: "UPC-E Barcode Generator – Compact UPC",
    description: "Create a compact UPC-E barcode from an 8-digit UPC-E number or a compressible UPC-A. The check digit is calculated from the expanded UPC-A.",
    intro: "UPC-E packs a UPC-A number into a barcode about half the width, for cans and small packs. Enter a UPC-E number, or a UPC-A to see if it can be shortened.",
    howTo: [
      "Enter 7 digits (number system 0 or 1, then six digits) to have the check digit calculated, or 8 digits to verify it.",
      "Or enter an 11- or 12-digit UPC-A: if it can be compressed, it's converted for you.",
      "Download and test-scan. Most scanners report the expanded 12-digit UPC-A when they read it.",
    ],
    sections: [
      {
        heading: "Zero suppression",
        paragraphs: [
          "UPC-E is a UPC-A number with some zeros left out. Only numbers with zeros in particular places can be compressed, and the last of the six middle digits tells scanners which zeros to put back. For example, UPC-E 04252614 expands to UPC-A 042100005264.",
          "Most UPC-A numbers can't be written as UPC-E. You can't choose to shorten any number; it has to be assigned with a UPC-E-compatible pattern.",
        ],
      },
      {
        heading: "Check digit",
        paragraphs: [
          "The check digit of a UPC-E isn't calculated from its own digits. It's the check digit of the expanded UPC-A number. In the barcode itself, the check digit and number system aren't drawn as separate bars: they're encoded in the pattern of the six data digits.",
        ],
      },
      {
        heading: "Where UPC-E is used",
        list: [
          "Drinks cans, cigarette packs and small items in North American retail.",
          "Only number systems 0 and 1 can be used.",
          "Outside North America, EAN-8 is the more common small-pack barcode.",
        ],
      },
    ],
    faq: [
      { q: "Can I convert any UPC-A to UPC-E?", a: "No. Only UPC-A numbers with zeros in the right positions can be compressed. The generator tells you if yours can't." },
      { q: "Why does my scanner show 12 or 13 digits?", a: "Scanners usually expand UPC-E back to the full UPC-A (or 13-digit GTIN) number before sending it to a till system." },
    ],
    related: ["barcode-generator", "ean-upc-validator", "check-digit", "barcode-scanner", "barcode-validator"],
  },
  {
    kind: "barcode", format: "code128", slug: "code-128-barcode-generator", registryId: "bc-code128",
    name: "Code 128 Barcode Generator",
    title: "Code 128 Barcode Generator",
    description: "Create Code 128 barcodes for letters, numbers and symbols. Compact, widely supported and ideal for labels, inventory and asset tags. Download SVG, PDF or PNG.",
    intro: "Code 128 encodes any standard keyboard text in a compact barcode that virtually every scanner reads. Type your data and download the label.",
    howTo: [
      "Type the text or number to encode. Upper and lower case letters, digits, spaces and punctuation are all allowed.",
      "Adjust the bar width and height to fit your label, keeping the quiet zone at each end.",
      "Download PNG for label software, or SVG or PDF for professional printing.",
    ],
    sections: [
      {
        heading: "Why Code 128 is so widely used",
        paragraphs: [
          "Code 128 can encode all 128 standard ASCII characters, and it switches between three internal character sets automatically. Set C packs two digits into each symbol, so long numbers produce a noticeably shorter barcode than with Code 39. ScanHatch lets the encoder choose the most compact combination for you.",
          "Every Code 128 barcode ends with a mod 103 check character. It's calculated automatically and checked by the scanner, but it isn't part of the data the scanner returns, so you'll never see it in the text.",
        ],
      },
      {
        heading: "Common uses",
        list: [
          "Warehouse, inventory and bin-location labels.",
          "Asset tags and equipment IDs.",
          "Shipping and courier labels (often using GS1-128, a structured variant of Code 128).",
          "Library, ticketing and internal document tracking.",
        ],
      },
      {
        heading: "What Code 128 isn't for",
        paragraphs: [
          "Products sold in shops need EAN-13 or UPC-A with a registered GTIN. ScanHatch also doesn't generate GS1-128 (the version with Application Identifiers like (01) and (17) used in supply chains), which needs special FNC1 characters.",
          "Characters outside standard ASCII, such as accented letters, aren't supported reliably by scanners and are rejected by the generator.",
        ],
      },
      {
        heading: "Size and scanning",
        list: [
          "Leave at least 10 bar widths of blank space at each end.",
          "Make the bars at least 15% as tall as the barcode is long, and no shorter than about 6 mm, for handheld scanners.",
          "Long text makes a long barcode. Beyond about 20 to 30 characters, consider a 2D code such as Data Matrix.",
        ],
      },
    ],
    faq: [
      { q: "Do I need to choose Code 128 A, B or C?", a: "No. ScanHatch's encoder switches between the subsets automatically to make the shortest barcode." },
      { q: "Can Code 128 contain lowercase letters?", a: "Yes, unlike Code 39. Upper and lower case letters, digits and punctuation are all supported." },
      { q: "Is this GS1-128?", a: "No. This is standard Code 128. GS1-128 adds Application Identifiers and special characters, which ScanHatch doesn't generate." },
    ],
    related: [...GENERAL],
  },
  {
    kind: "barcode", format: "code39", slug: "code-39-barcode-generator", registryId: "bc-code39",
    name: "Code 39 Barcode Generator",
    title: "Code 39 Barcode Generator",
    description: "Create Code 39 (Code 3 of 9) barcodes with capital letters, digits and symbols, with an optional mod 43 check character. Download SVG, PDF or PNG.",
    intro: "Code 39, also called Code 3 of 9, is a simple alphanumeric barcode that older systems and many industries still require. Type your data in capitals and download.",
    howTo: [
      "Type your data using capital letters A–Z, digits 0–9, spaces and - . $ / + %.",
      "Turn on the mod 43 check character only if your system expects one.",
      "Download and scan a test print with the scanner your system uses.",
    ],
    sections: [
      {
        heading: "How Code 39 works",
        paragraphs: [
          "Each character is made of nine elements (five bars and four spaces), three of which are wide, hence “3 of 9”. Every barcode starts and ends with an asterisk, which scanners use to find the code and don't include in the result.",
          "Because every character follows the same rule, Code 39 is self-checking: a misprinted character usually fails to decode rather than being misread. That robustness, and its simplicity to print, is why it's still used decades after it was introduced.",
        ],
      },
      {
        heading: "Where you'll still meet Code 39",
        list: [
          "Military and government logistics: the US Department of Defense's LOGMARS labelling uses it.",
          "Automotive and industrial part marking.",
          "ID badges, healthcare wristbands and older inventory systems that were set up around it.",
        ],
      },
      {
        heading: "Limits worth knowing",
        list: [
          "No lowercase letters. The “Full ASCII” extension exists, but scanners have to be configured for it, so ScanHatch doesn't generate it. Use Code 128 for lowercase.",
          "It's wide: each character takes much more space than in Code 128, so keep data short.",
          "The optional mod 43 check character is added to the end of the data. If your scanner isn't set to verify it, it will appear as an extra character.",
        ],
      },
    ],
    faq: [
      { q: "Is Code 39 the same as Code 3 of 9?", a: "Yes. They're two names for the same barcode." },
      { q: "Should I add the check character?", a: "Only if your system requires it. Most Code 39 installations don't, and an unexpected check character shows up as an extra character in the scan." },
      { q: "Why can't I use lowercase letters?", a: "Standard Code 39 has no lowercase characters. Use Code 128 if you need them." },
    ],
    related: [...GENERAL],
  },
  {
    kind: "barcode", format: "code93", slug: "code-93-barcode-generator", registryId: "bc-code93",
    name: "Code 93 Barcode Generator",
    title: "Code 93 Barcode Generator",
    description: "Create Code 93 barcodes, a more compact alternative to Code 39 with two built-in check characters. Download print-ready SVG, PDF or PNG.",
    intro: "Code 93 uses the same characters as Code 39 in a shorter barcode, with two mandatory check characters for extra safety.",
    howTo: [
      "Type your data using capital letters, digits, spaces and - . $ / + %.",
      "Leave the check characters to ScanHatch: both are calculated automatically.",
      "Download and test with your scanner. Some scanners ship with Code 93 turned off.",
    ],
    sections: [
      {
        heading: "Code 93 compared with Code 39",
        paragraphs: [
          "Code 93 was designed as a denser replacement for Code 39. Each character takes 9 modules made of three bars and three spaces, so the same text usually produces a noticeably shorter barcode than Code 39, often about a third shorter.",
          "Two check characters, known as C and K, are always added before the stop pattern. Scanners verify and remove them, so they don't appear in the scanned value.",
        ],
      },
      {
        heading: "When to use it",
        list: [
          "When a system specifically asks for Code 93, as some logistics, postal and electronics labels do.",
          "When Code 39 data needs to fit in a smaller space and the scanners support Code 93.",
          "For new projects, Code 128 is usually the better choice: it's even more compact for digits and more widely enabled by default.",
        ],
      },
    ],
    faq: [
      { q: "Why doesn't my scanner read Code 93?", a: "Some scanners have Code 93 disabled out of the box. Check the scanner's configuration guide, usually a barcode you scan to enable it." },
      { q: "Can I see the check characters?", a: "No. They're part of the printed symbol and are removed by the scanner." },
    ],
    related: [...GENERAL],
  },
  {
    kind: "barcode", format: "itf", slug: "itf-barcode-generator", registryId: "bc-itf",
    name: "ITF Barcode Generator (Interleaved 2 of 5)",
    title: "ITF Barcode Generator – Interleaved 2 of 5",
    description: "Create Interleaved 2 of 5 (ITF) barcodes for numeric data. Digits are encoded in pairs, so an even number of digits is required. Download SVG, PDF or PNG.",
    intro: "Interleaved 2 of 5 is a compact numeric barcode common on cartons and in warehouses. Enter an even number of digits to create one.",
    howTo: [
      "Enter your digits. ITF needs an even number of them; add a leading zero if your system allows it.",
      "Use wider bars for printing on cardboard (0.5 mm or more).",
      "Download and test-scan with the scanner that will read it.",
    ],
    sections: [
      {
        heading: "How the interleaving works",
        paragraphs: [
          "ITF encodes digits in pairs: the first digit of each pair is carried by five bars and the second by the five spaces between them, two of each five being wide. That's what makes it compact for numbers, and why the total number of digits must be even.",
        ],
      },
      {
        heading: "No built-in check digit",
        paragraphs: [
          "Plain ITF has no mandatory check digit. A damaged or partly scanned barcode can occasionally be read as a shorter, valid-looking number. To guard against that, many systems fix the expected length in the scanner settings, print bearer bars (thick lines above and below), or use a format with a check digit such as ITF-14.",
          "Many scanners refuse ITF codes shorter than 6 digits by default for the same reason.",
        ],
      },
      {
        heading: "ITF or ITF-14?",
        paragraphs: [
          "ITF-14 is ITF used for a specific purpose: a 14-digit GTIN with a check digit, printed with a bearer border on shipping cartons. If you're labelling cartons for retailers or distributors, you almost certainly need ITF-14 rather than free-length ITF.",
        ],
      },
    ],
    faq: [
      { q: "Why does ITF need an even number of digits?", a: "Digits are encoded in pairs (one in the bars, one in the spaces), so there's no way to encode a single leftover digit." },
      { q: "Is ITF the same as Interleaved 2 of 5?", a: "Yes. ITF is short for Interleaved Two of Five." },
    ],
    related: ["barcode-generator", "itf-14-validator", "barcode-validator", "barcode-scanner", "bulk-barcode"],
  },
  {
    kind: "barcode", format: "itf14", slug: "itf-14-barcode-generator", registryId: "bc-itf14",
    name: "ITF-14 Barcode Generator",
    title: "ITF-14 Barcode Generator – GTIN-14 Carton Barcodes",
    description: "Create ITF-14 barcodes for shipping cartons. Enter 13 digits to calculate the check digit or 14 to verify it. Includes the bearer border. Download SVG, PDF or PNG.",
    intro: "ITF-14 identifies cases and cartons in the supply chain. Enter 13 digits to have the check digit added, or 14 to verify a number you have.",
    howTo: [
      "Enter the 13 digits of your GTIN-14 (indicator digit plus 12 digits) to calculate the check digit, or all 14 to verify it.",
      "Keep the recommended size: ITF-14 is meant to be printed large on cartons.",
      "Download SVG or PDF for carton artwork and check the bearer border is printed in full.",
    ],
    sections: [
      {
        heading: "What the 14 digits mean",
        paragraphs: [
          "ITF-14 carries a GTIN-14, the number for a trade unit (a case, carton or pack of several items) rather than a single product sold at a till. The first digit is the packaging indicator: 1 to 8 distinguish different pack configurations of the same product (say, a case of 6 and a case of 24), 9 is used for variable-measure items, and 0 means the carton shares the GTIN of the item inside.",
          "The next 12 digits are usually the product's own GTIN without its check digit, and the final digit is a new check digit calculated over all 13 preceding digits. That's why you can't just put an extra digit in front of an EAN-13.",
        ],
      },
      {
        heading: "Different from retail barcodes",
        paragraphs: [
          "EAN-13 and UPC-A are scanned at the checkout; ITF-14 is scanned in warehouses and at goods-in, often from a distance or on a conveyor. It uses the Interleaved 2 of 5 symbology, which prints well on corrugated cardboard, and is framed by thick bearer bars that protect it from partial reads when the printing plate presses unevenly.",
        ],
      },
      {
        heading: "Printing on cartons",
        list: [
          "Print it large: GS1 recommends narrow bars between roughly 0.5 mm and 1 mm, and bars around 32 mm tall.",
          "Keep the full bearer border and at least 10 bar widths of blank space inside it at each end.",
          "Place it on at least two adjacent sides of the carton, where warehouse scanners can see it.",
        ],
      },
    ],
    faq: [
      { q: "Can I use my product's EAN-13 on the carton?", a: "Only if the carton is itself a retail unit. Cases of several items usually need their own GTIN-14 with an indicator digit, which your GS1 membership lets you assign." },
      { q: "What does the first digit mean?", a: "It's the packaging indicator: 1–8 for different pack sizes of the same product, 9 for variable-measure items, and 0 when the carton uses the inner item's number." },
      { q: "Why is there a thick frame around the barcode?", a: "Those are bearer bars. They stop scanners reading a partial code and help the printing plate press evenly on cardboard." },
    ],
    related: ["barcode-generator", "itf-14-validator", "check-digit", "barcode-scanner", "bulk-barcode"],
  },
  {
    kind: "barcode", format: "codabar", slug: "codabar-barcode-generator", registryId: "bc-codabar",
    name: "Codabar Barcode Generator",
    title: "Codabar Barcode Generator",
    description: "Create Codabar barcodes with start and stop characters A–D, as used by library and legacy systems. Download SVG, PDF or PNG.",
    intro: "Codabar is an older numeric barcode still used by many library systems. Enter your number and choose the start and stop letters your system expects.",
    howTo: [
      "Enter the data: digits and - $ : / . + only.",
      "Choose the start and stop characters (A, B, C or D). Check an existing label or your system's documentation to see which it uses.",
      "Download and scan a test label with your system's scanner.",
    ],
    sections: [
      {
        heading: "Start and stop characters",
        paragraphs: [
          "Every Codabar barcode begins and ends with one of the letters A, B, C or D. Scanners use them to find the barcode, and some systems use the specific pair to tell label types apart. Many scanners include them in the scanned value, so a label for 40156 with A…B scans as A40156B unless the scanner strips them.",
          "Codabar is also known as NW-7, particularly in Japan, and some older documentation calls the start/stop characters T, N, * and E instead of A to D.",
        ],
      },
      {
        heading: "Where it's used",
        list: [
          "Library books and borrower cards, one of Codabar's most common remaining uses.",
          "Older blood bank, photo-lab and courier systems. Many have moved to Code 128 or ISBT 128.",
          "Any system that already uses Codabar and needs replacement labels that match.",
        ],
      },
      {
        heading: "For new systems",
        paragraphs: [
          "Codabar has no mandatory check digit and a limited character set. If you're designing something new, Code 128 is more compact and more widely supported.",
        ],
      },
    ],
    faq: [
      { q: "Which start and stop letters should I use?", a: "The ones your existing labels or software expect. If you're matching library barcodes, scan an existing label to see its letters." },
      { q: "Is Codabar the same as NW-7?", a: "Yes. NW-7 is another name for Codabar." },
    ],
    related: [...GENERAL],
  },
  {
    kind: "barcode", format: "datamatrix", slug: "data-matrix-generator", registryId: "bc-datamatrix",
    name: "Data Matrix Generator",
    title: "Data Matrix Code Generator",
    description: "Create Data Matrix 2D codes that store text in a very small square. Choose the size in millimetres and download print-ready SVG, PDF or PNG.",
    intro: "Data Matrix stores text in a tiny square code that still reads when partly damaged. Enter your text, set the printed size and download.",
    howTo: [
      "Enter the text to encode: letters, digits, symbols and line breaks.",
      "Set the printed width in millimetres. Leave at least one module of blank border around it.",
      "Download and scan it with the camera or scanner that will be used.",
    ],
    sections: [
      {
        heading: "What makes Data Matrix different",
        paragraphs: [
          "Data Matrix (the ECC 200 version, the one in use today) is a square or rectangular grid with a solid L-shaped border on two sides and a broken timing pattern on the other two. Scanners find it by that L shape.",
          "It uses Reed-Solomon error correction, so a code can often still be read when part of it is scratched or smudged. And because it stores data in both directions, it holds far more than a barcode in a small space. A 20-character serial number fits comfortably in a square a few millimetres wide.",
        ],
      },
      {
        heading: "Common uses",
        list: [
          "Marking electronic components, circuit boards and industrial parts, sometimes etched directly into metal.",
          "Serial numbers and tracking codes on small items and labels.",
          "Healthcare packaging and medical devices, which usually use GS1 Data Matrix, a structured version (see below).",
        ],
      },
      {
        heading: "Standard Data Matrix, not GS1 Data Matrix",
        paragraphs: [
          "ScanHatch generates standard Data Matrix with plain text. GS1 Data Matrix, required for pharmaceutical serialisation and some medical devices, uses a special FNC1 start character and Application Identifiers, such as (01) for the GTIN and (17) for the expiry date. ScanHatch doesn't generate that variant, so don't use these codes where GS1 Data Matrix is required.",
          "ScanHatch's Data Matrix accepts standard English characters (ASCII). For other languages, a QR code is a better choice.",
        ],
      },
      {
        heading: "Size and scanning",
        list: [
          "Phone cameras generally need a code at least 10–15 mm across; industrial scanners can read much smaller codes.",
          "More data adds more rows and columns, so the same printed size means smaller modules. Test at your final size.",
        ],
      },
    ],
    faq: [
      { q: "Data Matrix or QR code?", a: "For people scanning with phones, QR codes are more familiar. Data Matrix is preferred for small industrial and product marking, where its compact size and robustness matter." },
      { q: "Can phones read Data Matrix?", a: "Many scanning apps can, including ScanHatch's barcode scanner, but some built-in phone cameras only recognise QR codes." },
      { q: "Can I make a GS1 Data Matrix here?", a: "No. ScanHatch makes standard Data Matrix only." },
    ],
    related: [...TWO_D],
  },
  {
    kind: "barcode", format: "pdf417", slug: "pdf417-generator", registryId: "bc-pdf417",
    name: "PDF417 Generator",
    title: "PDF417 Barcode Generator",
    description: "Create PDF417 stacked barcodes that hold hundreds of characters, as used on ID cards and boarding passes. Download print-ready SVG, PDF or PNG.",
    intro: "PDF417 stacks many rows of barcode into one rectangle, holding far more text than a normal barcode. Enter your text and download the code.",
    howTo: [
      "Enter the text to encode. Line breaks are allowed.",
      "Set the printed width. Keep rows tall enough for your scanner and leave a margin of at least two modules around it.",
      "Download and test with the reader that will be used.",
    ],
    sections: [
      {
        heading: "What PDF417 is",
        paragraphs: [
          "PDF417 is a stacked barcode: between 3 and 90 rows, each made of codewords 17 modules wide (the “417” refers to 4 bars and spaces in 17 modules). Special start and stop patterns and row indicators let a scanner read the rows in any order and piece them together.",
          "It includes Reed-Solomon error correction, so a code can survive some damage. A single symbol can hold roughly 1,800 text characters, though codes that large need a lot of space and a good scanner.",
        ],
      },
      {
        heading: "Where PDF417 is used",
        list: [
          "The back of US and Canadian driving licences and many ID cards.",
          "Printed airline boarding passes. Mobile boarding passes often use Aztec, QR or Data Matrix instead.",
          "Shipping documents, invoices and forms where the data needs to travel with the paper.",
        ],
      },
      {
        heading: "Things to check",
        list: [
          "Many phone scanning apps read PDF417, but not all built-in phone cameras do. Test with the actual reader.",
          "A data format such as the driving-licence (AAMVA) layout isn't created automatically. ScanHatch encodes the text you enter, exactly as typed.",
          "ScanHatch's PDF417 accepts standard English characters (ASCII).",
        ],
      },
    ],
    faq: [
      { q: "Can I make a driving licence barcode?", a: "ScanHatch encodes whatever text you enter, but doesn't produce the AAMVA data format, and producing identity documents is for authorised issuers only." },
      { q: "Why is it called PDF417?", a: "PDF stands for Portable Data File, and 417 describes each codeword: 4 bars and 4 spaces spread over 17 modules." },
    ],
    related: [...TWO_D],
  },
  {
    kind: "barcode", format: "aztec", slug: "aztec-generator", registryId: "bc-aztec",
    name: "Aztec Code Generator",
    title: "Aztec Code Generator",
    description: "Create Aztec 2D codes, the square codes with a bullseye centre used on transport and event tickets. No quiet zone needed. Download SVG, PDF or PNG.",
    intro: "Aztec codes are square 2D codes read from a bullseye in the centre, so they need no blank margin. Enter your text and download.",
    howTo: [
      "Enter the text to encode.",
      "Set the printed width. A margin is optional for Aztec, but don't let artwork touch the code.",
      "Download and test with the ticket reader or app that will scan it.",
    ],
    sections: [
      {
        heading: "The bullseye",
        paragraphs: [
          "An Aztec code grows outwards from a central finder pattern of concentric squares. Scanners locate the bullseye first and read the data in layers around it. Because it doesn't depend on the edges, an Aztec code needs no quiet zone and can sit closer to other printed content than a QR code or Data Matrix.",
          "Small codes use the compact form (up to 27 × 27 modules); larger ones use the full-range form, which can hold around 3,000 characters of text. Reed-Solomon error correction lets damaged codes still be read.",
        ],
      },
      {
        heading: "Where Aztec is used",
        list: [
          "Rail tickets. European rail operators use the UIC 918.3 standard, which is based on Aztec.",
          "Mobile boarding passes and event tickets, where the code is shown on a phone screen.",
          "Transport and ticketing systems in general, where the reader hardware is controlled.",
        ],
      },
      {
        heading: "Things to know",
        list: [
          "Don't cover the central bullseye with a logo or design. Scanners need it to find the code.",
          "Built-in phone cameras mostly look for QR codes, so for codes that the public will scan with their own phones, QR is the safer choice.",
          "ScanHatch's Aztec generator accepts standard English characters (ASCII).",
        ],
      },
    ],
    faq: [
      { q: "Does an Aztec code need a white border?", a: "No, that's one of its advantages. A small margin doesn't hurt, but it isn't required." },
      { q: "Aztec or QR code?", a: "QR codes are recognised by more phone cameras, so they're better for the public. Aztec suits ticketing systems where you control the scanner." },
    ],
    related: [...TWO_D],
  },
];
