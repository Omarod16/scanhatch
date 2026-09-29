"use client";

import { userMessage } from "@/lib/errors";

import { useCallback, useMemo, useState } from "react";
import { ColorField, Range, Segmented, SelectField } from "@/components/ui/controls";
import { WarningList } from "@/components/ui/WarningList";
import { track } from "@/lib/analytics";
import { createNameAllocator } from "@/lib/bulk/filenames";
import { MAX_BATCH_ROWS } from "@/lib/bulk/limits";
import { checkQrRows, DEFAULT_BULK_QR_DESIGN, QR_COLUMNS, bulkQrStyle, renderBulkQrSvg, type BulkQrDesign, type BulkQrType } from "@/lib/bulk/qr";
import { createRasterizer } from "@/lib/bulk/raster";
import { errorReportCsv, type BulkRow } from "@/lib/bulk/rows";
import { QR_TEMPLATES } from "@/lib/bulk/templates";
import { findColumn } from "@/lib/csv/read";
import { csvBlob, toCsv } from "@/lib/csv/write";
import { downloadBlob } from "@/lib/downloads/export";
import { LOGO_ACCEPT, normaliseLogo } from "@/lib/qr/logo";
import { buildMatrix, type Ecc } from "@/lib/qr/matrix";
import { checkReadability } from "@/lib/qr/warnings";
import { PrivacyNotice } from "@/components/privacy/PrivacyNotice";
import { BatchSummary } from "./BatchSummary";
import { CsvUpload } from "./CsvUpload";
import { ProgressPanel } from "./ProgressPanel";
import { RowTable } from "./RowTable";
import { StepList } from "./StepList";
import { useBatchRunner, useCsvTable, zipStamp } from "./useBulk";

const enc = new TextEncoder();

