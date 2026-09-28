export interface CsvTemplate {
  id: string;
  label: string;
  filename: string;
  content: string;
  description: string;
}

export const QR_TEMPLATES: CsvTemplate[] = [
  {
    id: "qr-basic", label: "Download CSV template", filename: "scanhatch-bulk-qr-template.csv",
    description: "Two columns: name (used for the file name) and data (the link or text).",
    content: "name,data\r\nGoogle,https://google.com\r\nScanHatch,https://scanhatch.com\r\n",
  },
  {
    id: "qr-advanced", label: "Advanced template (with types)", filename: "scanhatch-bulk-qr-advanced-template.csv",
    description: "Adds a type column: url, text, email or phone.",
    content: [
      "type,name,data",
      "url,Website,https://scanhatch.com",
      'text,Welcome note,"Welcome! Wi-Fi details are at the front desk, ask any time."',
      "email,Support email,support@example.com",
      "phone,Reception,+44 20 7946 0000",
    ].join("\r\n") + "\r\n",
  },
];

export const BARCODE_TEMPLATES: CsvTemplate[] = [
  {
    id: "bc-mixed", label: "Download CSV template", filename: "scanhatch-bulk-barcode-template.csv",
    description: "Three columns: type, name and value. Mix formats in one file.",
    content: "type,name,value\r\ncode128,Product A,ABC123\r\nean13,Product B,4006381333931\r\nupca,Product C,036000291452\r\n",
  },
  {
    id: "bc-simple", label: "Simple template (one format)", filename: "scanhatch-bulk-barcode-simple-template.csv",
    description: "Name and value only. Choose the barcode format on the page.",
    content: "name,value\r\nItem 1,4006381333931\r\nItem 2,5901234123457\r\nItem 3,400638133393\r\n",
  },
];
