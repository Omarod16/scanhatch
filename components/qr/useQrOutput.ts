"use client";

import { useMemo } from "react";
import { buildMatrix, QrDataTooLongError, type QrMatrix } from "@/lib/qr/matrix";
import { renderQrSvg } from "@/lib/qr/render";
import type { QrStyle } from "@/lib/qr/style";
import { checkReadability, type QrWarning } from "@/lib/qr/warnings";

export interface QrOutput {
  matrix: QrMatrix | null;
  svg: string | null;
  error: string | null;
  warnings: QrWarning[];
}

export function useQrOutput(payload: string | null, style: QrStyle, title = "QR code"): QrOutput {
  return useMemo(() => {
    if (!payload) return { matrix: null, svg: null, error: null, warnings: [] };
    try {
      const matrix = buildMatrix(payload, style.ecc);
      const svg = renderQrSvg(matrix, style, { pixelSize: 1024, title });
      return { matrix, svg, error: null, warnings: checkReadability(matrix, style, payload.length) };
    } catch (e) {
      const error =
        e instanceof QrDataTooLongError
          ? `Too much content for a QR code at ${style.ecc} error correction. Shorten the content or lower error correction in Advanced.`
          : "This content couldn't be turned into a QR code.";
      return { matrix: null, svg: null, error, warnings: [] };
    }
  }, [payload, style, title]);
}

export const svgDataUri = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
