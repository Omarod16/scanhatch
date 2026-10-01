"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Tabs } from "@/components/ui/Tabs";
import { track } from "@/lib/analytics";
import { CONTENT_TYPES, contentType, isContentTypeId, type ContentTypeId, type FieldValue, type Values } from "@/lib/qr/content";
import { DEFAULT_STYLE, type QrStyle } from "@/lib/qr/style";
import { AdvancedPanel } from "./AdvancedPanel";
import { ContentForm } from "./ContentForm";
import { ContentTypePicker } from "./ContentTypePicker";
import { DesignPanel } from "./DesignPanel";
import { ExportBar } from "./ExportBar";
import { LogoPanel } from "./LogoPanel";
import { PreflightPanel } from "./PreflightPanel";
import { QrPreview } from "./QrPreview";
import { DEFAULT_OUTPUT, SizePanel, type OutputSettings } from "./SizePanel";
import { runPreflight, type FixTarget } from "@/lib/qr/preflight";
import { useQrOutput } from "./useQrOutput";

const initialValues = () =>
  Object.fromEntries(CONTENT_TYPES.map((t) => [t.id, { ...t.defaults }])) as Record<ContentTypeId, Values>;

export function QrGenerator({ initialType = "url" }: { initialType?: ContentTypeId }) {
  const [typeId, setTypeId] = useState<ContentTypeId>(initialType);
  const [values, setValues] = useState(initialValues);
  const [style, setStyle] = useState<QrStyle>(DEFAULT_STYLE);
  const [output, setOutput] = useState<OutputSettings>(DEFAULT_OUTPUT);
  const [tab, setTab] = useState("content");
  const tracked = useRef(new Set<string>());

  // Deep links: /qr-code-generator/#wifi or #url=https%3A%2F%2F…
  // The hash never leaves the browser, so pre-filled content isn't sent to our server.
  useEffect(() => {
    const read = () => {
      const hash = window.location.hash.slice(1);
      const eq = hash.indexOf("=");
      const key = eq === -1 ? hash : hash.slice(0, eq);
      const raw = eq === -1 ? "" : hash.slice(eq + 1);
      if (!isContentTypeId(key)) return;
      setTypeId(key);
      setTab("content");
      if (key === "url" && raw) {
        try {
          const url = decodeURIComponent(raw).slice(0, 2000);
          setValues((v) => ({ ...v, url: { ...v.url, url } }));
        } catch { /* ignore malformed hash */ }
      }
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  const selectType = (id: ContentTypeId) => {
    setTypeId(id);
    history.replaceState(null, "", `#${id}`);
    track("tool_selected", { tool: `qr-${id}` });
  };

  const type = contentType(typeId)!;
  const typeValues = values[typeId];
  const built = useMemo(() => type.build(typeValues), [type, typeValues]);
  const payload = built.ok ? built.payload : null;
  const qr = useQrOutput(payload, style, `QR code (${type.label})`);

  useEffect(() => {
    if (qr.svg && !tracked.current.has(typeId)) {
      tracked.current.add(typeId);
      track("qr_generated", { contentType: typeId });
    }
  }, [qr.svg, typeId]);

  const setField = useCallback(
    (name: string, v: FieldValue) => setValues((prev) => ({ ...prev, [typeId]: { ...prev[typeId], [name]: v } })),
    [typeId]
  );
  const set = useCallback(<K extends keyof QrStyle>(key: K, value: QrStyle[K]) => setStyle((s) => ({ ...s, [key]: value })), []);

  const empty = !built.ok && type.fields.every((f) => !f.required || typeValues[f.name] === "" || typeValues[f.name] === false || typeValues[f.name] == null);
  const preflight = useMemo(
    () => runPreflight({ built, empty, matrix: qr.matrix, buildError: qr.error, style, warnings: qr.warnings, output }),
    [built, empty, qr, style, output],
  );
  const fixSetting = useCallback((target: FixTarget) => {
    setTab(target);
    // After the tab switches, bring the settings into view and move keyboard focus to the tab.
    window.setTimeout(() => {
      const t = document.querySelector<HTMLElement>('[role="tablist"][aria-label="QR code settings"] [role="tab"][aria-selected="true"]');
      t?.scrollIntoView({ block: "start", behavior: "smooth" });
      t?.focus({ preventScroll: true });
    }, 0);
  }, []);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_440px]">
      <div className="min-w-0">
        <Tabs
          label="QR code settings"
          active={tab}
          onChange={setTab}
          tabs={[
            {
              id: "content",
              label: "Content",
              content: (
                <div className="space-y-6">
                  <ContentTypePicker value={typeId} onChange={selectType} />
                  <ContentForm key={typeId} type={type} values={typeValues} errors={built.ok ? {} : built.errors} onChange={setField} />
                </div>
              ),
            },
            { id: "design", label: "Design", content: <DesignPanel style={style} set={set} /> },
            {
              id: "logo",
              label: "Logo",
              badge: style.logo ? <span className="h-1.5 w-1.5 rounded-full bg-cyan" aria-label="(logo added)" /> : undefined,
              content: <LogoPanel style={style} set={set} />,
            },
            { id: "size", label: "Size", content: <SizePanel style={style} set={set} output={output} setOutput={setOutput} /> },
            { id: "advanced", label: "Advanced", content: <AdvancedPanel style={style} set={set} payload={payload} matrix={qr.matrix} /> },
          ]}
        />
        <button type="button" onClick={() => { setStyle(DEFAULT_STYLE); setOutput(DEFAULT_OUTPUT); }} className="btn-ghost mt-6 px-0 text-mist">
          Reset design to default
        </button>
      </div>

      <aside aria-label="Preview and download" className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto lg:overscroll-contain">
        <div className="rounded-2xl border border-line bg-ink-2 p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Preview</h2>
          </div>
          <QrPreview
            svg={qr.svg}
            error={qr.error}
            warnings={[] /* shown in the QR Preflight panel instead */}
            transparent={style.transparent}
            notes={built.ok ? built.notes : undefined}
            emptyText="Fill in the content to see your QR code."
          />
          {/* Phones/tablets: downloads straight after the preview, preflight below. Desktop: preflight first. */}
          <div className="flex flex-col">
            <div className="order-2 lg:order-1"><PreflightPanel report={preflight} onFix={fixSetting} /></div>
            <div className="order-1 mt-5 lg:order-2">
              <ExportBar svg={qr.svg} style={style} output={output} filename={`scanhatch-qr-${typeId}`} />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
