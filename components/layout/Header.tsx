"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LogoMark } from "./Logo";
import { NAV_LINKS } from "./nav";

export function Header() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-ink/85 backdrop-blur">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-cyan focus:px-3 focus:py-2 focus:text-ink">
        Skip to content
      </a>
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2.5 font-extrabold tracking-tight text-white" onClick={() => setOpen(false)}>
          <LogoMark className="h-8 w-8" />
          <span className="text-lg">ScanHatch</span>
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="rounded-lg px-3 py-2 text-sm font-medium text-fog hover:bg-panel hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/qr-code-generator/" className="btn-primary hidden min-h-10 sm:inline-flex">
            Create QR
          </Link>
          <button
            ref={buttonRef}
            type="button"
            className="btn-ghost min-h-10 px-3 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-line bg-ink md:hidden">
          <ul className="container-page flex flex-col py-3">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 text-base font-medium text-fog hover:bg-panel hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="mt-2 px-3 pb-2">
              <Link href="/qr-code-generator/" onClick={() => setOpen(false)} className="btn-primary w-full">
                Create QR
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
