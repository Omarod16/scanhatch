"use client";

import { useCallback, useState } from "react";
import { Tabs } from "@/components/ui/Tabs";
import { PrivacyNotice } from "@/components/privacy/PrivacyNotice";
import type { NormalisedResult, ScanMode } from "@/lib/scanner/formats";
import { useScanHistory } from "@/lib/scanner/history";
import { CameraScanner } from "./CameraScanner";
import { DecodeResult } from "./DecodeResult";
import { ImageDecoder } from "./ImageDecoder";
import { ScanHistory } from "./ScanHistory";

/** Camera scanner with an image-upload alternative and session history. */
export function ScannerTool({ mode }: { mode: ScanMode }) {
  const history = useScanHistory();
  const [tab, setTab] = useState("camera");
  const [result, setResult] = useState<NormalisedResult | null>(null);

  const onCamera = useCallback((r: NormalisedResult) => {
    setResult(r);
    history.add({ format: r.formatLabel, value: r.value, source: "camera" });
  }, [history]);
  const onImage = useCallback((r: NormalisedResult) => history.add({ format: r.formatLabel, value: r.value, source: "image" }), [history]);

  return (
    <div>
      <PrivacyNotice variant="scanner" className="mb-5" />
      <Tabs
        label="Scan method"
        active={tab}
        onChange={(t) => { setTab(t); setResult(null); }}
        tabs={[
          {
            id: "camera",
            label: "Camera",
            content: (
              <div className="space-y-6">
                <CameraScanner mode={mode} onResult={onCamera} />
                {result && <DecodeResult result={result} />}
              </div>
            ),
          },
          { id: "image", label: "Upload image", content: <ImageDecoder mode={mode} onDecoded={onImage} /> },
        ]}
      />
      <ScanHistory entries={history.entries} onRemove={history.remove} onClear={history.clear} />
    </div>
  );
}

/** Image-only decoder with session history. */
export function DecoderTool({ mode }: { mode: ScanMode }) {
  const history = useScanHistory();
  const onImage = useCallback((r: NormalisedResult) => history.add({ format: r.formatLabel, value: r.value, source: "image" }), [history]);
  return (
    <div>
      <PrivacyNotice variant="scanner" className="mb-5" />
      <ImageDecoder mode={mode} onDecoded={onImage} />
      <ScanHistory entries={history.entries} onRemove={history.remove} onClear={history.clear} />
    </div>
  );
}
