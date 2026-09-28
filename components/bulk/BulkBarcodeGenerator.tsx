"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ColorField, Range, Segmented, SelectField, Toggle } from "@/components/ui/controls";
import { track } from "@/lib/analytics";
import { BARCODE_FORMATS, barcodeFormat, type BarcodeFormatId, type MsiCheck } from "@/lib/barcode/formats";
import { MSI_CHECK_LABELS } from "@/lib/barcode/msi";
import { DEFAULT_BARCODE_STYLE, cleanBwipError, rasterSize, renderBarcode, type BarcodeStyle, type BwipLike } from "@/lib/barcode/render";
import { MAX_RASTER_PX } from "@/lib/barcode/warnings";
import { BARCODE_COLUMNS, checkBarcodeRows, type BarcodePlan } from "@/lib/bulk/barcode";
import { createNameAllocator } from "@/lib/bulk/filenames";
import { MAX_BATCH_ROWS } from "@/lib/bulk/limits";
import { createRasterizer } from "@/lib/bulk/raster";
import { errorReportCsv, type BulkRow } from "@/lib/bulk/rows";
import { BARCODE_TEMPLATES } from "@/lib/bulk/templates";
import { findColumn } from "@/lib/csv/read";
import { csvBlob, toCsv } from "@/lib/csv/write";
import { downloadBlob } from "@/lib/downloads/export";
import { BatchSummary } from "./BatchSummary";
import { CsvUpload } from "./CsvUpload";
import { ProgressPanel } from "./ProgressPanel";
import { RowTable } from "./RowTable";
import { StepList } from "./StepList";
import { useBatchRunner, useCsvTable, zipStamp } from "./useBulk";

const enc = new TextEncoder();

interface BulkBarcodeDesign {
  barColor: string;
  backgroundColor: string;
  recommendedSize: boolean;
  moduleMm: number;
  heightMm: number;
  sizeMm: number;
  recommendedQuiet: boolean;
  quietZone: number;
  showText: boolean;
  dpi: number;
  format: "png" | "svg";
}
const DEFAULT_DESIGN: BulkBarcodeDesign = {
  barColor: "#000000", backgroundColor: "#ffffff", recommendedSize: true, moduleMm: 0.33, heightMm: 15, sizeMm: 25,
  recommendedQuiet: true, quietZone: 10, showText: true, dpi: 300, format: "png",
};

function styleFor(id: BarcodeFormatId, d: BulkBarcodeDesign): BarcodeStyle {
  const f = barcodeFormat(id)!;
  return {
    ...DEFAULT_BARCODE_STYLE,
    barColor: d.barColor,
    backgroundColor: d.backgroundColor,
    transparent: false,
    moduleMm: d.recommendedSize ? f.moduleMm ?? 0.33 : d.moduleMm,
    heightMm: d.recommendedSize ? f.heightMm ?? 15 : d.heightMm,
    sizeMm: d.recommendedSize ? 25 : d.sizeMm,
    quietZone: d.recommendedQuiet ? f.quietZone : d.quietZone,
    showText: d.showText && id !== "pharmacode",
  };
}

async function loadBwip(): Promise<BwipLike> {
  const m = await import("bwip-js/browser");
  return { toSVG: (o) => m.toSVG(o as never) };
}

