"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { CameraScanner } from "@/components/scanner/CameraScanner";
import { DecodeResult } from "@/components/scanner/DecodeResult";
import { Tabs } from "@/components/ui/Tabs";
import { track } from "@/lib/analytics";
import { QR_FORMATS, formatsFor, normaliseResult, withArticle, type NormalisedResult } from "@/lib/scanner/formats";
import { IMAGE_ACCEPT, ImageInputError, readImageFile, toImageData } from "@/lib/scanner/image";
import { PrivacyNotice } from "@/components/privacy/PrivacyNotice";
import { decodeImageData } from "@/lib/scanner/zxing";
import { validateQrContent, type ContentCheck, type ContentValidation } from "@/lib/validate/qr-content";
import { assessQrImage, type Readability } from "@/lib/validate/qr-image";
import { CheckList, type CheckItem } from "./CheckList";

const toItems = (checks: ContentCheck[]): CheckItem[] =>
  checks.map((c) => ({ status: c.level === "ok" ? "pass" : c.level === "error" ? "fail" : c.level, label: c.message }));

type Report = { result: NormalisedResult; content: ContentValidation; readability: Readability | null; count: number };
type State = { kind: "idle" } | { kind: "working" } | { kind: "error"; message: string } | { kind: "none"; other?: string } | { kind: "report"; report: Report };

function ContentVerdict({ c }: { c: ContentValidation }) {
  const text = c.errors ? "Content has problems" : c.warnings ? "Valid content, with warnings" : "Valid content";
  const cls = c.errors ? "bg-danger/15 text-danger" : c.warnings ? "bg-warn/15 text-warn" : "bg-ok/15 text-ok";
  return <p className={`inline-block rounded-lg px-3 py-1 font-bold ${cls}`}><span aria-hidden="true">{c.errors ? "✕ " : c.warnings ? "! " : "✓ "}</span>{text}</p>;
}
function ReadVerdict({ r }: { r: Readability }) {
  const cls = r.verdict === "poor" ? "bg-danger/15 text-danger" : r.verdict === "warnings" ? "bg-warn/15 text-warn" : "bg-ok/15 text-ok";
  return <p className={`inline-block rounded-lg px-3 py-1 font-bold ${cls}`}><span aria-hidden="true">{r.verdict === "poor" ? "✕ " : r.verdict === "warnings" ? "! " : "✓ "}</span>{r.label}</p>;
}

