# ScanHatch

Deployment test for ScanHatch (QR & Barcode Tools).
Next.js App Router + TypeScript + Tailwind CSS, statically exported.

## Local

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # outputs static site to /out
```

## Cloudflare Pages settings

- Framework preset: None (or Next.js (Static HTML Export))
- Build command: `npm run build`
- Build output directory: `out`
- Environment variables: none required (optional: `NODE_VERSION` = `22`)

## Domain

Edit `SITE_URL` in `lib/site.ts` once your domain is live; it feeds the
sitemap, robots.txt and canonical URL.
