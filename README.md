# ScanHatch

QR & Barcode Tools — https://scanhatch.com

Next.js 16 (App Router, static export) + TypeScript + Tailwind CSS v4,
deployed as static assets on Cloudflare Workers (`wrangler.jsonc` → `./out`).

## Commands

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static site in /out
npx wrangler deploy --dry-run   # check what Cloudflare will upload
```

## Architecture

- `lib/tools.ts` — registry of every tool. Only `status: "live"` tools are
  linked from nav, footer and sitemap; `"soon"` tools are shown labelled.
- `lib/qr/` — QR engine: content types & validation (`content.ts`), module
  matrix (`matrix.ts`, uses `qrcode`), SVG renderer (`render.ts`),
  readability checks (`warnings.ts`), logo normalisation (`logo.ts`).
- `lib/downloads/export.ts` — PNG/JPG/SVG/PDF export, print, copy, share.
  jsPDF is loaded only when a PDF is requested.
- `lib/analytics.ts` — event layer (no provider yet). Never send code content.
- `components/ads/AdSlot.tsx` — disabled until `ADS_ENABLED` is set.

Everything runs in the browser. No server, API or database.
