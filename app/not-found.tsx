import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page py-28 text-center">
      <p className="text-sm font-semibold text-cyan">404</p>
      <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">This page doesn&apos;t exist</h1>
      <p className="mx-auto mt-4 max-w-md text-mist">The link may be out of date, or the tool may still be in development.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/qr-code-generator/" className="btn-primary">Create a QR code</Link>
        <Link href="/tools/" className="btn-secondary">See all tools</Link>
      </div>
    </div>
  );
}
