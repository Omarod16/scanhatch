"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { ColorField, Range, Segmented, SelectField, Toggle } from "@/components/ui/controls";
import { Tabs } from "@/components/ui/Tabs";
import { WarningList } from "@/components/ui/WarningList";
import { track } from "@/lib/analytics";
import {
  BARCODE_FORMATS, DEFAULT_FORMAT_OPTIONS, barcodeFormat, isBarcodeFormatId,
  type BarcodeFormat, type BarcodeFormatId, type CodabarGuard, type FormatOptions, type MsiCheck,
} from "@/lib/barcode/formats";
import {
  DEFAULT_BARCODE_STYLE, cleanBwipError, rasterSize, renderBarcode,
  type BarcodeStyle, type BwipLike, type Rotation,
} from "@/lib/barcode/render";
import { checkBarcode } from "@/lib/barcode/warnings";
import type { PageSize } from "@/lib/downloads/export";
import { safeHex } from "@/lib/qr/color";
import { BarcodeExport } from "./BarcodeExport";
import { FormatPicker } from "./FormatPicker";

const styleFor = (f: BarcodeFormat, prev: BarcodeStyle): BarcodeStyle => ({
  ...prev,
  quietZone: f.quietZone,
  moduleMm: f.moduleMm ?? prev.moduleMm,
  heightMm: f.heightMm ?? prev.heightMm,
  showText: f.id !== "pharmacode",
  textPlacement: f.textPlacement ? prev.textPlacement : "below",
});

const GUARDS: { value: CodabarGuard; label: string }[] = ["A", "B", "C", "D"].map((g) => ({ value: g as CodabarGuard, label: g }));

