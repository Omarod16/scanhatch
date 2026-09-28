/**
 * Streaming ZIP builder (fflate). Each file is written into the archive as soon as
 * it's produced, so individual images don't accumulate in memory. PNGs are stored
 * (already compressed); text files are deflated. Loaded only when a batch runs.
 */
export interface ZipBuilder {
  add(name: string, data: Uint8Array, compress: boolean): void;
  finish(): Promise<Blob>;
  abort(): void;
}

export async function createZip(): Promise<ZipBuilder> {
  const { Zip, ZipDeflate, ZipPassThrough } = await import("fflate");
  const chunks: Uint8Array[] = [];
  let failed: Error | null = null;
  let done: ((b: Blob) => void) | null = null;
  let fail: ((e: Error) => void) | null = null;
  const result = new Promise<Blob>((resolve, reject) => { done = resolve; fail = reject; });

  const zip = new Zip((err, data, final) => {
    if (err) { failed = err; fail?.(err); return; }
    chunks.push(data);
    if (final) done?.(new Blob(chunks as BlobPart[], { type: "application/zip" }));
  });

  return {
    add(name, data, compress) {
      if (failed) throw failed;
      const file = compress ? new ZipDeflate(name, { level: 6 }) : new ZipPassThrough(name);
      zip.add(file);
      file.push(data, true);
    },
    finish() {
      zip.end();
      return result;
    },
    abort() {
      zip.terminate();
      chunks.length = 0;
    },
  };
}
