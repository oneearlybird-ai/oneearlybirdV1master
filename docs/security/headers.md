# Security Headers

Single‑source header policy is enforced in `apps/web/middleware.ts`.

Headers
- Content‑Security‑Policy: Nonce‑based policy; no inline/eval. Scripts/styles require the per‑request nonce.
- Strict‑Transport‑Security: `max-age=63072000; includeSubDomains; preload`
- Cross‑Origin‑Opener‑Policy: `same-origin`
- Cross‑Origin‑Embedder‑Policy: `require-corp`
- Permissions‑Policy: Deny list for geolocation, camera, microphone, payment, usb, xr, pip, etc.
- X‑Content‑Type‑Options: `nosniff`
- Referrer‑Policy: `strict-origin-when-cross-origin`
- X‑XSS‑Protection: `0`
- x‑nonce: response header exposes the CSP nonce for server‑rendered templates

Next.js Config
- `poweredByHeader: false` in `apps/web/next.config.js`.
- Sensitive webhooks set `export const runtime = 'nodejs'` and `export const dynamic = 'force-dynamic'`.

