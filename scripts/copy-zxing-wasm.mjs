// Copies the ZXing WebAssembly decoder into /public so it's served from our own
// domain (no third-party CDN request). Runs automatically before dev and build.
import { copyFileSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";

// The package's `exports` map hides package.json, so locate it directly.
const pkgDir = join(process.cwd(), "node_modules", "zxing-wasm");
const { version } = JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8"));
const src = join(pkgDir, "dist", "reader", "zxing_reader.wasm");
const outRoot = join(process.cwd(), "public", "zxing");
rmSync(outRoot, { recursive: true, force: true });
mkdirSync(join(outRoot, version), { recursive: true });
copyFileSync(src, join(outRoot, version, "zxing_reader.wasm"));
console.log(`zxing-wasm ${version}: copied reader to public/zxing/${version}/`);
