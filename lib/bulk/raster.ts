/** Reusable SVG → PNG rasteriser for batches (one canvas for the whole batch). */
export function createRasterizer() {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser couldn't create an image canvas.");
  return {
    async toPng(svg: string, width: number, height: number, fill?: string): Promise<Uint8Array> {
      const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
      try {
        const img = new Image();
        img.decoding = "async";
        img.src = url;
        await img.decode();
        canvas.width = width;
        canvas.height = height;
        ctx.clearRect(0, 0, width, height);
        if (fill) { ctx.fillStyle = fill; ctx.fillRect(0, 0, width, height); }
        ctx.drawImage(img, 0, 0, width, height);
        const blob = await new Promise<Blob>((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("PNG encoding failed."))), "image/png"));
        return new Uint8Array(await blob.arrayBuffer());
      } finally {
        URL.revokeObjectURL(url);
      }
    },
    dispose() {
      canvas.width = 0;
      canvas.height = 0;
    },
  };
}
