/** Safe image intake for the decoders: type, size and dimension checks before decoding. */
import { fileHeaderDimensions } from "@/lib/images/dimensions";

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_IMAGE_PIXELS = 40_000_000;
export const IMAGE_ACCEPT = "image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp";

export class ImageInputError extends Error {}

async function sniff(file: File): Promise<"png" | "jpeg" | "webp" | null> {
  const b = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "png";
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpeg";
  if (String.fromCharCode(...b.slice(0, 4)) === "RIFF" && String.fromCharCode(...b.slice(8, 12)) === "WEBP") return "webp";
  return null;
}

/**
 * Validates and decodes an image file to a bitmap. Checks the declared type,
 * the file's actual bytes (so a renamed file is caught), size and pixel count.
 */
export async function readImageFile(file: File): Promise<ImageBitmap> {
  const name = file.name.toLowerCase();
  if (file.type === "image/svg+xml" || name.endsWith(".svg")) {
    throw new ImageInputError("SVG files aren't accepted. Upload a PNG, JPG or WEBP image instead.");
  }
  if (file.type === "image/heic" || file.type === "image/heif" || /\.hei[cf]$/.test(name)) {
    throw new ImageInputError("HEIC photos aren't supported by most browsers. Take a screenshot of the code, or export the photo as JPG.");
  }
  if (!["image/png", "image/jpeg", "image/webp", ""].includes(file.type)) {
    throw new ImageInputError("That file type isn't supported. Upload a PNG, JPG or WEBP image.");
  }
  if (file.size === 0) throw new ImageInputError("That file is empty.");
  if (file.size > MAX_IMAGE_BYTES) {
    throw new ImageInputError(`That image is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is 10 MB; try a screenshot or a smaller photo.`);
  }
  const kind = await sniff(file);
  if (!kind) throw new ImageInputError("This file isn't a valid PNG, JPG or WEBP image, even though its name or type says it is.");

  // Check declared dimensions BEFORE decoding, so tiny files declaring huge images are rejected cheaply.
  const dims = await fileHeaderDimensions(file);
  if (dims && dims.width * dims.height > MAX_IMAGE_PIXELS) {
    throw new ImageInputError(`That image is ${dims.width} × ${dims.height} px, which is too large to process. Crop it to the code or use an image under 40 megapixels.`);
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new ImageInputError("This image couldn't be read. It may be damaged or incomplete. Try saving it again.");
  }
  if (bitmap.width * bitmap.height > MAX_IMAGE_PIXELS) {
    const msg = `That image is ${bitmap.width} × ${bitmap.height} px, which is too large to process. Crop it to the code or use an image under 40 megapixels.`;
    bitmap.close();
    throw new ImageInputError(msg);
  }
  return bitmap;
}

/** Draws a bitmap (or video frame) into ImageData, scaled so its longest side is at most maxSide. */
export function toImageData(source: CanvasImageSource, width: number, height: number, maxSide: number, canvas?: HTMLCanvasElement) {
  const scale = Math.min(1, maxSide / Math.max(width, height));
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));
  const c = canvas ?? document.createElement("canvas");
  if (c.width !== w) c.width = w;
  if (c.height !== h) c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Your browser couldn't create an image canvas.");
  ctx.drawImage(source, 0, 0, w, h);
  return { data: ctx.getImageData(0, 0, w, h), scaled: scale < 1 };
}
