"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LogoMark } from "./Logo";
import { NAV_LINKS } from "./nav";
import { ToolSearch } from "./ToolSearch";

const linkClass = "rounded-lg px-2 py-2 text-sm font-medium text-fog hover:bg-panel hover:text-white lg:px-3";

export function Header() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open && !searchOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (open) { setOpen(false); buttonRef.current?.focus(); }
      // The search box handles Escape itself first (clearing text / closing results).
      else if (searchOpen && !(e.target instanceof HTMLInputElement && e.target.value)) { setSearchOpen(false); searchButtonRef.current?.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, searchOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-ink/85 backdrop-blur">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-cyan focus:px-3 focus:py-2 focus:text-ink">
        Skip to content
      </a>
      <div className="container-page flex h-16 items-center gap-3 lg:gap-4">
        <Link prefetch={false} href="/" className="flex shrink-0 items-center gap-2.5 font-extrabold tracking-tight text-white" onClick={() => { setOpen(false); setSearchOpen(false); }}>
          <LogoMark className="h-8 w-8" />
          <span className="text-lg">ScanHatch</span>
        </Link>

        <nav aria-label="Main" className="hidden min-w-0 flex-1 items-center gap-2 md:flex">
          <ul className="flex items-center">
            {NAV_LINKS.map((l) => (
              <li key={l.href}><Link prefetch={false} href={l.href} className={linkClass}>{l.label}</Link></li>
            ))}
          </ul>
          <div className="ml-auto hidden lg:block"><ToolSearch /></div>
        </nav>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <button
            ref={searchButtonRef}
            type="button"
            className="btn-ghost min-h-10 px-3 lg:hidden"
            aria-expanded={searchOpen}
            aria-controls="header-search"
            onClick={() => { setSearchOpen((v) => !v); setOpen(false); }}
          >
            <span className="sr-only">{searchOpen ? "Close search" : "Search tools"}</span>
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {searchOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>}
            </svg>
          </button>
          <button
            ref={buttonRef}
            type="button"
            className="btn-ghost min-h-10 px-3 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => { setOpen((v) => !v); setSearchOpen(false); }}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {searchOpen && (
        <div id="header-search" className="border-t border-line bg-ink lg:hidden">
          <div className="container-page py-3">
            <ToolSearch variant="panel" autoFocus onNavigate={() => setSearchOpen(false)} />
          </div>
        </div>
      )}

      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-line bg-ink md:hidden">
          <ul className="container-page flex flex-col py-3">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link prefetch={false} href={l.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 text-base font-medium text-fog hover:bg-panel hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
