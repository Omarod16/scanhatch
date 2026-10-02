"use client";

import { useId } from "react";
import type { NormalisedResult, ScanMode } from "@/lib/scanner/formats";
import { useCameraScanner } from "./useCameraScanner";

export function CameraScanner({ mode, onResult }: { mode: ScanMode; onResult: (r: NormalisedResult) => void }) {
  const selectId = useId();
  const { videoRef, phase, error, cameras, deviceId, caps, torchOn, zoom, live, statusText, start, pause, selectCamera, setTorch, applyZoom } = useCameraScanner(mode, onResult);

  return (
    <div>
      <div className="relative mx-auto aspect-[4/5] max-h-[70dvh] w-full overflow-hidden rounded-2xl border border-line bg-black sm:aspect-video">
        <video ref={videoRef} playsInline muted autoPlay className={`h-full w-full object-cover ${live ? "" : "invisible"}`} aria-label="Camera preview" />
        {live && (
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {[["M20 32V20H32"], ["M68 20H80V32"], ["M80 68V80H68"], ["M32 80H20V68"]].map(([d]) => (
              <path key={d} d={d} fill="none" stroke="#22d3ee" strokeWidth="0.8" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 4 }} />
            ))}
          </svg>
        )}
        {!live && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
            {phase === "error" ? (
              <p className="max-w-sm text-sm font-medium text-red-200" role="alert">{error}</p>
            ) : (
              <p className="max-w-sm text-sm text-fog">
                {phase === "found" ? "Your result is below." : phase === "paused" ? "The camera was switched off while this tab was in the background." : mode === "qr" ? "Point your camera at a QR code." : mode === "barcode" ? "Point your camera at a barcode." : "Point your camera at a QR code or barcode."}
              </p>
            )}
            <button type="button" className="btn-primary" onClick={() => start(deviceId || undefined)}>
              {phase === "idle" ? "Start camera" : phase === "found" ? "Scan again" : phase === "error" ? "Try again" : "Resume camera"}
            </button>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <p role="status" aria-live="polite" className="mr-auto flex items-center gap-2 text-sm text-fog">
          <span aria-hidden="true" className={`h-2 w-2 rounded-full ${phase === "scanning" ? "animate-pulse bg-cyan" : phase === "found" ? "bg-ok" : phase === "error" ? "bg-danger" : "bg-mist"}`} />
          {statusText}
        </p>
        {live && <button type="button" className="btn-secondary min-h-10" onClick={pause}>Pause</button>}
        {live && caps.torch && (
          <button type="button" className="btn-secondary min-h-10" aria-pressed={torchOn} onClick={() => setTorch(!torchOn)}>
            {torchOn ? "Flashlight off" : "Flashlight on"}
          </button>
        )}
      </div>

      {live && caps.zoom && zoom !== null && (
        <div className="mt-3">
          <label htmlFor={`${selectId}-zoom`} className="label">Zoom</label>
          <input id={`${selectId}-zoom`} type="range" min={caps.zoom.min} max={caps.zoom.max} step={caps.zoom.step} value={zoom} onChange={(e) => applyZoom(Number(e.target.value))} className="h-2 w-full accent-cyan" />
        </div>
      )}

      {cameras.length > 1 && (
        <div className="mt-3">
          <label htmlFor={selectId} className="label">Camera</label>
          <select id={selectId} className="input" value={deviceId} onChange={(e) => selectCamera(e.target.value)}>
            {cameras.map((c, i) => <option key={c.deviceId || i} value={c.deviceId}>{c.label || `Camera ${i + 1}`}</option>)}
          </select>
        </div>
      )}
    </div>
  );
}