export function BulkBarcodeGenerator() {
  const csv = useCsvTable();
  const batch = useBatchRunner();
  const [defaultType, setDefaultType] = useState<BarcodeFormatId>("code128");
  const [autoCheckDigit, setAutoCheckDigit] = useState(false);
  const [msiCheck, setMsiCheck] = useState<MsiCheck>("mod10");
  const [design, setDesign] = useState<BulkBarcodeDesign>(DEFAULT_DESIGN);
  const [includeDuplicates, setIncludeDuplicates] = useState(true);
  const [bwip, setBwip] = useState<BwipLike | null>(null);

  const check = useMemo(() => (csv.table ? checkBarcodeRows(csv.table, { defaultType, autoCheckDigit, msiCheck }) : null), [csv.table, defaultType, autoCheckDigit, msiCheck]);
  const rows = useMemo(() => check?.rows ?? [], [check]);
  const planned = useMemo(() => rows.filter((r) => r.valid && (includeDuplicates || r.duplicateOf === undefined)), [rows, includeDuplicates]);
  const fileNames = useMemo(() => {
    const alloc = createNameAllocator(["index.csv", "skipped-rows.csv"]);
    return new Map(planned.map((r) => [r.row, alloc(r.name || r.output, `row-${String(r.row).padStart(3, "0")}`, design.format)]));
  }, [planned, design.format]);
  const hasMsi = rows.some((r) => (r.plan as BarcodePlan | undefined)?.formatId === "msi") || (!check?.hasTypeColumn && defaultType === "msi");

  // Load the barcode engine once a file is loaded (not on page load).
  useEffect(() => { if (csv.table && !bwip) loadBwip().then(setBwip).catch(() => undefined); }, [csv.table, bwip]);

  const sample = planned[0];
  const sampleSvg = useMemo(() => {
    const p = sample?.plan as BarcodePlan | undefined;
    if (!p || !bwip) return null;
    try { return renderBarcode(bwip, barcodeFormat(p.formatId)!, p.validation, styleFor(p.formatId, design)).svg; } catch { return null; }
  }, [sample, bwip, design]);

  const set = <K extends keyof BulkBarcodeDesign>(k: K, v: BulkBarcodeDesign[K]) => { setDesign((d) => ({ ...d, [k]: v })); if (batch.phase === "done") batch.reset(); };

  const { table, edit } = csv;
  const resetBatch = batch.reset;
  const onErrorReport = useCallback(() => downloadBlob(csvBlob(errorReportCsv(rows, "value")), "scanhatch-barcode-errors.csv"), [rows]);
  const fileWarnings = useMemo(() => [...(table?.warnings ?? []), ...(check?.warnings ?? [])], [table, check]);
  const onFix = useCallback((row: number, value: string, name?: string) => {
    if (!table) return;
    edit(row, findColumn(table.headers, BARCODE_COLUMNS.value), value);
    if (name !== undefined) edit(row, findColumn(table.headers, BARCODE_COLUMNS.name), name);
    resetBatch();
  }, [table, edit, resetBatch]);

  const generate = () => {
    const items = planned;
    track("bulk_barcode_started", { count: items.length });
    let engine: BwipLike | null = bwip;
    let raster: ReturnType<typeof createRasterizer> | null = null;
    batch.start(items, async (r: BulkRow) => {
      const p = r.plan as BarcodePlan;
      const f = barcodeFormat(p.formatId)!;
      let rendered;
      try { rendered = renderBarcode(engine!, f, p.validation, styleFor(p.formatId, design)); }
      catch (e) { throw new Error(cleanBwipError(e)); }
      const name = fileNames.get(r.row)!;
      if (design.format === "svg") return { name, data: enc.encode(rendered.svg), compress: true };
      const px = rasterSize(rendered, design.dpi);
      if (px.width > MAX_RASTER_PX || px.height > MAX_RASTER_PX) throw new Error(`Image would be ${px.width} × ${px.height} px; lower the resolution or use SVG.`);
      return { name, data: await raster!.toPng(rendered.svg, px.width, px.height, design.backgroundColor), compress: false };
    }, {
      zipName: `scanhatch-barcodes-${zipStamp()}.zip`,
      prepare: async () => { engine ??= await loadBwip(); raster = createRasterizer(); },
      extra: (failures) => {
        raster?.dispose();
        const index = toCsv([["row", "file", "name", "type", "value"], ...items.map((r) => [r.row, fileNames.get(r.row)!, r.name, r.typeLabel, r.output])]);
        const skipped = [...rows.filter((r) => !r.valid).flatMap((r) => r.errors.map((e) => [r.row, r.name, r.input, e])),
          ...failures.map((f) => [items[f.index].row, items[f.index].name, items[f.index].input, f.error])];
        const files = [{ name: "index.csv", data: enc.encode(index), compress: true }];
        if (skipped.length) files.push({ name: "skipped-rows.csv", data: enc.encode(toCsv([["row", "name", "value", "error"], ...skipped])), compress: true });
        return files;
      },
      onDone: (n) => track("bulk_barcode_completed", { count: n }),
    });
  };

  const step = !csv.table ? 0 : batch.phase === "done" ? 4 : batch.running ? 3 : 1;
  const invalid = rows.filter((r) => !r.valid).length;

  return (
    <div>
      <StepList current={step} />
      <CsvUpload
        templates={BARCODE_TEMPLATES} onFile={(f) => { batch.reset(); csv.load(f); }} busy={csv.busy} fileName={csv.fileName}
        intro={<>
          <h2 className="text-xl font-bold text-white">Upload a CSV file</h2>
          <p className="mt-2 text-fog">Generate hundreds of barcodes from a CSV file directly in your browser. Your data stays on your device.</p>
          <p className="mt-2 text-sm text-mist">Maximum {MAX_BATCH_ROWS} barcodes per batch, CSV up to 1 MB. Formats can be mixed in one file.</p>
        </>}
      />
      {csv.error && <p className="mt-4 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-red-100" role="alert">{csv.error}</p>}
      {check?.fileError && <p className="mt-4 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-red-100" role="alert">{check.fileError}</p>}

      {csv.table && check && !check.fileError && (
        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section aria-labelledby="bb-review" className="min-w-0 space-y-4">
            <h2 id="bb-review" className="text-xl font-bold text-white">Review rows</h2>
            <BatchSummary rows={rows} includeDuplicates={includeDuplicates} onIncludeDuplicates={setIncludeDuplicates}
              warnings={fileWarnings}
              onErrorReport={onErrorReport} />
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField<BarcodeFormatId> label={check.hasTypeColumn ? "Format for rows with no type" : "Barcode format for every row"} value={defaultType} onChange={setDefaultType}
                options={BARCODE_FORMATS.map((f) => ({ value: f.id, label: f.name }))} />
              {hasMsi && (
                <SelectField<MsiCheck> label="MSI check digit" value={msiCheck} onChange={setMsiCheck}
                  options={(["mod10", "mod1010", "mod11", "mod1110", "none"] as MsiCheck[]).map((k) => ({ value: k, label: MSI_CHECK_LABELS[k] }))} />
              )}
            </div>
            <Toggle label="Automatically calculate missing check digits" checked={autoCheckDigit} onChange={setAutoCheckDigit}
              hint="For EAN-13, EAN-8, UPC-A, UPC-E and ITF-14 values that are one digit short. Every added digit is shown in the table." />
            <RowTable rows={rows} valueLabel="Value" fileNames={fileNames} includeDuplicates={includeDuplicates} canEditName={check.hasNameColumn} onFix={onFix} />
          </section>

          <section aria-labelledby="bb-design" className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <h2 id="bb-design" className="text-xl font-bold text-white">Customize</h2>
            <div className="space-y-5 rounded-2xl border border-line bg-ink-2 p-4 sm:p-5">
              {sampleSvg && sample && (
                <div className="space-y-2">
                  <div className="flex h-28 items-center justify-center rounded-lg bg-white p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(sampleSvg)}`} alt={`Sample using row ${sample.row}`} className="max-h-full max-w-full" />
                  </div>
                  <p className="text-sm text-mist">Sample: row {sample.row} ({sample.typeLabel}).</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <ColorField label="Bar colour" value={design.barColor} onChange={(c) => set("barColor", c)} />
                <ColorField label="Background" value={design.backgroundColor} onChange={(c) => set("backgroundColor", c)} />
              </div>
              <Toggle label="Recommended size for each format" checked={design.recommendedSize} onChange={(v) => set("recommendedSize", v)}
                hint="Each format uses its standard bar width and height (for example 0.33 mm bars for EAN-13)." />
              {!design.recommendedSize && (
                <>
                  <Range label="Bar width (narrowest bar)" value={design.moduleMm} min={0.15} max={1.2} step={0.01} onChange={(n) => set("moduleMm", n)} format={(n) => `${n.toFixed(2)} mm`} />
                  <Range label="Bar height" value={design.heightMm} min={3} max={60} step={0.5} onChange={(n) => set("heightMm", n)} format={(n) => `${n} mm`} />
                  <Range label="2D code size" value={design.sizeMm} min={5} max={100} onChange={(n) => set("sizeMm", n)} format={(n) => `${n} mm`} />
                </>
              )}
              <Toggle label="Recommended margin for each format" checked={design.recommendedQuiet} onChange={(v) => set("recommendedQuiet", v)} />
              {!design.recommendedQuiet && <Range label="Margin (quiet zone)" value={design.quietZone} min={0} max={24} onChange={(n) => set("quietZone", n)} format={(n) => `${n} modules`} />}
              <Toggle label="Show human-readable text" checked={design.showText} onChange={(v) => set("showText", v)} hint="Linear barcodes only. Pharmacode never shows text." />
              <SelectField<string> label="Resolution (PNG)" value={String(design.dpi)} onChange={(v) => set("dpi", Number(v))}
                options={[{ value: "150", label: "150 dpi" }, { value: "300", label: "300 dpi (print)" }, { value: "600", label: "600 dpi" }]} />
              <Segmented<"png" | "svg"> label="Output format" value={design.format} onChange={(f) => set("format", f)} options={[{ value: "png", label: "PNG" }, { value: "svg", label: "SVG" }]} />
              <p className="hint -mt-3">Use PNG/SVG for bulk downloads. PDF is available in the individual barcode generator.</p>
            </div>
            <div className="space-y-3">
              <button type="button" className="btn-primary w-full" disabled={!planned.length || batch.running} onClick={generate}>
                {planned.length === 0 ? "No valid rows to generate" : invalid ? `Generate ${planned.length} valid rows (skip ${invalid} invalid)` : `Generate ${planned.length} barcode${planned.length === 1 ? "" : "s"}`}
              </button>
              <ProgressPanel phase={batch.phase} done={batch.done} total={batch.total} onCancel={batch.cancel} message={batch.message} />
              {batch.zip && batch.phase === "done" && (
                <a href={batch.zip.url} download={batch.zip.name} className="btn-primary w-full">Download ZIP ({(batch.zip.size / 1024 / 1024).toFixed(1)} MB)</a>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
