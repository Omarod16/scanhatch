# ScanHatch data-flow report

Internal record of how user data moves through ScanHatch. It's based on the code
(storage and network APIs in `app/`, `components/`, `lib/`) and on a browser network
test with dummy sensitive values (WiFi password `TEST-WIFI-PASSWORD-123`, "Jane Example",
`+447700900000`, `jane@example.com`, barcode `SENSITIVE-BC-789`) on 2026-09-28.
Keep this file up to date whenever a feature touches storage, the network or third parties.

## Summary

| Stage | Finding |
|---|---|
| Processing | All tools process content in the browser (qrcode, bwip-js, zxing-wasm, PapaParse, fflate, jsPDF/svg2pdf) |
| Network | Only GET/HEAD requests to the site's own origin for pages, JS/CSS chunks, fonts and the ZXing `.wasm`. No request contained user content, in any tool |
| App code network APIs | None (`fetch`, XHR, `sendBeacon`, WebSocket: not used) |
| Cookies | None set by the application |
| localStorage / IndexedDB | Not used |
| sessionStorage | `scanhatch:scan-history`, written only by the Scanner and Decoder tools |
| Analytics | `lib/analytics.ts`: no provider configured, sends nothing. Props are ids, counts and booleans only; `safeProps` drops anything else; sending is gated on analytics consent |
| Third parties | Cloudflare (hosting and CDN) receives normal HTTP requests (IP address, user agent, URL). Fonts and the ZXing wasm are self-hosted |
| Ads | None. `AdSlot` mode is `disabled` |

## Per tool

| Tool | Input | Processing | Network | Storage | Analytics |
|---|---|---|---|---|---|
| QR generator and QR landing pages | Content fields, logo image | Browser (qrcode, custom SVG renderer; logos re-encoded via canvas) | Own-origin chunks only (jsPDF chunk loaded on PDF export) | None | `qr_generated {contentType}`, `qr_downloaded {format}`, `qr_copied`, `qr_shared`, `qr_printed`, `tool_selected`, `seo_tool_opened {page, kind}` |
| Barcode generator and barcode landing pages | Value, options | Browser (bwip-js, lazy) | Own-origin chunks only | None | `barcode_generated {format}`, `barcode_downloaded {format, type}`, `tool_selected` |
| Scanner (camera) | Camera frames | Browser (zxing-wasm); stream stopped on detect, pause, tab hide or unmount | Own-origin chunks and `/zxing/<version>/zxing_reader.wasm` | Result added to `scanhatch:scan-history` | `scanner_used {source}` |
| Decoder (image) | PNG/JPG/WEBP file or paste | Browser; file type sniffed, size and pixel limits | As scanner | Results added to `scanhatch:scan-history` | `decoder_used {success}` |
| QR validator | Image or camera | Browser | As scanner | None (doesn't write history) | `validator_used {tool, format, valid}` |
| Barcode validator, check digit, EAN/UPC, ITF-14 | Typed value | Browser | Own-origin chunks only | None | `validator_used {tool, format, valid}` |
| Bulk QR / bulk barcode | CSV file | Browser (PapaParse, fflate streaming ZIP) | Own-origin chunks only | None (ZIP held as an object URL in memory until reset or navigation) | `bulk_*_started/completed {count}` |
| Blog, legal pages | None | Static | Own-origin files | None | None |

## Scan history (`lib/scanner/history.ts`)

- Key `scanhatch:scan-history` in `sessionStorage`, holding JSON `[{ id, at, format, value, source }]`.
- Maximum 25 entries, newest first. An identical result within 3 seconds is ignored.
- The FULL decoded value is stored, including WiFi passwords. The UI preview masks WiFi passwords (`maskSecrets`), but the stored value doesn't.
- It disappears when the user removes entries, presses Clear history, or closes the tab. Browsers may restore session storage when a tab or session is restored.
- It's readable by same-origin scripts in that tab only. It's never transmitted.

## User-initiated hand-offs (not automatic)

Download (file to device), Copy (clipboard), Share (OS share sheet; the chosen app receives the image),
Open link / Call / Email / Text on scan results (opens the third-party site or app).

## Must be verified after deployment (can't be seen locally)

Cloudflare dashboard features can add scripts or cookies at the edge: Web Analytics
auto-injection, Bot Fight Mode or bot management (`__cf_bm`), challenges (`cf_clearance`),
Rocket Loader, Email Obfuscation. After the first deploy, load the site in a clean browser,
list its cookies and scripts, and update the cookie and privacy policies if anything appears.
