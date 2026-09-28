# Legal pages, consent and AdSense: owner setup

Phase 9 prepared the legal pages and the consent/ads architecture. **Ads are
intentionally disabled.** None of this is a legal opinion: the pages describe the
site's actual behaviour and need owner and legal review before launch.

## MANUAL CONFIGURATION REQUIRED

| Item | Where | Why |
|---|---|---|
| Contact email | `OWNER.contactEmail` in `lib/site.ts` | The contact page and policies need a real address for support and privacy requests. Until it's set, /contact shows "A contact email address … will be published on this page." |
| Operator identity (data controller) | `OWNER.operatorName` in `lib/site.ts` | UK data protection law expects privacy notices to identify the controller. Decide whether that's you as an individual or a business entity |
| Governing law | `OWNER.governingLaw` in `lib/site.ts` | The Terms omit the governing-law clause until this is set. Confirm with legal advice |
| Legal review | `/privacy-policy`, `/terms`, `/cookie-policy` | In particular: lawful bases (hosting logs); whether scan history counts as storage "strictly necessary" for a service the user requested under PECR, or should be opt-in or described differently; the liability wording; international transfers via Cloudflare |
| Cloudflare edge features | Cloudflare dashboard | Verify which scripts and cookies Cloudflare adds in production (see docs/DATA-FLOW.md), and enable "Always Use HTTPS" |
| `LEGAL_UPDATED` | `lib/site.ts` | Update whenever policy text changes |

## Consent architecture (`lib/consent/`)

- Categories: `necessary` (always on), `analytics`, `advertising`, `preferences`.
- The current provider is `noCmpProvider` (id `"none"`). It reports optional categories as NOT granted. That's a fail-closed default, not a recorded choice.
- `hasConsent(category)` and `useConsent(category)` gate optional code. `lib/analytics.ts` checks analytics consent before sending.
- `/cookie-policy` renders `ConsentStatus`, which shows a "Manage privacy choices" button automatically once a provider exposes `openPreferences`.
- **Never hard-code a granted state.**

### Adding a CMP (required before personalised ads for UK/EEA/Swiss users)

1. Choose a Google-certified CMP integrated with the IAB TCF v2.2. Google's own option is **Privacy & messaging** in the AdSense account.
2. Load the CMP according to its documentation, before any ad or analytics tag.
3. Implement a `ConsentProvider` that reads the CMP's signals (for TCF, `__tcfapi("addEventListener", 2, …)`), maps them to the four categories, and exposes `openPreferences` (e.g. the CMP's revocation or preferences UI). Register it with `setConsentProvider`.
4. Test: refuse, accept and change choices; confirm nothing optional loads before consent.
5. Update `/privacy-policy` and `/cookie-policy` to name the CMP, Google, and the cookies used.

## AdSense (`lib/ads/config.ts`, `components/ads/AdSlot.tsx`)

- `NEXT_PUBLIC_ADS_MODE`: `disabled` (default) | `placeholder` (labelled empty boxes for layout review; no ad requests) | `enabled`.
- `enabled` still renders nothing until: a publisher ID is supplied (`NEXT_PUBLIC_ADSENSE_CLIENT`, set in the build environment, never committed as a fake value), a CMP provider is registered, advertising consent is granted, and the AdSense loader is implemented and reviewed. The loader intentionally doesn't exist yet (`ADSENSE_LOADER_IMPLEMENTED = false`).
- Reserved placements: `landing-content` (inside landing-page article content, below the tool and its privacy notice), `article-mid` (before an article's FAQ), and `article-end` (after an article, before related tools). None is inside or next to generator controls, Generate or Download buttons.
- Activation is a controlled deployment step: get AdSense approval, configure the CMP, implement and review the loader, update the policies, then deploy.

## Security headers must be updated before activation

`public/_headers` sets a strict Content-Security-Policy (Phase 10). With it, the
browser will BLOCK AdSense, Google's CMP and any analytics script, because
`script-src`, `connect-src`, `img-src` and `frame-src` only allow ScanHatch's own
origin. As part of the controlled activation step, add exactly the origins that
Google's current AdSense and Privacy & Messaging documentation lists (scripts,
frames, images and connections), test with the browser console open for
"Refused to …" CSP errors, and keep everything else unchanged. Don't loosen the
policy to `*` or remove it.