export function BulkQrGenerator() {
  const csv = useCsvTable();
  const batch = useBatchRunner();
  const [defaultType, setDefaultType] = useState<BulkQrType>("auto");
  const [design, setDesign] = useState<BulkQrDesign>(DEFAULT_BULK_QR_DESIGN);
  const [includeDuplicates, setIncludeDuplicates] = useState(true);
  const [logoError, setLogoError] = useState<string | null>(null);
  const ecc: Ecc = design.logo ? "H" : design.ecc;

  const check = useMemo(() => (csv.table ? checkQrRows(csv.table, { defaultType, ecc }) : null), [csv.table, defaultType, ecc]);
  const rows = useMemo(() => check?.rows ?? [], [check]);
  const planned = useMemo(() => rows.filter((r) => r.valid && (includeDuplicates || r.duplicateOf === undefined)), [rows, includeDuplicates]);
  const fileNames = useMemo(() => {
    const alloc = createNameAllocator(["index.csv", "skipped-rows.csv"]);
    return new Map(planned.map((r) => [r.row, alloc(r.name, `row-${String(r.row).padStart(3, "0")}`, design.format)]));
  }, [planned, design.format]);

  const sample = planned[0];
  const sampleSvg = useMemo(() => (sample?.plan ? renderBulkQrSvg(sample.plan.payload, { ...design, sizePx: 240 }, "Sample QR code") : null), [sample, design]);
  const sampleWarnings = useMemo(() => {
    if (!sample?.plan) return [];
    const style = bulkQrStyle(design);
    return checkReadability(buildMatrix(sample.plan.payload, style.ecc), style, sample.plan.payload.length);
  }, [sample, design]);

  const set = <K extends keyof BulkQrDesign>(k: K, v: BulkQrDesign[K]) => { setDesign((d) => ({ ...d, [k]: v })); if (batch.phase === "done") batch.reset(); };

  const { table, edit } = csv;
  const resetBatch = batch.reset;
  const onErrorReport = useCallback(() => downloadBlob(csvBlob(errorReportCsv(rows, "data")), "scanhatch-qr-errors.csv"), [rows]);
  const fileWarnings = useMemo(() => [...(table?.warnings ?? []), ...(check?.warnings ?? [])], [table, check]);
  const onFix = useCallback((row: number, value: string, name?: string) => {
    if (!table) return;
    edit(row, findColumn(table.headers, QR_COLUMNS.data), value);
    if (name !== undefined) edit(row, findColumn(table.headers, QR_COLUMNS.name), name);
    resetBatch();
  }, [table, edit, resetBatch]);

  const onLogo = async (file: File | undefined) => {
    setLogoError(null);
    if (!file) return;
    try {
      const l = await normaliseLogo(file);
      set("logo", { ...l, size: 0.22 });
    } catch (e) {
      setLogoError(userMessage(e, "This logo couldn't be used. Try a different image."));
    }
  };

  const generate = () => {
    const items = planned;
    track("bulk_qr_started", { count: items.length });
    let raster: ReturnType<typeof createRasterizer> | null = null;
    batch.start(items, async (r: BulkRow) => {
      const payload = (r.plan as { payload: string }).payload;
      const svg = renderBulkQrSvg(payload, design, r.name || `QR code row ${r.row}`);
      const name = fileNames.get(r.row)!;
      if (design.format === "svg") return { name, data: enc.encode(svg), compress: true };
      return { name, data: await raster!.toPng(svg, design.sizePx, design.sizePx), compress: false };
    }, {
      zipName: `scanhatch-qr-codes-${zipStamp()}.zip`,
      prepare: async () => { raster = createRasterizer(); },
      extra: (failures) => {
        raster?.dispose();
        const index = toCsv([["row", "file", "name", "type", "data"], ...items.map((r) => [r.row, fileNames.get(r.row)!, r.name, r.typeLabel, r.output])]);
        const skipped = [...rows.filter((r) => !r.valid).flatMap((r) => r.errors.map((e) => [r.row, r.name, r.input, e])),
          ...failures.map((f) => [items[f.index].row, items[f.index].name, items[f.index].input, f.error])];
        const files = [{ name: "index.csv", data: enc.encode(index), compress: true }];
        if (skipped.length) files.push({ name: "skipped-rows.csv", data: enc.encode(toCsv([["row", "name", "data", "error"], ...skipped])), compress: true });
        return files;
      },
      onDone: (n) => track("bulk_qr_completed", { count: n }),
    });
  };

  const step = !csv.table ? 0 : batch.phase === "done" ? 4 : batch.running ? 3 : 1;
  const invalid = rows.filter((r) => !r.valid).length;

  return (
    <div>
      <StepList current={step} />
      <CsvUpload
        templates={QR_TEMPLATES} onFile={(f) => { batch.reset(); csv.load(f); }} busy={csv.busy} fileName={csv.fileName}
        intro={<>
          <h2 className="text-xl font-bold text-white">Upload a CSV file</h2>
          <p className="mt-2 text-fog">Generate hundreds of QR codes from a CSV file directly in your browser. Your data stays on your device.</p>
          <p className="mt-2 text-sm text-mist">Maximum {MAX_BATCH_ROWS} codes per batch, CSV up to 1 MB.</p>
        </>}
      />
      <PrivacyNotice variant="bulk" className="mt-4" />
      {csv.error && <p className="mt-4 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-red-100" role="alert">{csv.error}</p>}
      {check?.fileError && <p className="mt-4 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-red-100" role="alert">{check.fileError}</p>}

      {csv.table && check && !check.fileError && (
        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section aria-labelledby="bq-review" className="min-w-0 space-y-4">
            <h2 id="bq-review" className="text-xl font-bold text-white">Review rows</h2>
            <BatchSummary rows={rows} includeDuplicates={includeDuplicates} onIncludeDuplicates={setIncludeDuplicates}
              warnings={fileWarnings}
              onErrorReport={onErrorReport} />
            {!check.hasTypeColumn && (
              <SelectField<BulkQrType> label="QR type for every row" value={defaultType} onChange={setDefaultType}
                hint="Your file has no type column. Automatic treats values starting with http:// or https:// as links and everything else as text."
                options={[{ value: "auto", label: "Automatic (URL or text)" }, { value: "url", label: "URL" }, { value: "text", label: "Text" }, { value: "email", label: "Email address" }, { value: "phone", label: "Phone number" }]} />
            )}
            <RowTable rows={rows} valueLabel="Data" fileNames={fileNames} includeDuplicates={includeDuplicates} canEditName={check.hasNameColumn} onFix={onFix} />
          </section>

          <section aria-labelledby="bq-design" className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <h2 id="bq-design" className="text-xl font-bold text-white">Customise</h2>
            <div className="space-y-5 rounded-2xl border border-line bg-ink-2 p-4 sm:p-5">
              {sampleSvg && (
                <div className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(sampleSvg)}`} alt={`Sample using the first row (row ${sample.row})`} className="h-28 w-28 rounded-lg" />
                  <p className="text-sm text-mist">Sample: row {sample.row}. Every code uses these settings.</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <ColorField label="Foreground" value={design.foreground} onChange={(c) => set("foreground", c)} />
                <ColorField label="Background" value={design.background} onChange={(c) => set("background", c)} />
              </div>
              <Segmented<Ecc> label="Error correction" value={ecc} onChange={(e) => set("ecc", e)} columns={4}
                options={(["L", "M", "Q", "H"] as Ecc[]).map((e) => ({ value: e, label: e }))} />
              {design.logo && <p className="hint -mt-3">Set to H automatically because a logo is used.</p>}
              <Range label="Margin (quiet zone)" value={design.margin} min={0} max={10} onChange={(n) => set("margin", n)} format={(n) => `${n} modules`} />
              <SelectField<string> label="Image size (PNG)" value={String(design.sizePx)} onChange={(v) => set("sizePx", Number(v))}
                options={[256, 512, 1024, 2048].map((n) => ({ value: String(n), label: `${n} × ${n} px` }))} />
              <Segmented<"png" | "svg"> label="Output format" value={design.format} onChange={(f) => set("format", f)} options={[{ value: "png", label: "PNG" }, { value: "svg", label: "SVG" }]} />
              <p className="hint -mt-3">Use PNG/SVG for bulk downloads. PDF is available in the individual QR generator.</p>
              <div>
                <p className="label">Logo (optional)</p>
                {design.logo ? (
                  <div className="space-y-3">
                    <Range label="Logo size" value={Math.round(design.logo.size * 100)} min={10} max={30} onChange={(v) => set("logo", { ...design.logo!, size: v / 100 })} format={(v) => `${v}% of width`} />
                    <button type="button" className="btn-ghost min-h-9 px-2 text-sm" onClick={() => set("logo", null)}>Remove logo</button>
                  </div>
                ) : (
                  <label className="btn-secondary cursor-pointer">
                    Add a logo
                    <input type="file" accept={LOGO_ACCEPT} className="sr-only" onChange={(e) => { onLogo(e.target.files?.[0]); e.target.value = ""; }} />
                  </label>
                )}
                <p className="hint">The same logo is added to every code. Large logos can reduce scan reliability.</p>
                {logoError && <p className="field-error" role="alert">{logoError}</p>}
              </div>
              <WarningList warnings={sampleWarnings} label="Readability checks for the sample" />
            </div>

            <div className="space-y-3">
              <button type="button" className="btn-primary w-full" disabled={!planned.length || batch.running} onClick={generate}>
                {planned.length === 0 ? "No valid rows to generate" : invalid ? `Generate ${planned.length} valid rows (skip ${invalid} invalid)` : `Generate ${planned.length} QR code${planned.length === 1 ? "" : "s"}`}
              </button>
              <ProgressPanel phase={batch.phase} done={batch.done} total={batch.total} onCancel={batch.cancel} message={batch.message} />
              {batch.zip && batch.phase === "done" && (
                <a href={batch.zip.url} download={batch.zip.name} className="btn-primary w-full">
                  Download ZIP ({(batch.zip.size / 1024 / 1024).toFixed(1)} MB)
                </a>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
