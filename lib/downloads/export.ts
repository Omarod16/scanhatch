/**
 * Browser-only export helpers. All processing happens locally.
 */

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const svgBlob = (svg: string) => new Blob([svg], { type: "image/svg+xml;charset=utf-8" });

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("The image could not be rendered."));
    img.src = src;
  });
}

/** Rasterises an SVG string to a square canvas. */
export async function svgToCanvas(svg: string, px: number, fillColor?: string) {
  const url = URL.createObjectURL(svgBlob(svg));
  try {
    const img = await loadImage(url);
    const canvas = document.createElement("canvas");
    canvas.width = px;
    canvas.height = px;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Your browser couldn't create an image canvas.");
    if (fillColor) {
      ctx.fillStyle = fillColor;
      ctx.fillRect(0, 0, px, px);
    }
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(img, 0, 0, px, px);
    return canvas;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function canvasToBlob(canvas: HTMLCanvasElement, type: "image/png" | "image/jpeg", quality = 0.95) {
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Image encoding failed."))), type, quality)
  );
}

export type PageSize = "a4" | "letter";

/** Creates a PDF page with the code centred at a physical width (mm). */
export async function svgToPdf(svg: string, opts: { widthMm: number; page: PageSize; fillColor?: string }) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: opts.page, orientation: "portrait" });
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const w = Math.min(opts.widthMm, pw - 20, ph - 20);
  // ~600 dpi at the chosen print width, within sane limits.
  const px = Math.round(Math.min(4000, Math.max(800, (w / 25.4) * 600)));
  const canvas = await svgToCanvas(svg, px, opts.fillColor);
  doc.addImage(canvas.toDataURL("image/png"), "PNG", (pw - w) / 2, (ph - w) / 2, w, w, undefined, "FAST");
  return doc.output("blob");
}

/** Prints the code at a physical size using a hidden iframe. */
export function printSvg(svg: string, widthMm: number) {
  return new Promise<void>((resolve, reject) => {
    const iframe = document.createElement("iframe");
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument;
    const win = iframe.contentWindow;
    if (!doc || !win) {
      iframe.remove();
      reject(new Error("Printing isn't available in this browser."));
      return;
    }
    const url = URL.createObjectURL(svgBlob(svg));
    doc.open();
    doc.write(
      `<!doctype html><title>ScanHatch QR code</title><style>@page{margin:15mm}html,body{margin:0;height:100%}body{display:flex;align-items:center;justify-content:center}img{width:${widthMm}mm;height:${widthMm}mm}</style><img alt="QR code" src="${url}">`
    );
    doc.close();
    const img = doc.querySelector("img");
    const go = () => {
      win.focus();
      win.print();
      setTimeout(() => {
        iframe.remove();
        URL.revokeObjectURL(url);
      }, 1000);
      resolve();
    };
    if (img && !img.complete) {
      img.onload = go;
      img.onerror = () => { iframe.remove(); reject(new Error("The code couldn't be prepared for printing.")); };
    } else go();
  });
}

export const canCopyImage = () =>
  typeof window !== "undefined" && typeof ClipboardItem !== "undefined" && !!navigator.clipboard?.write;

export async function copyImageBlob(blob: Blob) {
  await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
}

export async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
}

export function canShareFiles() {
  if (typeof navigator === "undefined" || !navigator.canShare) return false;
  try {
    const test = new File([new Blob(["x"], { type: "image/png" })], "t.png", { type: "image/png" });
    return navigator.canShare({ files: [test] });
  } catch {
    return false;
  }
}

export async function shareFile(file: File, title: string) {
  await navigator.share({ files: [file], title });
}
