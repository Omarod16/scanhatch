# ScanHatch

QR & Barcode Tools — https://scanhatch.com

Next.js 16 (App Router, static export) + TypeScript + Tailwind CSS v4, deployed as
static assets on Cloudflare Workers (`wrangler.jsonc` → `./out`). There's no server,
API or database: every tool runs in the browser.

## Commands

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static site in ./out (prebuild copies the ZXing WebAssembly file into public/zxing/)
npx tsc --noEmit
npx wrangler deploy --dry-run   # check what Cloudflare will upload
```

## Architecture

- `lib/tools.ts`: registry of tools and pages. It drives navigation, the footer and the
  sitemap. Only `status: "live"` entries are shown publicly.
- `lib/qr/`: QR engine (content types, matrix via `qrcode`, SVG renderer, readability
  warnings, logo normalisation). `lib/barcode/`: barcode engine (bwip-js, loaded lazily),
  formats, check digits and guides.
- `lib/scanner/`: camera and image decoding with zxing-wasm (self-hosted `.wasm`), payload
  parsing and session-only scan history. `lib/images/dimensions.ts` rejects oversized
  images from their headers before decoding.
- `lib/validate/`: barcode, QR-content and QR-image validators. `lib/bulk/` and `lib/csv/`:
  CSV-to-ZIP bulk generation (PapaParse, fflate), limited to 500 rows and 1 MB.
- `lib/landing/`: SEO landing pages. `lib/blog/`: articles as structured data.
- `lib/downloads/export.ts`: PNG/JPG/SVG/PDF export, print, copy and share. jsPDF loads
  only when a PDF is requested.
- `lib/consent/`: consent abstraction; fail-closed, with no CMP configured.
- `lib/analytics.ts`: typed events. No provider is configured, and properties are
  restricted to ids, counts and booleans.
- `lib/ads/config.ts` and `components/ads/AdSlot.tsx`: ads are disabled.
  `NEXT_PUBLIC_ADS_MODE` = `disabled` (default) | `placeholder` | `enabled`; `enabled`
  still renders nothing until a publisher ID, a CMP and a reviewed loader exist.
- `lib/site.ts`: site constants and the owner details used by the legal pages.
- `public/_headers`: caching and security headers (CSP, nosniff, Referrer-Policy,
  Permissions-Policy, frame blocking).

## Documentation

- `docs/DATA-FLOW.md`: what data goes where, per tool.
- `docs/LEGAL-AND-ADS-SETUP.md`: owner details, legal review, consent and future AdSense.
- `docs/PRODUCTION-CHECKLIST.md`: Cloudflare domain, workers.dev, HTTPS/HSTS and
  post-deploy checks.
- `docs/REAL-DEVICE-TEST-PLAN.md`: manual tests on phones and other browsers.
