/** Accepts an uploaded logo and normalises it to a PNG data URL, entirely in the browser. */

import { fileHeaderDimensions } from "@/lib/images/dimensions";

export const LOGO_MAX_BYTES = 2 * 1024 * 1024;
export const LOGO_MAX_PIXELS = 25_000_000;
const ACCEPTED = ["image/png", "image/jpeg", "image/svg+xml"];
export const LOGO_ACCEPT = ".png,.jpg,.jpeg,.svg,image/png,image/jpeg,image/svg+xml";

export interface NormalisedLogo {
  dataUrl: string;
  width: number;
  height: number;
}

export async function normaliseLogo(file: File): Promise<NormalisedLogo> {
  if (!ACCEPTED.includes(file.type)) throw new Error("Use a PNG, JPG or SVG image.");
  if (file.size > LOGO_MAX_BYTES) throw new Error("The logo must be 2 MB or smaller.");

  if (file.type !== "image/svg+xml") {
    const dims = await fileHeaderDimensions(file);
    if (!dims) throw new Error("This image couldn't be read. Try a different file.");
    if (dims.width * dims.height > LOGO_MAX_PIXELS) throw new Error(`The logo is ${dims.width} × ${dims.height} px. Use an image under 25 megapixels; logos rarely need more than 1000 px.`);
  }

  // Images are only ever drawn through <img> and a canvas: SVG scripts never run,
  // and the result is re-encoded as a plain PNG.
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("This image couldn't be read. Try a different file."));
      i.src = url;
    });
    let w = img.naturalWidth || 512;
    let h = img.naturalHeight || 512;
    const scale = Math.min(1, 1024 / Math.max(w, h));
    if (file.type === "image/svg+xml" && Math.max(w, h) < 512) {
      const up = 512 / Math.max(w, h);
      w *= up; h *= up;
    } else {
      w *= scale; h *= scale;
    }
    // Square canvas so the logo is centred in the QR box.
    const side = Math.round(Math.max(w, h));
    const canvas = document.createElement("canvas");
    canvas.width = side;
    canvas.height = side;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Your browser couldn't process the image.");
    ctx.drawImage(img, (side - w) / 2, (side - h) / 2, w, h);
    return { dataUrl: canvas.toDataURL("image/png"), width: side, height: side };
  } finally {
    URL.revokeObjectURL(url);
  }
}
