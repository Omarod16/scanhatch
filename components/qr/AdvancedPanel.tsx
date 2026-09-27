"use client";

import { useState } from "react";
import { Segmented } from "@/components/ui/controls";
import { copyText } from "@/lib/downloads/export";
import type { Ecc, QrMatrix } from "@/lib/qr/matrix";
import { ECC_INFO, type QrStyle } from "@/lib/qr/style";

type Set = <K extends keyof QrStyle>(key: K, value: QrStyle[K]) => void;

export function AdvancedPanel({ style, set, payload, matrix }: { style: QrStyle; set: Set; payload: string | null; matrix: QrMatrix | null }) {
  const [copied, setCopied] = useState<string | null>(null);
  return (
    <div className="space-y-6">
      <div>
        <Segmented<Ecc>
          label="Error correction"
          value={style.ecc}
          onChange={(v) => set("ecc", v)}
          options={(Object.keys(ECC_INFO) as Ecc[]).map((k) => ({ value: k, label: k }))}
        />
        <p className="hint">
          {ECC_INFO[style.ecc].label} of the code can be damaged or covered and still scan. Higher levels make the code denser. Use H with a logo.
        </p>
      </div>

      {matrix && (
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border border-line bg-ink-2 p-3"><dt className="text-mist">QR version</dt><dd className="mt-0.5 font-semibold text-white">{matrix.version}</dd></div>
          <div className="rounded-lg border border-line bg-ink-2 p-3"><dt className="text-mist">Modules</dt><dd className="mt-0.5 font-semibold text-white">{matrix.size} × {matrix.size}</dd></div>
        </dl>
      )}

      <div>
        <label htmlFor="qr-raw" className="label">Encoded content</label>
        <textarea id="qr-raw" className="input font-mono text-xs" rows={6} readOnly value={payload ?? ""} placeholder="Fill in the Content tab to see exactly what the code contains." />
        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            className="btn-secondary"
            disabled={!payload}
            onClick={async () => {
              try { await copyText(payload ?? ""); setCopied("Copied."); } catch { setCopied("Copy failed. Select the text and copy it manually."); }
            }}
          >
            Copy content
          </button>
          <span role="status" className="text-sm text-mist">{copied}</span>
        </div>
      </div>
    </div>
  );
}