function ReportView({ report, onAgain }: { report: Report; onAgain?: () => void }) {
  const { content, readability } = report;
  return (
    <div className="space-y-6">
      {report.count > 1 && <p className="text-sm text-fog" role="status">{report.count} QR codes found. Checking the largest one.</p>}
      <section aria-labelledby="qv-content" className="rounded-2xl border border-line bg-ink-2 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="qv-content" className="text-lg font-bold text-white">Content: {content.typeLabel}</h2>
          <ContentVerdict c={content} />
        </div>
        <div className="mt-4"><CheckList items={toItems(content.checks)} label="Content checks" /></div>
        <p className="mt-3 text-sm text-mist">A correctly formatted code isn&apos;t necessarily safe. Check where links lead before opening them.</p>
      </section>

      {readability ? (
        <section aria-labelledby="qv-read" className="rounded-2xl border border-line bg-ink-2 p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="qv-read" className="text-lg font-bold text-white">Readability of this image</h2>
            <ReadVerdict r={readability} />
          </div>
          <div className="mt-4"><CheckList items={toItems(readability.checks)} label="Readability checks" /></div>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            {[
              ["QR version", `${readability.metrics.version} (${readability.metrics.modules} × ${readability.metrics.modules} modules)`],
              ["Error correction", readability.metrics.ecLevel || "Unknown"],
              ["Unused error correction", readability.metrics.unusedEc === null ? "Unknown" : `${Math.round(readability.metrics.unusedEc * 100)}%`],
              ["Contrast", `${readability.metrics.contrast.toFixed(1)}:1`],
              ["Quiet zone", readability.metrics.modulePx < 3 ? "Not measurable" : `${readability.metrics.quietZone >= 4 ? "4+" : readability.metrics.quietZone} modules`],
              ["Module size", `${readability.metrics.modulePx.toFixed(1)} px`],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg border border-line bg-ink px-3 py-2">
                <dt className="text-xs text-mist">{k}</dt>
                <dd className="font-semibold text-white">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-sm text-mist">
            These checks look at the image file only. Printed size, print quality, surface, lighting and the scanner used also affect
            whether it scans, so test a printed copy with a few phones before printing in bulk.
          </p>
        </section>
      ) : (
        <p className="rounded-lg border border-line bg-ink-2 px-4 py-3 text-sm text-fog">Readability checks need an image. Upload one to check contrast, margins and logo coverage.</p>
      )}

      <DecodeResult result={report.result} onAgain={onAgain} againLabel="Check another" />
    </div>
  );
}

function UploadValidator() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<State>({ kind: "idle" });
  const [dragging, setDragging] = useState(false);

  const process = useCallback(async (file: File | null | undefined) => {
    if (!file) return;
    setState({ kind: "working" });
    let bitmap: ImageBitmap | null = null;
    try {
      bitmap = await readImageFile(file);
      let found: { img: ImageData; results: Awaited<ReturnType<typeof decodeImageData>> } | null = null;
      for (const side of [1600, 3200]) {
        if (side > 1600 && Math.max(bitmap.width, bitmap.height) <= 1600) break;
        const { data } = toImageData(bitmap, bitmap.width, bitmap.height, side);
        const results = await decodeImageData(data, { formats: QR_FORMATS, tryHarder: true, tryRotate: true, tryInvert: true, tryDownscale: true, maxNumberOfSymbols: 4 });
        if (results.length) { found = { img: data, results }; break; }
      }
      if (!found) {
        const { data } = toImageData(bitmap, bitmap.width, bitmap.height, 1600);
        const any = await decodeImageData(data, { formats: formatsFor("barcode"), tryHarder: true, tryRotate: true, maxNumberOfSymbols: 1 });
        setState({ kind: "none", other: any[0] ? normaliseResult(any[0].format, any[0].text).formatLabel : undefined });
        track("validator_used", { tool: "qr-validator", format: "qr", valid: false });
        return;
      }
      const area = (r: (typeof found.results)[number]) => Math.abs((r.position.topRight.x - r.position.topLeft.x) * (r.position.bottomLeft.y - r.position.topLeft.y));
      const r = [...found.results].sort((a, b) => area(b) - area(a))[0];
      const result = normaliseResult(r.format, r.text);
      const content = validateQrContent(r.text);
      const readability = r.format === "QRCode" ? assessQrImage(found.img, r) : null;
      setState({ kind: "report", report: { result, content, readability, count: found.results.length } });
      track("validator_used", { tool: "qr-validator", format: "qr", valid: content.errors === 0 });
    } catch (e) {
      setState({ kind: "error", message: e instanceof ImageInputError ? e.message : "This image couldn't be checked. Try a different image." });
    } finally {
      bitmap?.close();
      if (inputRef.current) inputRef.current.value = "";
    }
  }, []);

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      const file = Array.from(e.clipboardData?.items ?? []).find((i) => i.kind === "file" && i.type.startsWith("image/"))?.getAsFile();
      if (file) { e.preventDefault(); process(file); }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [process]);

  return (
    <div>
      <div
        data-testid="dropzone"
        onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false); }}
        onDrop={(e) => { e.preventDefault(); setDragging(false); process(e.dataTransfer.files[0]); }}
        className={`flex min-h-48 flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${dragging ? "border-cyan bg-cyan/10" : "border-line-2 bg-ink-2"}`}
      >
        <div>
          <p className="text-base font-semibold text-white">{dragging ? "Drop the image to check it" : "Drop a QR code image here or choose a file"}</p>
          <p className="mt-1 text-sm text-mist">PNG, JPG or WEBP up to 10 MB. You can also paste an image.</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => inputRef.current?.click()} disabled={state.kind === "working"}>
          {state.kind === "working" ? "Checking…" : "Choose an image"}
        </button>
        <input ref={inputRef} type="file" accept={IMAGE_ACCEPT} className="sr-only" tabIndex={-1} aria-label="Upload a QR code image to validate" onChange={(e) => process(e.target.files?.[0])} />
      </div>
      <div className="mt-6" aria-live="polite">
        {state.kind === "working" && <p className="text-sm text-fog" role="status">Decoding and checking…</p>}
        {state.kind === "error" && <p className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-red-200" role="alert">{state.message}</p>}
        {state.kind === "none" && (
          <section aria-label="Result" className="rounded-2xl border border-danger/50 bg-ink-2 p-4 sm:p-6">
            <p className="inline-block rounded-lg bg-danger/15 px-3 py-1 font-bold text-danger"><span aria-hidden="true">✕ </span>Not readable</p>
            <p className="mt-3 text-sm text-fog" role="alert">
              {state.other
                ? <>No QR code was found, but the image contains {withArticle(state.other).split(" ")[0]} <strong className="text-white">{state.other}</strong> barcode. Use the <Link href="/barcode-validator/" className="text-cyan underline underline-offset-2">Barcode Validator</Link> for that.</>
                : <>No QR code could be decoded from this image. If it&apos;s a photo, try a sharper, well-lit one taken straight on. If it&apos;s a QR code you made, check its contrast, margin and logo size in the generator.</>}
            </p>
          </section>
        )}
        {state.kind === "report" && <ReportView report={state.report} onAgain={() => { setState({ kind: "idle" }); inputRef.current?.focus(); }} />}
      </div>
    </div>
  );
}

function CameraValidator() {
  const [report, setReport] = useState<Report | null>(null);
  const onResult = useCallback((r: NormalisedResult) => {
    const content = validateQrContent(r.value);
    setReport({ result: r, content, readability: null, count: 1 });
    track("validator_used", { tool: "qr-validator", format: "qr", valid: content.errors === 0 });
  }, []);
  return (
    <div className="space-y-6">
      <CameraScanner mode="qr" onResult={onResult} />
      {report && <ReportView report={report} />}
    </div>
  );
}

export function QrValidator() {
  const [tab, setTab] = useState("upload");
  return (
    <div>
      <PrivacyNotice variant="validator" className="mb-5" />
      <Tabs
        label="How to check the QR code"
        active={tab}
        onChange={setTab}
        tabs={[
          { id: "upload", label: "Upload image", content: <UploadValidator /> },
          { id: "camera", label: "Camera", content: <CameraValidator /> },
        ]}
      />
    </div>
  );
}
