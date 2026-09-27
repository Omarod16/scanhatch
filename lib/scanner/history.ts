"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Session-only scan history. Stored in sessionStorage, so it lives only in
 * this browser tab and is deleted when the tab is closed. Never sent anywhere.
 */
export interface HistoryEntry {
  id: string;
  at: number;
  format: string;
  value: string;
  source: "camera" | "image";
}

const KEY = "scanhatch:scan-history";
const MAX = 25;
const EVENT = "scanhatch-history";

function read(): HistoryEntry[] {
  try {
    const raw = sessionStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
    return Array.isArray(list) ? list.filter((e) => typeof e?.value === "string") : [];
  } catch {
    return [];
  }
}

function write(list: HistoryEntry[]) {
  try {
    if (list.length) sessionStorage.setItem(KEY, JSON.stringify(list));
    else sessionStorage.removeItem(KEY);
  } catch {
    // Storage may be disabled (private mode); history then simply isn't kept.
  }
  window.dispatchEvent(new Event(EVENT));
}

export function useScanHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const sync = () => setEntries(read());
    sync();
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);

  const add = useCallback((e: Omit<HistoryEntry, "id" | "at">) => {
    const list = read();
    const last = list[0];
    if (last && last.value === e.value && last.format === e.format && Date.now() - last.at < 3000) return;
    write([{ ...e, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, at: Date.now() }, ...list].slice(0, MAX));
  }, []);

  const remove = useCallback((id: string) => write(read().filter((x) => x.id !== id)), []);
  const clear = useCallback(() => write([]), []);

  return { entries, add, remove, clear };
}
