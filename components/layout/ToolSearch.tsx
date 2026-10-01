"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { TOOL_KEYWORDS } from "@/lib/toolKeywords";
import { CATEGORY_LABELS, TOOLS, type Tool } from "@/lib/tools";

const LIVE = TOOLS.filter((t) => t.status === "live");
const MAX_RESULTS = 8;
const compact = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Names, categories and curated keywords (descriptions contain incidental words). */
function search(query: string): Tool[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const q = compact(query);
  const has = (text: string, w: string) => text.toLowerCase().includes(w) || (compact(w) !== "" && compact(text).includes(compact(w)));
  return LIVE
    .filter((t) => words.every((w) => has(`${t.name} ${CATEGORY_LABELS[t.category]} ${TOOL_KEYWORDS[t.id] ?? ""}`, w)))
    .map((t, i) => {
      const name = compact(t.name);
      // Rank: whole query in the name, then every word in the name, then keyword-only matches.
      const rank = name.includes(q) ? 0 : words.every((w) => has(t.name, w)) ? 1 : 2;
      return { t, rank, pos: name.indexOf(q), i };
    })
    .sort((a, b) => a.rank - b.rank || (a.pos === -1 ? 99 : a.pos) - (b.pos === -1 ? 99 : b.pos) || a.i - b.i)
    .slice(0, MAX_RESULTS)
    .map((x) => x.t);
}

/**
 * "Search tools…" box for the header. Filters ScanHatch's own tool list in the browser;
 * nothing typed is sent anywhere. `variant="panel"` is the full-width version used on
 * smaller screens (opened from the header's search button).
 */
export function ToolSearch({ variant = "inline", autoFocus = false, onNavigate }: {
  variant?: "inline" | "panel";
  autoFocus?: boolean;
  /** Called after a result is chosen (e.g. to close the mobile panel). */
  onNavigate?: () => void;
}) {
  const id = useId();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => search(query), [query]);
  const searching = query.trim() !== "";
  const showList = open && searching;

  useEffect(() => { if (autoFocus) inputRef.current?.focus(); }, [autoFocus]);

  // Close the dropdown when clicking or focusing outside the search box.
  useEffect(() => {
    if (!showList) return;
    const onDown = (e: Event) => { if (!boxRef.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("focusin", onDown);
    return () => { document.removeEventListener("pointerdown", onDown); document.removeEventListener("focusin", onDown); };
  }, [showList]);

  const done = () => { setQuery(""); setOpen(false); onNavigate?.(); };
  const links = () => [...(boxRef.current?.querySelectorAll<HTMLAnchorElement>("[data-result]") ?? [])];

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && results[0]) { e.preventDefault(); router.push(results[0].href); done(); }
    if (e.key === "ArrowDown" && results.length) { e.preventDefault(); links()[0]?.focus(); }
    if (e.key === "Escape") { if (searching) setQuery(""); else setOpen(false); }
  };
  const onListKey = (e: React.KeyboardEvent) => {
    const all = links(); const i = all.indexOf(document.activeElement as HTMLAnchorElement);
    if (e.key === "ArrowDown") { e.preventDefault(); all[Math.min(i + 1, all.length - 1)]?.focus(); }
    if (e.key === "ArrowUp") { e.preventDefault(); if (i <= 0) inputRef.current?.focus(); else all[i - 1]?.focus(); }
    if (e.key === "Escape") { e.preventDefault(); inputRef.current?.focus(); setOpen(false); }
  };

  const panel = variant === "panel";
  return (
    <div ref={boxRef} className={`relative ${panel ? "w-full" : "w-44 xl:w-56"}`}>
      <label htmlFor={`${id}-q`} className="sr-only">Search tools</label>
      <div className="relative">
      <svg viewBox="0 0 24 24" aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-mist" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
      </svg>
      <input
        ref={inputRef}
        id={`${id}-q`}
        type="search"
        autoComplete="off"
        placeholder="Search tools…"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onInputKey}
        aria-describedby={`${id}-count`}
        className={`input min-h-10 pl-9 text-sm [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-cancel-button]:appearance-none ${panel ? "" : "py-1.5"}`}
      />
      </div>
      <p id={`${id}-count`} role="status" className="sr-only">
        {searching ? (results.length === 1 ? "1 tool found" : `${results.length} tools found`) : ""}
      </p>
      {showList && (
        <div
          id={`${id}-results`}
          onKeyDown={onListKey}
          className={`${panel ? "mt-2" : "absolute right-0 mt-2 w-80"} z-50 overflow-hidden rounded-xl border border-line-2 bg-ink-2 shadow-lg`}
        >
          {results.length ? (
            <ul className="py-1">
              {results.map((t) => (
                <li key={t.id}>
                  <Link prefetch={false} data-result href={t.href} onClick={done}
                    className="block px-4 py-2.5 text-sm hover:bg-panel focus:bg-panel focus:outline-none">
                    <span className="font-semibold text-white">{t.name}</span>
                    <span className="block text-xs text-mist">{CATEGORY_LABELS[t.category]}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-3 text-sm text-fog">
              No tools match. <Link prefetch={false} href="/tools/" onClick={done} className="text-cyan underline underline-offset-2">See all tools</Link>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
