# Production checklist (Cloudflare and domain)

Nothing here is done by the code. These are dashboard and post-deployment checks.
`wrangler.jsonc` deploys the static site in `./out` as a Worker with static assets.
It defines no routes or custom domain, so the domain is attached in the Cloudflare
dashboard.

## Before or at first deploy

| # | Step | How | Verify |
|---|---|---|---|
| 1 | Attach the domain | Workers & Pages → `scanhatch` → Settings → Domains & Routes → add custom domain `scanhatch.com` | `https://scanhatch.com/` loads the ScanHatch homepage |
| 2 | Disable the workers.dev address | Same page → `workers.dev` → Disable. Alternative in source: add `"workers_dev": false` to `wrangler.jsonc` (verified valid with wrangler 4.143 `--dry-run`). Only do this **after** step 1, otherwise the Worker has no public address | `https://scanhatch.<your-subdomain>.workers.dev/` no longer returns the ScanHatch site |
| 3 | Preview URLs | Same page → Preview URLs → disable if you don't want per-version preview hosts to be public | A preview URL no longer serves the site |
| 4 | HTTPS only | SSL/TLS → Edge Certificates → Always Use HTTPS: on | `http://scanhatch.com/` redirects to `https://` |
| 5 | HSTS | SSL/TLS → Edge Certificates → HSTS. Start with a short max-age; only add includeSubDomains/preload when every subdomain is HTTPS | Response has a `Strict-Transport-Security` header |
| 6 | www | Decide whether `www.scanhatch.com` should exist. If so, add a DNS record and a redirect rule `www` → apex (301) | `https://www.scanhatch.com/tools/` redirects to `https://scanhatch.com/tools/` |

## Edge features that conflict with the Content-Security-Policy

`public/_headers` sets a strict CSP (scripts, connections and images from scanhatch.com
only). The browser will **block** these Cloudflare features if they're switched on:
Web Analytics auto-injection (`static.cloudflareinsights.com`), Rocket Loader, Email
Obfuscation, and Zaraz. Leave them off (this also keeps the privacy policy accurate), or
update the CSP and the privacy and cookie policies first.

## After each deploy

| Check | Expected |
|---|---|
| `curl -sI https://scanhatch.com/` | `content-security-policy`, `x-content-type-options: nosniff`, `referrer-policy`, `permissions-policy`, `x-frame-options: DENY` |
| `curl -sI https://scanhatch.com/_next/static/chunks/<any>.js` | `cache-control: public, max-age=31536000, immutable` |
| `curl -sI https://scanhatch.com/zxing/3.1.4/zxing_reader.wasm` | `content-type: application/wasm`, immutable caching |
| `https://scanhatch.com/does-not-exist/` | HTTP 404 with the ScanHatch "Page not found" page |
| `https://scanhatch.com/sitemap.xml`, `/robots.txt` | 200, correct content; every sitemap URL uses `https://scanhatch.com/` |
| Browser console on the scanner, QR generator and a PDF export | No "Refused to …" CSP errors |
| Clean browser profile → DevTools → Application | No cookies from ScanHatch; list anything Cloudflare adds and update the cookie policy |
| Share preview (e.g. a social media post preview tool) | Title, description and `og.png` image show |

## Search Console

Verify the `scanhatch.com` property (DNS verification works with Cloudflare), submit
`https://scanhatch.com/sitemap.xml`, and use URL Inspection on the homepage, one tool,
one landing page and one article to confirm the canonical is `https://scanhatch.com/…`.

## Later (not part of the current release)

AdSense, a Google-certified CMP and any analytics are a separate, controlled activation
step. See `docs/LEGAL-AND-ADS-SETUP.md`: it needs the publisher ID, the CMP, a consent
provider adapter, a reviewed ad loader, a CSP update and policy updates.
