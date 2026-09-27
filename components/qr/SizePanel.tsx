"use client";

import { Range, SelectField } from "@/components/ui/controls";
import type { PageSize } from "@/lib/downloads/export";
import type { QrStyle } from "@/lib/qr/style";

export interface OutputSettings {
  pixelSize: number;
  printMm: number;
  page: PageSize;
}

export const DEFAULT_OUTPUT: OutputSettings = { pixelSize: 1024, printMm: 50, page: "a4" };

type Set = <K extends keyof QrStyle>(key: K, value: QrStyle[K]) => void;

export function SizePanel({ style, set, output, setOutput }: { style: QrStyle; set: Set; output: OutputSettings; setOutput: (o: OutputSettings) => void }) {
  return (
    <div className="space-y-6">
      <Range label="Image size (PNG / JPG)" value={output.pixelSize} min={256} max={4096} step={64} onChange={(v) => setOutput({ ...output, pixelSize: v })} format={(v) => `${v} × ${v} px`} />
      <Range label="Quiet zone (margin)" value={style.margin} min={0} max={10} onChange={(v) => set("margin", v)} format={(v) => `${v} module${v === 1 ? "" : "s"}`} />
      <p className="hint -mt-3">The empty border scanners need. 4 is the standard.</p>
      <Range label="Print width (PDF / print)" value={output.printMm} min={15} max={180} step={1} onChange={(v) => setOutput({ ...output, printMm: v })} format={(v) => `${v} mm (${(v / 25.4).toFixed(2)} in)`} />
      <p className="hint -mt-3">A common rule of thumb is a width of at least one tenth of the scanning distance. At 2 cm across, codes are hard to scan with most phones.</p>
      <SelectField<PageSize>
        label="PDF / print page size"
        value={output.page}
        onChange={(v) => setOutput({ ...output, page: v })}
        options={[{ value: "a4", label: "A4 (210 × 297 mm)" }, { value: "letter", label: "US Letter (8.5 × 11 in)" }]}
      />
      <p className="hint">SVG downloads are vector, so they scale to any size without losing quality.</p>
    </div>
  );
}
