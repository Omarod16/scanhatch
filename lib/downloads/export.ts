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

/** Rasterises an SVG string to a canvas (square unless heightPx is given). */
export async function svgToCanvas(svg: string, px: number, fillColor?: string, heightPx?: number) {
  const url = URL.createObjectURL(svgBlob(svg));
  const h = heightPx ?? px;
  try {
    const img = await loadImage(url);
    const canvas = document.createElement("canvas");
    canvas.width = px;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Your browser couldn't create an image canvas.");
    if (fillColor) {
      ctx.fillStyle = fillColor;
      ctx.fillRect(0, 0, px, h);
    }
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(img, 0, 0, px, h);
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

/**
 * Vector PDF: the SVG is converted to PDF drawing commands (not a screenshot),
 * so it stays sharp at any zoom. `page: "fit"` makes the page the size of the code plus a margin.
 */
export async function svgToVectorPdf(
  svg: string,
  opts: { widthMm: number; heightMm: number; page: PageSize | "fit"; marginMm?: number }
) {
  const [{ jsPDF }, { svg2pdf }] = await Promise.all([import("jspdf"), import("svg2pdf.js")]);
  const margin = opts.marginMm ?? 5;
  const fit = opts.page === "fit";
  const doc = fit
    ? new jsPDF({ unit: "mm", format: [opts.widthMm + margin * 2, opts.heightMm + margin * 2], orientation: opts.widthMm > opts.heightMm ? "landscape" : "portrait" })
    : new jsPDF({ unit: "mm", format: opts.page as PageSize, orientation: "portrait" });
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  // jsPDF rounds page sizes to points, so ignore sub-1% differences.
  const fitScale = Math.min((pw - margin * 2) / opts.widthMm, (ph - margin * 2) / opts.heightMm);
  const scale = fitScale >= 0.99 ? 1 : fitScale;
  const w = opts.widthMm * scale;
  const h = opts.heightMm * scale;
  const el = new DOMParser().parseFromString(svg, "image/svg+xml").documentElement;
  if (el.nodeName !== "svg") throw new Error("The barcode image couldn't be read for PDF export.");
  // svg2pdf measures some elements via the DOM, so attach the SVG off-screen while converting.
  const holder = document.createElement("div");
  holder.style.cssText = "position:fixed;left:-10000px;top:0;visibility:hidden;";
  holder.appendChild(el);
  document.body.appendChild(holder);
  try {
    await svg2pdf(el as unknown as Element, doc, { x: (pw - w) / 2, y: (ph - h) / 2, width: w, height: h });
  } finally {
    holder.remove();
  }
  return { blob: doc.output("blob"), scaled: scale < 1 };
}

/** Prints the code at a physical size using a hidden iframe. */
export function printSvg(svg: string, widthMm: number, heightMm: number = widthMm) {
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
      `<!doctype html><title>ScanHatch</title><style>@page{margin:15mm}html,body{margin:0;height:100%}body{display:flex;align-items:center;justify-content:center}img{width:${widthMm}mm;height:${heightMm}mm;max-width:100%;object-fit:contain}</style><img alt="Code" src="${url}">`
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
