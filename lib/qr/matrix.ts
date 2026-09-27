import QRCode from "qrcode";

export type Ecc = "L" | "M" | "Q" | "H";

export interface QrMatrix {
  size: number;
  version: number;
  ecc: Ecc;
  isDark: (row: number, col: number) => boolean;
}

export class QrDataTooLongError extends Error {}

export function buildMatrix(data: string, ecc: Ecc): QrMatrix {
  let qr;
  try {
    qr = QRCode.create(data, { errorCorrectionLevel: ecc });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (/too big|amount of data/i.test(msg)) throw new QrDataTooLongError(msg);
    throw e;
  }
  const size = qr.modules.size;
  const bits = qr.modules.data;
  return {
    size,
    version: qr.version,
    ecc,
    isDark: (r, c) => r >= 0 && c >= 0 && r < size && c < size && bits[r * size + c] === 1,
  };
}

/** True for modules that belong to one of the three 7×7 finder patterns ("eyes"). */
export function inFinder(size: number, r: number, c: number) {
  return (r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7);
}
