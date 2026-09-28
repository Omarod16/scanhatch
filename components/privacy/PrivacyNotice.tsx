import Link from "next/link";

type Variant = "generator" | "scanner" | "validator" | "bulk";

const TEXT: Record<Variant, React.ReactNode> = {
  generator: <>Codes are created in your browser. What you type isn&apos;t sent to ScanHatch or stored by us.</>,
  scanner: <>Scanning happens in your browser; images and results aren&apos;t sent to ScanHatch. Your recent scans, including their full content (such as WiFi passwords), are kept in this browser tab&apos;s session storage until you clear them or close the tab.</>,
  validator: <>Checks run in your browser. Images and values aren&apos;t sent to ScanHatch or stored.</>,
  bulk: <>Your CSV file is read and processed in your browser. It isn&apos;t uploaded, and the ZIP file is created on your device.</>,
};

/** Short, consistent privacy disclosure for tools that handle potentially sensitive content. */
export function PrivacyNotice({ variant, className = "" }: { variant: Variant; className?: string }) {
  return (
    <p className={`rounded-lg border border-line bg-ink-2 px-4 py-3 text-sm text-fog ${className}`}>
      <span className="font-semibold text-white">Privacy: </span>
      {TEXT[variant]}{" "}
      <Link href="/privacy-policy/" className="text-cyan underline underline-offset-2">Privacy policy</Link>
    </p>
  );
}
