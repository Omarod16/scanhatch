/**
 * Reads an image's pixel dimensions from its file header, without decoding it.
 * Used to reject "decompression bombs" (small files that declare huge images)
 * before the browser allocates memory for them. Returns null if unknown.
 */
export function headerDimensions(b: Uint8Array): { width: number; height: number } | null {
  // PNG: 8-byte signature, then the IHDR chunk (length 13, type "IHDR") holding width/height
  // (big-endian). Anything else is treated as unknown so the normal "damaged image" path
  // handles it, rather than reporting garbage dimensions from a corrupt file.
  const PNG_SIG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (b.length >= 8 && PNG_SIG.every((v, i) => b[i] === v)) {
    if (b.length < 24) return null;
    const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
    const isIhdr = dv.getUint32(8) === 13 && b[12] === 0x49 && b[13] === 0x48 && b[14] === 0x44 && b[15] === 0x52;
    return isIhdr ? plausible(dv.getUint32(16), dv.getUint32(20)) : null;
  }
  // JPEG: walk the markers to the first start-of-frame (SOF0–SOF15, except DHT/JPG/DAC).
  if (b.length >= 4 && b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const m = b[i + 1];
      if (m === 0xff) { i++; continue; }
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
        return plausible((b[i + 7] << 8) | b[i + 8], (b[i + 5] << 8) | b[i + 6]);
      }
      if (m === 0xd8 || m === 0x01 || (m >= 0xd0 && m <= 0xd7)) { i += 2; continue; }
      i += 2 + ((b[i + 2] << 8) | b[i + 3]);
    }
    return null;
  }
  // WEBP: RIFF container with a VP8, VP8L or VP8X first chunk.
  const tag = (o: number) => String.fromCharCode(b[o], b[o + 1], b[o + 2], b[o + 3]);
  if (b.length >= 30 && tag(0) === "RIFF" && tag(8) === "WEBP") {
    const chunk = tag(12);
    if (chunk === "VP8 ") return plausible(((b[27] << 8) | b[26]) & 0x3fff, ((b[29] << 8) | b[28]) & 0x3fff);
    if (chunk === "VP8L") {
      const [b0, b1, b2, b3] = [b[21], b[22], b[23], b[24]];
      return plausible(1 + (b0 | ((b1 & 0x3f) << 8)), 1 + ((b1 >> 6) | (b2 << 2) | ((b3 & 0x0f) << 10)));
    }
    if (chunk === "VP8X") return plausible(1 + (b[24] | (b[25] << 8) | (b[26] << 16)), 1 + (b[27] | (b[28] << 8) | (b[29] << 16)));
  }
  return null;
}

/** Dimensions a real image can have (PNG allows up to 2^31 - 1); zero or larger means a corrupt header. */
function plausible(width: number, height: number) {
  const MAX = 0x7fffffff;
  return width > 0 && height > 0 && width <= MAX && height <= MAX ? { width, height } : null;
}

/** Reads the start of a file (enough for PNG/WEBP headers and JPEG metadata before the frame header). */
export async function fileHeaderDimensions(file: Blob) {
  return headerDimensions(new Uint8Array(await file.slice(0, 256 * 1024).arrayBuffer()));
}
