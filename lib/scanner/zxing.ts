/**
 * Lazy loader for the ZXing WebAssembly decoder. Nothing is downloaded until a
 * scanner or decoder actually needs it, and the .wasm file is served from our
 * own domain (see scripts/copy-zxing-wasm.mjs), never a third-party CDN.
 */
import type { ReaderOptions, ReadResult } from "zxing-wasm/reader";

type ZX = typeof import("zxing-wasm/reader");
let loading: Promise<ZX> | null = null;

export function loadDecoder(): Promise<ZX> {
  if (!loading) {
    loading = import("zxing-wasm/reader")
      .then(async (m) => {
        await m.prepareZXingModule({
          overrides: {
            locateFile: (path: string, prefix: string) =>
              path.endsWith(".wasm") ? `/zxing/${m.ZXING_WASM_VERSION}/${path}` : prefix + path,
          },
          fireImmediately: true,
        });
        return m;
      })
      .catch((e) => {
        loading = null;
        throw e;
      });
  }
  return loading;
}

export async function decodeImageData(data: ImageData, options: ReaderOptions): Promise<ReadResult[]> {
  const zx = await loadDecoder();
  const results = await zx.readBarcodes(data, options);
  return results.filter((r) => r.isValid && r.text !== "");
}

export type { ReadResult };
