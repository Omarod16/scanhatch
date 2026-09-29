import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  description: "This page doesn't exist on ScanHatch.",
};

export default function NotFound() {
  return (
    <div className="container-page py-28 text-center">
      <p className="text-sm font-semibold text-cyan">404</p>
      <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">This page doesn&apos;t exist</h1>
      <p className="mx-auto mt-4 max-w-md text-mist">The page you&apos;re looking for doesn&apos;t exist or may have moved.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/qr-code-generator/" className="btn-primary">Create a QR code</Link>
        <Link href="/tools/" className="btn-secondary">See all tools</Link>
      </div>
    </div>
  );
}
