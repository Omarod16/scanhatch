import type { LandingSection } from "./types";

/**
 * Extra, format-specific sections appended to landing pages where the original content
 * had gaps (examples, limits, common mistakes, alternatives). Technical statements follow
 * the site's own validation rules in lib/barcode/formats.ts and lib/qr/content.ts.
 * Example data is fictional.
 */
export const EXTRA_SECTIONS: Record<string, LandingSection[]> = {
  // ---------------------------------------------------------------- barcodes
  "ean-13-barcode-generator": [
    {
      heading: "When another format is a better fit",
      list: [
        "UPC-A, if your numbers come from GS1 US. They're 12 digits long and are normally printed as UPC-A, although they also read as EAN-13 with a leading 0.",
        "EAN-8, only when GS1 has allocated you an 8-digit number because the pack is genuinely too small for EAN-13. You can't shorten an EAN-13 into one.",
        "ITF-14 for outer cartons that move through warehouses rather than across a till.",
        "A QR code next to the EAN-13 (not instead of it) if you want shoppers to reach instructions or recipes with their phone.",
      ],
    },
  ],
  "ean-8-barcode-generator": [
    {
      heading: "An example",
      paragraphs: [
        "Entering 9638507 gives the EAN-8 96385074: the generator calculates and adds the check digit, 4. If you enter all eight digits instead, it checks the last one and tells you the correct value if it doesn't match.",
      ],
    },
    {
      heading: "Common mistakes",
      list: [
        "Cutting an EAN-13 down to eight digits. An EAN-8 number is a separate allocation from GS1, not a shortened EAN-13, so a trimmed number identifies nothing.",
        "Using EAN-8 on packs that have room for an EAN-13. Retailers expect the standard size where it fits.",
        "Squeezing the light margins on a tiny pack. The blank space either side of the bars is part of the barcode.",
      ],
    },
    {
      heading: "When another format is a better fit",
      paragraphs: [
        "In North America, small packs more often use UPC-E, the compressed form of a UPC-A number. For internal labels that never reach a till, a small Data Matrix holds far more in less space.",
      ],
    },
  ],
  "upc-a-barcode-generator": [
    {
      heading: "An example",
      paragraphs: [
        "Entering the 11 digits 03600029145 produces the UPC-A 036000291452; the final 2 is the check digit. Enter 12 digits and the generator checks the last one instead, reporting the correct value if it's wrong.",
      ],
    },
    {
      heading: "Common mistakes",
      list: [
        "Entering 10 or 13 digits. UPC-A needs 11 digits (check digit added for you) or 12 (check digit verified).",
        "Making up a number. Retail numbers are licensed from GS1 US; a correct check digit doesn't make a number registered.",
        "Cropping the small digits printed outside the bars, or the blank margins around them, when fitting the barcode into artwork.",
      ],
    },
    {
      heading: "When another format is a better fit",
      paragraphs: [
        "If your number came from a GS1 organisation outside the US, it's 13 digits and belongs in an EAN-13. For very small packs, check whether your UPC-A number can be compressed into UPC-E.",
      ],
    },
  ],
  "upc-e-barcode-generator": [
    {
      heading: "An example",
      paragraphs: [
        "Entering 0425261 (the number system digit 0 followed by six digits) gives the UPC-E 04252614. It's the compressed form of the UPC-A 042100005264, and its check digit, 4, is calculated from that full UPC-A number.",
      ],
    },
    {
      heading: "Common mistakes",
      list: [
        "Entering only the six middle digits. Start with the number system digit, 0 or 1, making seven digits (or eight including the check digit).",
        "Trying to compress any UPC-A. Only numbers with zeros in particular positions have a UPC-E form; the rest must stay UPC-A.",
        "Choosing UPC-E for a product sold mainly outside North America, where EAN-8 or EAN-13 is expected.",
      ],
    },
    {
      heading: "Printing UPC-E",
      paragraphs: [
        "UPC-E is short, but its bars follow the same size rules as UPC-A, so don't shrink it further to save space. Keep the blank margins either side and test a printed sample with the kind of scanner your retailer uses.",
      ],
    },
  ],
  "code-128-barcode-generator": [
    {
      heading: "What you can encode",
      paragraphs: [
        "Standard English letters (upper and lower case), digits, spaces and common punctuation. Accented letters and emoji aren't encoded reliably, so the generator rejects them. ScanHatch limits Code 128 to 80 characters because longer barcodes become too wide to scan comfortably.",
      ],
    },
    {
      heading: "An example",
      paragraphs: [
        "The value SCANHATCH-128 makes a 13-character barcode using Code 128's letter set. A numbers-only ID of the same length would be noticeably shorter, because Code 128 packs digits two per symbol.",
      ],
    },
  ],
  "code-39-barcode-generator": [
    {
      heading: "An example",
      paragraphs: [
        "A part number such as PART-0042 encodes as it is. If you switch on the optional mod 43 check character, ScanHatch adds one character calculated from the rest: for CODE39 that character is W, so most scanners will read CODE39W unless they're set to remove it.",
      ],
    },
    {
      heading: "Common mistakes",
      list: [
        "Typing lowercase letters. Code 39 has capitals only; type them in capitals, or use Code 128 if you need lowercase.",
        "Including an asterisk. The * is reserved as the start and stop character, which is added for you.",
        "Encoding long values. ScanHatch stops at 50 characters, because Code 39 is wide and long codes are hard to scan.",
      ],
    },
  ],
  "code-93-barcode-generator": [
    {
      heading: "What you can encode",
      paragraphs: [
        "On ScanHatch, Code 93 accepts capital letters, digits, spaces and the symbols - . $ / + %, up to 60 characters. Two check characters are added automatically; scanners verify them and normally leave them out of the value they return.",
      ],
    },
    {
      heading: "An example and a common mistake",
      paragraphs: [
        "CODE-93 is a typical value. A common problem isn't the barcode but the scanner: some handheld scanners have Code 93 switched off by default, so check it's enabled before rolling out labels. If you need lowercase letters, use Code 128 instead.",
      ],
    },
  ],
  "itf-barcode-generator": [
    {
      heading: "An example",
      paragraphs: [
        "12345678 is a valid ITF value: eight digits, encoded as four pairs. ScanHatch accepts up to 60 digits.",
      ],
    },
    {
      heading: "Common mistakes",
      list: [
        "Entering an odd number of digits. ITF encodes digits in pairs, so add a leading zero (for example 01234567 instead of 1234567).",
        "Including letters or symbols. ITF is numbers only; use Code 128 for anything else.",
        "Relying on ITF for important data without a check. It has no built-in check digit, and a scanner that only catches part of a short ITF code can return a shorter, valid-looking number. Setting your scanners to a fixed length helps.",
      ],
    },
    {
      heading: "When another format is a better fit",
      paragraphs: [
        "For a product number on an outer carton, use ITF-14, which is ITF with a fixed 14-digit GTIN, a check digit and a protective frame.",
      ],
    },
  ],
  "itf-14-barcode-generator": [
    {
      heading: "An example",
      paragraphs: [
        "Say a product's GTIN-13 is 5012345678900 and it ships in cases. Drop its check digit, put an indicator digit such as 1 in front (1501234567890), and let the generator calculate the new check digit. The case's ITF-14 number is 15012345678907.",
      ],
    },
    {
      heading: "Common mistakes",
      list: [
        "Putting a 1 in front of the product's EAN-13 and keeping its old check digit. Entering 15012345678900 is rejected, because the last digit should be 7.",
        "Using the same 14-digit number for two different pack sizes. Each pack configuration needs its own number.",
        "Shrinking the barcode to fit the artwork. ITF-14 is designed to be printed large on corrugated board.",
      ],
    },
    {
      heading: "When another format is a better fit",
      paragraphs: [
        "If the case itself is sold at a checkout, it needs an EAN-13 or UPC-A. If you need to add a batch number or expiry date, logistics labels use GS1-128, which this generator doesn't produce.",
      ],
    },
  ],
  "codabar-barcode-generator": [
    {
      heading: "An example",
      paragraphs: [
        "Entering 40156 produces A40156A: the data framed by the start and stop letter A. Choose B, C or D in the options if your system expects a different pair. ScanHatch accepts up to 40 characters.",
      ],
    },
    {
      heading: "Common mistakes",
      list: [
        "Typing the start and stop letters into the data. Choose them with the options instead; the data itself is digits and the symbols - $ : / . + only.",
        "Using Codabar for a new system. It survives because existing library and lab systems read it; Code 128 is the better choice for anything new.",
      ],
    },
    {
      heading: "Printing Codabar",
      paragraphs: [
        "Codabar is a wide barcode for the amount of data it holds, so allow for its width on labels and keep the blank margin at each end clear. Test with the scanners the library or system actually uses, as they're often set up for specific start and stop letters.",
      ],
    },
  ],
  "data-matrix-generator": [
    {
      heading: "What you can encode",
      paragraphs: [
        "On ScanHatch: standard English letters, digits, symbols and line breaks, up to 1,500 characters. Emoji and other characters outside that set are rejected. Data Matrix has built-in error correction, so there's no separate check digit, and a slightly damaged code can still be read.",
      ],
    },
    {
      heading: "An example",
      paragraphs: [
        "A serial label such as SN: 000123 makes a code only a few millimetres across when printed small, which is why Data Matrix is used on electronic components and small parts.",
      ],
    },
    {
      heading: "When another format is a better fit",
      paragraphs: [
        "For codes the public will scan with their phones, a QR code is the safer choice: every phone camera recognises QR codes, while support for Data Matrix in built-in camera apps varies.",
      ],
    },
  ],
  "pdf417-generator": [
    {
      heading: "An example",
      paragraphs: [
        "PDF417 suits multi-line text such as a name, reference and date on separate lines. Line breaks are allowed, and ScanHatch accepts up to 1,500 characters. Like other 2D codes it includes error correction, so it tolerates some damage.",
      ],
    },
    {
      heading: "Common mistakes",
      list: [
        "Printing it too small or too short. PDF417 is made of stacked rows; if the rows are squashed, scanners struggle.",
        "Expecting every phone to read it. Built-in camera apps don't all recognise PDF417; use a QR code for information aimed at phone users.",
      ],
    },
  ],
  "aztec-generator": [
    {
      heading: "An example",
      paragraphs: [
        "A booking reference such as TICKET-7731 makes a small, square code that scans quickly from a phone screen, which is why rail and transport tickets use Aztec. ScanHatch accepts up to 1,500 characters, and the code includes error correction.",
      ],
    },
    {
      heading: "When another format is a better fit",
      paragraphs: [
        "For posters, packaging and anything scanned with ordinary phone cameras, use a QR code, which every camera app recognises. For marking very small parts, Data Matrix is more common.",
      ],
    },
  ],

  // ---------------------------------------------------------------- QR codes
  "url-qr-code-generator": [
    {
      heading: "Where a link QR code works best",
      list: [
        "Posters, flyers and shop windows that point to an event page or offer.",
        "Menus, table cards and packaging that link to details you'd rather not print.",
        "Business cards and CVs linking to a portfolio or profile.",
      ],
    },
    {
      heading: "Test before you print",
      list: [
        "Scan the downloaded file with two different phones, ideally an iPhone and an Android phone.",
        "Check the page loads quickly on mobile data, not just on your office WiFi.",
        "Make sure the link won't change. Once printed, the code can't be edited, so use an address on your own website that you can redirect if needed.",
      ],
    },
  ],
  "email-qr-code-generator": [
    {
      heading: "What you need",
      paragraphs: [
        "Only the email address is required. A subject and message are optional; they're filled into a new draft in the person's email app, and they still choose whether to send it.",
      ],
    },
    {
      heading: "Privacy and testing",
      list: [
        "The address is stored as readable text, so anyone who scans the code can see it. A shared inbox such as hello@ or bookings@ is often better than a personal address.",
        "Test on iPhone and Android. Some people have no email app set up, so print the address next to the code too.",
      ],
    },
  ],
  "phone-qr-code-generator": [
    {
      heading: "What to enter",
      paragraphs: [
        "A phone number, including the country code, such as +44 20 7946 0000. The code stores it as a tel: link, which opens the phone's dialler with the number filled in; the call only starts when the person presses call.",
      ],
    },
    {
      heading: "Privacy and testing",
      paragraphs: [
        "The number is readable by anyone who scans the code, so use a business or reception number for public signs. Before printing, scan the code with a phone and check the right number appears in the dialler.",
      ],
    },
  ],
  "sms-qr-code-generator": [
    {
      heading: "Common mistakes",
      list: [
        "Leaving out the country code, so the text goes nowhere when the phone is registered in another country.",
        "Expecting the message to send itself. The code opens a draft; the person still presses send, and their usual text message charges apply.",
        "Writing a long message. Keep it to a keyword or short line people can recognise before sending.",
      ],
    },
    {
      heading: "Testing before you print",
      paragraphs: [
        "Scan the code with an iPhone and an Android phone and check both the number and the message appear correctly. If you're running a keyword campaign, send a test message and confirm your system replies.",
      ],
    },
  ],
  "vcard-qr-code-generator": [
    {
      heading: "An example",
      paragraphs: [
        "A typical business card code holds a name, job title, organisation, one phone number, an email address and a website, for example Alex Taylor, Sales Manager, +44 20 7946 0000, alex@example.com.",
      ],
    },
    {
      heading: "Common mistakes",
      list: [
        "Adding every field. Each extra detail makes the code denser; if you include a full postal address, print the code larger.",
        "Leaving out the country code on phone numbers, so they don't dial from abroad.",
        "Forgetting the code can't be updated. When your job title or number changes, you need a new code.",
      ],
    },
  ],
  "whatsapp-qr-code-generator": [
    {
      heading: "What goes in the code",
      paragraphs: [
        "A wa.me link built from the WhatsApp number in international format, digits only (the generator removes the + and spaces), for example https://wa.me/447700900123. If you add a starter message, it's included in the link and appears ready to send; the person still decides whether to send it.",
      ],
    },
    {
      heading: "Good uses",
      list: [
        "Bookings and enquiries for restaurants, salons and small shops.",
        "A support or help-desk number printed on packaging or receipts.",
        "Market stalls and events where people want to message you later.",
      ],
    },
    {
      heading: "Privacy",
      paragraphs: [
        "The number is visible in the link to anyone who scans the code. Use a business WhatsApp number for anything displayed in public.",
      ],
    },
  ],
  "google-maps-qr-code-generator": [
    {
      heading: "What goes in the code",
      paragraphs: [
        "A Google Maps search link for either a place name or address (such as Tower Bridge, London) or a pair of coordinates (such as 51.5055, -0.0754). On a phone with Google Maps it opens the app; otherwise it opens Google Maps in the browser.",
      ],
    },
    {
      heading: "Common mistakes",
      list: [
        "Using a name that matches several places. Add the street, town or postcode so the search lands on the right one.",
        "Swapping latitude and longitude. Latitude comes first; in the UK it's roughly 50 to 60, while longitude is between about -8 and 2.",
        "Rounding coordinates too much. Four decimal places are accurate to roughly 10 metres; two decimal places can be a kilometre out.",
      ],
    },
    {
      heading: "Testing and privacy",
      paragraphs: [
        "Scan the code with a phone that has Google Maps and one that doesn't, and check it lands on the right spot. Print the address in words as well. If the location is a private home, remember anyone who scans the code can see it.",
      ],
    },
  ],
};
