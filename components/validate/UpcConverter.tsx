"use client";

import { useId, useMemo, useState } from "react";
import { gs1CheckDigit, upcABodyToUpcE, upcEToUpcABody } from "@/lib/barcode/checkdigit";

const RULES: Record<string, string> = {
  "0": "UPC-E ending in 0, 1 or 2: the manufacturer code ends in that digit followed by 00, and the item number is 00 plus three digits.",
  "1": "UPC-E ending in 0, 1 or 2: the manufacturer code ends in that digit followed by 00, and the item number is 00 plus three digits.",
  "2": "UPC-E ending in 0, 1 or 2: the manufacturer code ends in that digit followed by 00, and the item number is 00 plus three digits.",
  "3": "UPC-E ending in 3: the manufacturer code ends in 00, and the item number is 000 plus two digits.",
  "4": "UPC-E ending in 4: the manufacturer code ends in 0, and the item number is 0000 plus one digit.",
  "5": "UPC-E ending in 5–9: the item number is 0000 followed by that digit (5–9).",
};
const rule = (e: string) => RULES[e[6]] ?? RULES["5"];

type Out =
  | { kind: "empty" }
  | { kind: "error"; message: string }
  | { kind: "ok"; direction: "e2a" | "a2e"; upce: string; upca: string; note: string };

export function UpcConverter() {
  const id = useId();
  const [raw, setRaw] = useState("");
  const out = useMemo<Out>(() => {
    const v = raw.replace(/[\s-]/g, "");
    if (!v) return { kind: "empty" };
    if (!/^\d+$/.test(v)) return { kind: "error", message: "Use digits only." };
    if (v.length === 6) return { kind: "error", message: "Add the number system digit (0 or 1) at the start. Most UPC-E codes start with 0." };
    if (v.length === 7 || v.length === 8) {
      if (!"01".includes(v[0])) return { kind: "error", message: `UPC-E must start with number system 0 or 1, not ${v[0]}.` };
      const a = upcEToUpcABody(v.slice(0, 7))!;
      const c = gs1CheckDigit(a);
      if (v.length === 8 && Number(v[7]) !== c) return { kind: "error", message: `Invalid check digit: this UPC-E should end in ${c}, not ${v[7]}. The check digit comes from the expanded UPC-A.` };
      return { kind: "ok", direction: "e2a", upce: v.slice(0, 7) + c, upca: a + c, note: rule(v.slice(0, 7)) };
    }
    if (v.length === 11 || v.length === 12) {
      const body = v.slice(0, 11);
      const c = gs1CheckDigit(body);
      if (v.length === 12 && Number(v[11]) !== c) return { kind: "error", message: `Invalid check digit: this UPC-A should end in ${c}, not ${v[11]}.` };
      if (!"01".includes(v[0])) return { kind: "error", message: `Only UPC-A numbers starting with 0 or 1 can be shortened to UPC-E. This one starts with ${v[0]}.` };
      const e = upcABodyToUpcE(body);
      if (!e) return { kind: "error", message: `${body}${c} can't be shortened to UPC-E. UPC-E only works when the number has zeros in one of the specific patterns below. This number must stay as UPC-A.` };
      return { kind: "ok", direction: "a2e", upce: e + c, upca: body + c, note: rule(e) };
    }
    return { kind: "error", message: `Enter a UPC-E (7 or 8 digits) or a UPC-A (11 or 12 digits). You entered ${v.length} digits.` };
  }, [raw]);

  return (
    <div className="rounded-2xl border border-line bg-ink-2 p-4 sm:p-6">
      <label htmlFor={`${id}-u`} className="label">UPC-E or UPC-A number</label>
      <input id={`${id}-u`} className="input font-mono" inputMode="numeric" autoComplete="off" value={raw} placeholder="04252614 or 042100005264"
        aria-describedby={`${id}-r`} onChange={(e) => setRaw(e.target.value)} />
      <div id={`${id}-r`} aria-live="polite" className="mt-3">
        {out.kind === "empty" && <p className="hint">The direction is detected automatically from the number of digits.</p>}
        {out.kind === "error" && <p className="field-error" role="alert">{out.message}</p>}
        {out.kind === "ok" && (
          <div className="space-y-3">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              <dt className="text-mist">UPC-E</dt><dd className="font-mono text-lg text-white">{out.upce}</dd>
              <dt className="text-mist">UPC-A</dt><dd className="font-mono text-lg text-white">{out.upca}</dd>
              <dt className="text-mist">GTIN-13</dt><dd className="font-mono text-white">0{out.upca}</dd>
            </dl>
            <p className="text-sm text-fog"><span className="font-semibold text-white">{out.direction === "e2a" ? "Expanded" : "Shortened"}.</span> {out.note}</p>
          </div>
        )}
      </div>
    </div>
  );
}
