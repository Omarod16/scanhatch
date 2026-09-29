# Real-device test plan (run after deployment, before announcing)

Automated testing so far used **headless Chromium 141 only**, with emulated mobile
viewports and a fake camera. Nothing below has been tested on real devices or in
Safari/Firefox. Tick each cell; record failures with device, OS/browser version,
page, steps and screenshot. Use dummy data only (e.g. WiFi password
`TEST-WIFI-PASSWORD-123`, phone +44 7700 900000).

**All items are manual post-deployment tests. None of them has been completed yet.**

Devices: **iOS Safari** (current iPhone), **Android Chrome**, **Desktop Chrome**,
**Desktop Edge**, **Desktop Firefox**, **Desktop Safari** (macOS).

| # | Test | Steps | Expected | iOS Safari | Android Chrome | Chrome | Edge | Firefox | Safari |
|---|---|---|---|---|---|---|---|---|---|
| 1 | QR generation | /qr-code-generator: URL, WiFi, vCard; change colours; add a PNG logo | Preview updates; warnings appear for low contrast / big logo | | | | | | |
| 2 | QR downloads | PNG, SVG, JPG, PDF | Files open; PDF is sharp when zoomed; scanning the file with another phone works | | | | | | |
| 3 | Barcode generation | /barcode-generator: EAN-13 (12 digits), Code 128, Data Matrix | Check digit added; preview correct | | | | | | |
| 4 | Barcode downloads | PNG, SVG, PDF | Files open; print size matches the stated mm | | | | | | |
| 5 | Print | Print from QR and barcode generators | Print dialog shows the code at the stated size; if print fails, a message appears (Download still works) | | | | | | |
| 6 | Copy / Share | Copy image, Share (where shown) | Works, or the button is hidden; no error without explanation. **Safari: check Copy image specifically** | | | | | | |
| 7 | Camera scanner | /scanner: Start camera, scan a QR on paper and on another screen | Asks permission only after pressing Start; rear camera on phones; result shown, nothing auto-opens; camera light goes off after detection | | | | | | |
| 8 | Camera denied | Deny the permission, then press Try again | Clear "Camera access was blocked…" message | | | | | | |
| 9 | Camera lifecycle | Start camera, switch to another app/tab, come back | Camera indicator turns off while away; "Resume camera" works | | | | | | |
| 10 | Torch / zoom | On a phone with a torch | Flashlight/zoom only shown if supported; they work | | | | | | |
| 11 | Image decoder | /qr-decoder and /barcode-decoder: upload a photo, drag & drop (desktop), paste a screenshot | Correct value; HEIC photo gives the HEIC message | | | | | | |
| 12 | Scan history | Scan 2 codes, reload, open a new tab, Clear history | Kept after reload in the same tab; not in a new tab; cleared | | | | | | |
| 13 | Validators | /barcode-validator, /ean-upc-validator, /itf-14-validator, /check-digit-calculator, /qr-validator | Valid/invalid verdicts and explanations | | | | | | |
| 14 | Bulk tools (desktop) | /bulk-qr-generator and /bulk-barcode-generator with the templates; then a 500-row file; Cancel once | ZIP downloads and opens; index.csv and skipped-rows.csv present; cancel produces no ZIP; page stays responsive | | | | | | |
| 15 | Mobile navigation | Open/close menu, use Escape (keyboard), follow links | Menu works; no horizontal scrolling on any page | | | | | | |
| 16 | Blog & legal | Open 3 articles, /privacy-policy, /terms, /cookie-policy, /contact | Readable; tables scroll inside their box; links work | | | | | | |
| 17 | 404 | Visit /does-not-exist | ScanHatch 404 page with links | | | | | | |
| 18 | Production headers | Open DevTools → Network on any page | No "Refused to…" CSP errors in the console; static JS cached (`max-age=31536000, immutable`) | | | | | | |
| 19 | Cookies/scripts check | Clean profile, DevTools → Application | No cookies set by ScanHatch; list anything Cloudflare adds and update the cookie policy | | | | | | |
| 20 | Landing pages | Open 3 QR and 3 barcode landing pages (e.g. /wifi-qr-code-generator/, /ean-13-barcode-generator/, /data-matrix-generator/) | The right type/format is preselected; the tool works; "Further reading" links work | | | | | | |
| 21 | Deep links | Open /barcode-generator/#ean13:4006381333931, /barcode-validator/#code128, /qr-code-generator/#wifi and /qr-code-generator/#url=https%3A%2F%2Fexample.com%2F%3Fa%3D1%26b%3D2 | Format/type preselected; prefilled value shown in full | | | | | | |
| 22 | Screen readers | VoiceOver (iOS and macOS), TalkBack (Android), NVDA (Windows): create a QR code, download it, decode an image, fix a bulk row | Controls announced with sensible names; results and errors are read out; focus stays in a logical place | | | | | | |
| 23 | Live sitemap and robots | Open https://scanhatch.com/sitemap.xml and /robots.txt | 200; every URL uses https://scanhatch.com/; robots allows crawling and lists the sitemap | | | | | | |
| 24 | Canonical host | View source of 3 pages | `<link rel="canonical">` points to https://scanhatch.com/… | | | | | | |
| 25 | Search Console | Verify the property, submit the sitemap, inspect 4 URLs | Sitemap accepted; inspected URLs show the expected canonical | | | | | | |
| 26 | HTTP → HTTPS | Visit http://scanhatch.com/tools/ | Redirects to https:// | | | | | | |
| 27 | www | Visit https://www.scanhatch.com/ | Redirects to the apex domain, or doesn't resolve if www isn't used (decide which) | | | | | | |
| 28 | workers.dev | Visit https://scanhatch.<subdomain>.workers.dev/ | Doesn't serve the ScanHatch site (see docs/PRODUCTION-CHECKLIST.md) | | | | | | |
| 29 | Slow network | DevTools network throttling "Slow 4G" or a real weak signal: load the barcode generator, export a PDF, decode an image | Pages stay usable; loading states shown; no blank screens | | | | | | |
| 30 | Offline / interruption | Load a tool, go offline, then try PDF export, the barcode engine and image decoding | Plain message such as "Part of ScanHatch couldn't load. Check your connection and reload the page."; no raw errors | | | | | | |
| 31 | Chunk-load failure after a deploy | Keep a page open, deploy a new version, then use PDF export or a lazy tool | Same plain reload message; reloading fixes it | | | | | | |
| 32 | Landscape orientation | Rotate the phone on the scanner, QR generator and a blog article | Layout adapts; camera view isn't distorted | | | | | | |
| 33 | 200% zoom | Desktop browsers at 200% zoom (and phone text size set to largest) | No clipped text or controls; no horizontal scrolling on content pages | | | | | | |
| 34 | PDFs on iOS | Download QR and barcode PDFs on iPhone and open them in Files/Preview | PDF opens and is sharp; the code scans from the screen | | | | | | |
