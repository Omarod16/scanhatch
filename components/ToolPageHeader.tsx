import Link from "next/link";
import type { ReactNode } from "react";

export function ToolPageHeader({ name, title, children }: { name: string; title: string; children: ReactNode }) {
  return (
    <div className="container-page pt-8 pb-4 sm:pt-12">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-mist">
        <ol className="flex gap-2">
          <li><Link href="/" className="hover:text-white">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-fog">{name}</li>
        </ol>
      </nav>
      <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{title}</h1>
      <div className="mt-3 max-w-2xl text-fog">{children}</div>
    </div>
  );
}
