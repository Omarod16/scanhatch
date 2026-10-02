"use client";

import { isLoadError } from "@/lib/errors";

import { useCallback, useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { formatsFor, normaliseResult, type NormalisedResult, type ScanMode } from "@/lib/scanner/formats";
import { toImageData } from "@/lib/scanner/image";
import { decodeImageData, loadDecoder } from "@/lib/scanner/zxing";

export type Phase = "idle" | "starting" | "scanning" | "paused" | "found" | "error";

export interface TorchZoomCaps {
  torch?: boolean;
  zoom?: { min: number; max: number; step: number };
}

const SCAN_INTERVAL_MS = 180;
const FRAME_MAX_SIDE = 960;

const BLOCKED_MSG = "Camera access was blocked. Allow camera access in your browser settings and try again, or upload an image instead.";

/** Browsers report a blocked camera with different error names, so also ask the Permissions API. */
async function cameraPermissionDenied() {
  try {
    const s = await navigator.permissions?.query({ name: "camera" as PermissionName });
    return s?.state === "denied";
  } catch {
    return false; // Not supported for cameras in this browser.
  }
}

function cameraErrorMessage(e: unknown): string {
  const name = e instanceof DOMException || e instanceof Error ? e.name : "";
  switch (name) {
    case "NotAllowedError":
    case "PermissionDeniedError":
      return BLOCKED_MSG;
    case "NotFoundError":
    case "DevicesNotFoundError":
    case "OverconstrainedError":
      return "No camera was found. Connect a camera, or upload an image of the code instead.";
    case "NotReadableError":
    case "TrackStartError":
    case "AbortError":
      return "The camera is already in use by another app or browser tab. Close it and try again.";
    case "NotSupportedError":
      return "Camera access isn't available in this browser or on this page. Upload an image of the code instead.";
    case "SecurityError":
      return "Camera access isn't allowed on this page. It needs a secure (https) connection.";
    default:
      return "The camera couldn't be started. Try again, or upload an image of the code instead.";
  }
}

/**
 * Camera scanning logic shared by the scanner pages (CameraScanner) and the homepage quick scanner.
 * Owns the camera stream, the scan loop and their lifecycle; the caller supplies the layout.
 */
export function useCameraScanner(mode: ScanMode, onResult: (r: NormalisedResult) => void) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const busyRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const phaseRef = useRef<Phase>("idle");
  /** Incremented by every stop and start; a start that resolves after a newer stop/start discards its stream. */
  const generation = useRef(0);

  const [phase, setPhaseState] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState<string>("");
  const [caps, setCaps] = useState<TorchZoomCaps>({});
  const [torchOn, setTorchOn] = useState(false);
  const [zoom, setZoom] = useState<number | null>(null);

  const setPhase = (p: Phase) => { phaseRef.current = p; setPhaseState(p); };

  const stopCamera = useCallback(() => {
    generation.current++;
    if (timerRef.current !== null) { window.clearTimeout(timerRef.current); timerRef.current = null; }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setTorchOn(false);
  }, []);

  const scanLoop = useCallback(() => {
    const tick = async () => {
      if (phaseRef.current !== "scanning") return;
      const v = videoRef.current;
      if (v && v.readyState >= 2 && v.videoWidth > 0 && !busyRef.current) {
        busyRef.current = true;
        try {
          canvasRef.current ??= document.createElement("canvas");
          const { data } = toImageData(v, v.videoWidth, v.videoHeight, FRAME_MAX_SIDE, canvasRef.current);
          const results = await decodeImageData(data, { formats: formatsFor(mode), tryHarder: false, maxNumberOfSymbols: 1 });
          if (results.length && phaseRef.current === "scanning") {
            const r = results[0];
            setPhase("found");
            stopCamera();
            track("scanner_used", { source: "camera" });
            onResult(normaliseResult(r.format, r.text));
            return;
          }
        } catch {
          // A single bad frame isn't fatal; keep scanning.
        } finally {
          busyRef.current = false;
        }
      }
      timerRef.current = window.setTimeout(tick, SCAN_INTERVAL_MS);
    };
    tick();
  }, [mode, onResult, stopCamera]);

  const start = useCallback(async (wantedDevice?: string) => {
    setError(null);
    stopCamera();
    const gen = ++generation.current;
    const stale = () => gen !== generation.current;
    if (typeof window !== "undefined" && !window.isSecureContext) {
      setError("Camera access needs a secure (https) connection."); setPhase("error"); return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("This browser doesn't support camera access. Upload an image of the code instead."); setPhase("error"); return;
    }
    setPhase("starting");
    try {
      // Start loading the decoder in parallel with the camera permission prompt.
      const decoderReady = loadDecoder();
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: wantedDevice
          ? { deviceId: { exact: wantedDevice }, width: { ideal: 1280 }, height: { ideal: 720 } }
          : { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      // Stopped, paused, hidden or restarted while waiting for the camera: release it at once.
      if (stale()) { stream.getTracks().forEach((t) => t.stop()); return; }
      streamRef.current = stream;
      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play().catch(() => undefined);

      const trackObj = stream.getVideoTracks()[0];
      const settings = trackObj?.getSettings?.() ?? {};
      setDeviceId(settings.deviceId ?? wantedDevice ?? "");
      const c = (trackObj?.getCapabilities?.() ?? {}) as MediaTrackCapabilities & { torch?: boolean; zoom?: { min: number; max: number; step: number } };
      const nextCaps: TorchZoomCaps = {};
      if (c.torch) nextCaps.torch = true;
      if (c.zoom && typeof c.zoom.max === "number" && c.zoom.max > c.zoom.min) {
        nextCaps.zoom = { min: c.zoom.min, max: c.zoom.max, step: c.zoom.step || 0.1 };
        setZoom((settings as MediaTrackSettings & { zoom?: number }).zoom ?? c.zoom.min);
      } else setZoom(null);
      setCaps(nextCaps);

      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setCameras(devices.filter((d) => d.kind === "videoinput"));
      } catch { setCameras([]); }

      await decoderReady;
      if (stale()) return;
      setPhase("scanning");
      scanLoop();
    } catch (e) {
      if (stale()) return;
      stopCamera();
      if (isLoadError(e) || (e instanceof Error && /wasm|WebAssembly/i.test(e.message))) {
        setError("The scanner couldn't load. Check your connection and reload the page.");
      } else {
        setError((await cameraPermissionDenied()) ? BLOCKED_MSG : cameraErrorMessage(e));
      }
      setPhase("error");
    }
  }, [scanLoop, stopCamera]);

  // Release the camera when the page is hidden or the component unmounts.
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden" && (phaseRef.current === "scanning" || phaseRef.current === "starting")) {
        stopCamera();
        setPhase("paused");
      }
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", stopCamera);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", stopCamera);
      stopCamera();
    };
  }, [stopCamera]);

  const setTorch = async (on: boolean) => {
    const t = streamRef.current?.getVideoTracks()[0];
    try {
      await t?.applyConstraints({ advanced: [{ torch: on } as MediaTrackConstraintSet] });
      setTorchOn(on);
    } catch { setError("The flashlight couldn't be switched on this device."); }
  };
  const applyZoom = async (z: number) => {
    setZoom(z);
    const t = streamRef.current?.getVideoTracks()[0];
    try { await t?.applyConstraints({ advanced: [{ zoom: z } as MediaTrackConstraintSet] }); } catch { /* ignore */ }
  };

  const live = phase === "scanning" || phase === "starting";
  const statusText =
    phase === "idle" ? "Camera is off."
    : phase === "starting" ? "Starting camera…"
    : phase === "scanning" ? "Looking for a code…"
    : phase === "paused" ? "Camera paused."
    : phase === "found" ? "Code detected. Camera turned off."
    : "Camera unavailable.";

  /** Stop the camera and show the "paused" state. */
  const pause = () => { stopCamera(); setPhase("paused"); };
  /** Switch to another camera and restart. */
  const selectCamera = (id: string) => { setDeviceId(id); start(id); };

  return { videoRef, phase, error, cameras, deviceId, caps, torchOn, zoom, live, statusText, start, pause, selectCamera, setTorch, applyZoom };
}