export function BarcodeGenerator() {
  const dataId = useId();
  const [formatId, setFormatId] = useState<BarcodeFormatId>("code128");
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [opts, setOpts] = useState<FormatOptions>(DEFAULT_FORMAT_OPTIONS);
  const [style, setStyle] = useState<BarcodeStyle>(() => styleFor(barcodeFormat("code128")!, DEFAULT_BARCODE_STYLE));
  const [dpi, setDpi] = useState(300);
  const [page, setPage] = useState<PageSize | "fit">("fit");
  const [tab, setTab] = useState("content");
  const [bwip, setBwip] = useState<BwipLike | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const tracked = useRef(new Set<string>());

  // bwip-js is only downloaded on this page.
  useEffect(() => {
    let alive = true;
    import("bwip-js/browser")
      .then((m) => alive && setBwip({ toSVG: (o) => m.toSVG(o as never) }))
      .catch(() => alive && setLoadError("The barcode engine couldn't load. Check your connection and reload the page."));
    return () => { alive = false; };
  }, []);

  const chooseFormat = useCallback((id: BarcodeFormatId, updateHash = true) => {
    const f = barcodeFormat(id)!;
    setFormatId(id);
    setStyle((s) => styleFor(f, s));
    setTouched(false);
    if (updateHash) history.replaceState(null, "", `#${id}`);
    track("tool_selected", { tool: `barcode-${id}` });
  }, []);

  useEffect(() => {
    const read = () => {
      const key = window.location.hash.slice(1);
      if (isBarcodeFormatId(key)) { chooseFormat(key, false); setTab("content"); }
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, [chooseFormat]);

  const format = barcodeFormat(formatId)!;
  const input = inputs[formatId] ?? "";
  const v = useMemo(() => format.validate(input, opts), [format, input, opts]);

  const out = useMemo(() => {
    if (!bwip || !v.ok) return { rendered: null, error: null as string | null };
    try {
      return { rendered: renderBarcode(bwip, format, v, style), error: null };
    } catch (e) {
      return { rendered: null, error: cleanBwipError(e) };
    }
  }, [bwip, format, v, style]);

  const warnings = useMemo(
    () => (out.rendered && v.ok ? checkBarcode(format, style, v, out.rendered, dpi) : []),
    [out.rendered, v, format, style, dpi]
  );

  useEffect(() => {
    if (out.rendered && !tracked.current.has(formatId)) {
      tracked.current.add(formatId);
      track("barcode_generated", { format: formatId });
    }
  }, [out.rendered, formatId]);

  const set = <K extends keyof BarcodeStyle>(k: K, val: BarcodeStyle[K]) => setStyle((s) => ({ ...s, [k]: val }));
  const showError = !v.ok && !v.empty && (touched || input.length > 0);
  const px = out.rendered ? rasterSize(out.rendered, dpi) : null;

  const contentTab = (
    <div className="space-y-6">
      <FormatPicker value={formatId} onChange={(id) => chooseFormat(id)} />

      <div>
        <label htmlFor={dataId} className="label">Barcode data</label>
        {format.kind === "2d" ? (
          <textarea
            id={dataId} className="input font-mono" rows={4} value={input} placeholder={format.placeholder}
            aria-invalid={showError || undefined} aria-describedby={`${dataId}-help`}
            onChange={(e) => setInputs((p) => ({ ...p, [formatId]: e.target.value }))} onBlur={() => setTouched(true)}
          />
        ) : (
          <input
            id={dataId} className="input font-mono" value={input} placeholder={format.placeholder} autoComplete="off" spellCheck={false}
            inputMode={["code128", "code39", "code93", "codabar"].includes(formatId) ? "text" : "numeric"}
            aria-invalid={showError || undefined} aria-describedby={`${dataId}-help`}
            onChange={(e) => setInputs((p) => ({ ...p, [formatId]: e.target.value }))} onBlur={() => setTouched(true)}
          />
        )}
        <div id={`${dataId}-help`}>
          {showError ? <p className="field-error" role="alert">{v.error}</p> : <p className="hint">{format.instructions}</p>}
        </div>
        {!input && (
          <button type="button" className="btn-ghost mt-2 min-h-9 px-2 text-sm" onClick={() => setInputs((p) => ({ ...p, [formatId]: format.example }))}>
            Use example data
          </button>
        )}
      </div>

      {formatId === "code39" && (
        <Toggle label="Add mod 43 check character" checked={opts.code39Check} onChange={(c) => setOpts((o) => ({ ...o, code39Check: c }))} hint="Optional. Only turn this on if your scanner or system expects it." />
      )}
      {formatId === "msi" && (
        <SelectField<MsiCheck>
          label="Check digit"
          value={opts.msiCheck}
          onChange={(c) => setOpts((o) => ({ ...o, msiCheck: c }))}
          options={[
            { value: "mod10", label: "Mod 10 (most common)" },
            { value: "mod1010", label: "Mod 10 + Mod 10" },
            { value: "mod11", label: "Mod 11" },
            { value: "mod1110", label: "Mod 11 + Mod 10" },
            { value: "none", label: "None" },
          ]}
          hint="Must match the setting on the scanner that will read it."
        />
      )}
      {formatId === "codabar" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Segmented<CodabarGuard> label="Start character" value={opts.codabarStart} options={GUARDS} onChange={(g) => setOpts((o) => ({ ...o, codabarStart: g }))} />
          <Segmented<CodabarGuard> label="Stop character" value={opts.codabarStop} options={GUARDS} onChange={(g) => setOpts((o) => ({ ...o, codabarStop: g }))} />
        </div>
      )}

      <p className="text-sm text-mist">
        <a href={`#guide-${formatId}`} className="text-cyan underline underline-offset-2">Read the {format.name} guide</a> for data rules, common mistakes and printing advice.
      </p>
    </div>
  );

  const designTab = (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <ColorField label="Bar colour" value={style.barColor} onChange={(c) => set("barColor", c)} />
        <ColorField label="Background" value={style.backgroundColor} onChange={(c) => set("backgroundColor", c)} disabled={style.transparent} />
      </div>
      <Toggle label="Transparent background" checked={style.transparent} onChange={(c) => set("transparent", c)} hint="PNG, SVG and PDF only. JPG uses the background colour." />
      {format.kind === "1d" && (
        <div className="space-y-4">
          <Toggle label="Show human-readable text" checked={style.showText} onChange={(c) => set("showText", c)} />
          {style.showText && (
            <>
              <Range label="Text size" value={style.textPt} min={6} max={18} onChange={(n) => set("textPt", n)} format={(n) => `${n} pt`} />
              {format.textPlacement && (
                <Segmented<"below" | "above"> label="Text position" value={style.textPlacement} onChange={(p) => set("textPlacement", p)} options={[{ value: "below", label: "Below" }, { value: "above", label: "Above" }]} />
              )}
            </>
          )}
        </div>
      )}
      <Segmented<Rotation>
        label="Rotation"
        value={style.rotate}
        onChange={(r) => set("rotate", r)}
        options={[{ value: "N", label: "0°" }, { value: "R", label: "90°" }, { value: "I", label: "180°" }, { value: "L", label: "270°" }]}
      />
    </div>
  );

  const sizeTab = (
    <div className="space-y-6">
      {format.kind === "1d" ? (
        <>
          <Range label="Module width (narrowest bar)" value={style.moduleMm} min={0.15} max={1.2} step={0.01} onChange={(n) => set("moduleMm", n)} format={(n) => `${n.toFixed(2)} mm`} />
          <p className="hint -mt-4">This sets the overall width. Recommended for {format.name}: {format.moduleMm} mm.</p>
          <Range label="Bar height" value={style.heightMm} min={3} max={60} step={0.5} onChange={(n) => set("heightMm", n)} format={(n) => `${n} mm`} />
        </>
      ) : (
        <Range label="Symbol size" value={style.sizeMm} min={5} max={100} step={1} onChange={(n) => set("sizeMm", n)} format={(n) => `${n} mm wide`} />
      )}
      <div>
        <Range label="Quiet zone (margin)" value={style.quietZone} min={0} max={24} onChange={(n) => set("quietZone", n)} format={(n) => `${n} modules`} />
        <p className="hint">
          Recommended for {format.name}: {format.quietZone} modules each side.{" "}
          {style.quietZone !== format.quietZone && (
            <button type="button" className="text-cyan underline underline-offset-2" onClick={() => set("quietZone", format.quietZone)}>Reset</button>
          )}
        </p>
      </div>
      <SelectField<string>
        label="Image resolution (PNG / JPG)"
        value={String(dpi)}
        onChange={(d) => setDpi(Number(d))}
        options={[{ value: "150", label: "150 dpi (screen, drafts)" }, { value: "300", label: "300 dpi (print)" }, { value: "600", label: "600 dpi (high-quality print)" }]}
        hint={px ? `Output: ${px.width} × ${px.height} px. Bars are snapped to whole pixels (${px.effectiveDpi} dpi effective).` : undefined}
      />
      <SelectField<PageSize | "fit">
        label="PDF page"
        value={page}
        onChange={setPage}
        options={[{ value: "fit", label: "Fit to barcode (label size)" }, { value: "a4", label: "A4" }, { value: "letter", label: "US Letter" }]}
      />
    </div>
  );

  const bg = safeHex(style.backgroundColor, "#ffffff");
  const infoNotes = v.ok ? v.notes : [];

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_440px]">
      <div className="min-w-0">
        <Tabs
          label="Barcode settings"
          active={tab}
          onChange={setTab}
          tabs={[
            { id: "content", label: "Content", content: contentTab },
            { id: "design", label: "Design", content: designTab },
            { id: "size", label: "Size", content: sizeTab },
          ]}
        />
      </div>

      <aside aria-label="Preview and download" className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-line bg-ink-2 p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-white">Preview</h2>
            <span className="text-xs text-mist">{format.name}</span>
          </div>
          <div className={`flex min-h-56 items-center justify-center overflow-hidden rounded-2xl border border-line p-4 ${style.transparent ? "checker" : "bg-panel"}`}>
            {out.rendered ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(out.rendered.svg)}`}
                alt={`${format.name} barcode encoding ${v.ok ? v.value : ""}`}
                className="h-auto max-h-72 w-full object-contain"
              />
            ) : (
              <p className={`max-w-xs text-center text-sm ${out.error || loadError ? "font-medium text-danger" : "text-mist"}`} role={out.error || loadError ? "alert" : undefined}>
                {loadError ?? out.error ?? (!bwip ? "Loading the barcode engine…" : showError ? "Fix the data to see your barcode." : "Enter barcode data to see a preview.")}
              </p>
            )}
          </div>
          {out.rendered && v.ok && (
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              <dt className="text-mist">Encodes</dt>
              <dd className="font-mono break-all text-white">{v.value}</dd>
              <dt className="text-mist">Print size</dt>
              <dd className="text-white">{out.rendered.widthMm.toFixed(1)} × {out.rendered.heightMm.toFixed(1)} mm</dd>
            </dl>
          )}
          <div className="mt-4">
            <WarningList warnings={warnings} notes={infoNotes} />
          </div>
          {out.rendered && <p className="mt-4 text-sm text-mist">Scan test recommended before printing.</p>}
          <div className="mt-5">
            <BarcodeExport rendered={out.rendered} formatId={formatId} dpi={dpi} page={page} background={bg} transparent={style.transparent} />
          </div>
        </div>
      </aside>
    </div>
  );
}

export const BARCODE_FORMAT_COUNT = BARCODE_FORMATS.length;
