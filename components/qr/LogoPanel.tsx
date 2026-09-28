"use client";

import { userMessage } from "@/lib/errors";

import { useId, useRef, useState } from "react";
import { ColorField, Range, Toggle } from "@/components/ui/controls";
import { LOGO_ACCEPT, normaliseLogo } from "@/lib/qr/logo";
import type { LogoOptions, QrStyle } from "@/lib/qr/style";

type Set = <K extends keyof QrStyle>(key: K, value: QrStyle[K]) => void;

export function LogoPanel({ style, set }: { style: QrStyle; set: Set }) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{ kind: "idle" | "busy" | "error" | "ok"; msg?: string }>({ kind: "idle" });
  const [dragging, setDragging] = useState(false);
  const logo = style.logo;

  const update = (patch: Partial<LogoOptions>) => logo && set("logo", { ...logo, ...patch });

  const accept = async (file: File | undefined) => {
    if (!file) return;
    setStatus({ kind: "busy", msg: "Processing logo…" });
    try {
      const n = await normaliseLogo(file);
      set("logo", {
        ...n,
        size: logo?.size ?? 0.22,
        padding: logo?.padding ?? 0.08,
        background: logo?.background ?? true,
        backgroundColor: logo?.backgroundColor ?? "#ffffff",
        rounded: logo?.rounded ?? true,
        excavate: logo?.excavate ?? true,
      });
      if (style.ecc !== "H") set("ecc", "H");
      setStatus({ kind: "ok", msg: "Logo added. Error correction was set to High so the code stays readable." });
    } catch (e) {
      setStatus({ kind: "error", msg: userMessage(e, "The logo couldn't be added. Try a different image.") });
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); accept(e.dataTransfer.files[0]); }}
        className={`flex flex-col items-center gap-3 rounded-xl border border-dashed p-6 text-center ${dragging ? "border-cyan bg-cyan/5" : "border-line-2 bg-ink-2"}`}
      >
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo.dataUrl} alt="Current logo" className="h-16 w-16 rounded-lg bg-white/5 object-contain" />
        ) : (
          <svg viewBox="0 0 24 24" className="h-8 w-8 text-mist" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 16l4-4 4 4 3-3 5 5M4 4h16v16H4z" /><circle cx="15" cy="8.5" r="1.5" /></svg>
        )}
        <div>
          <label htmlFor={inputId} className="btn-secondary cursor-pointer">
            {logo ? "Replace logo" : "Upload logo"}
          </label>
          <input ref={inputRef} id={inputId} type="file" accept={LOGO_ACCEPT} className="sr-only" onChange={(e) => accept(e.target.files?.[0])} />
        </div>
        <p className="text-xs text-mist">PNG, JPG or SVG, up to 2 MB. Or drop a file here. Your logo stays in your browser.</p>
      </div>
      <p role="status" aria-live="polite" className={`text-sm ${status.kind === "error" ? "text-danger" : "text-mist"}`}>{status.msg}</p>

      {logo && (
        <div className="space-y-5">
          <Range label="Logo size" value={Math.round(logo.size * 100)} min={10} max={40} onChange={(v) => update({ size: v / 100 })} format={(v) => `${v}% of width`} />
          <Range label="Padding" value={Math.round(logo.padding * 100)} min={0} max={30} onChange={(v) => update({ padding: v / 100 })} format={(v) => `${v}%`} />
          <Toggle label="Clear the code behind the logo" checked={logo.excavate} onChange={(v) => update({ excavate: v })} hint="Recommended. Overlapping modules make the logo harder to see and don't help scanning." />
          <Toggle label="Logo background" checked={logo.background} onChange={(v) => update({ background: v })} />
          {logo.background && (
            <>
              <ColorField label="Logo background colour" value={logo.backgroundColor} onChange={(v) => update({ backgroundColor: v })} />
              <Toggle label="Rounded corners" checked={logo.rounded} onChange={(v) => update({ rounded: v })} />
            </>
          )}
          <button type="button" className="btn-ghost text-danger" onClick={() => { set("logo", null); setStatus({ kind: "idle", msg: "Logo removed." }); }}>
            Remove logo
          </button>
        </div>
      )}
    </div>
  );
}
