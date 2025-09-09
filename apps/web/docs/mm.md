# EarlyBird — Master Checklist (mm)
_Last update: UTC_

## Completion Summary (backend endpoints per one-line roadmap)
✅ 14 / 23 complete (~61%) · ❌ 9 / 23 planned

### Done (✅, 100%)
- GET /api/status
- GET /api/routes/manifest
- POST /api/voice/incoming (Twilio signature verify → TwiML <Connect><Stream url="${MEDIA_WSS_URL}"/>)
- POST /api/transcript/finalize (202)
- POST /api/tools/book_meeting (501 stub)
- POST /api/tools/transfer_to_owner (501 stub)
- POST /api/tools/create_lead (501 stub)
- POST /api/tools/hours_check (501 stub)
- GET /api/usage/summary
- POST /api/stripe/webhook (RAW body + signature verify)
- POST /api/billing/portal (stub/minimal)
- GET /api/ratelimit-test (200→429 smoke when configured)

### Planned (❌, 0%)
- POST /api/voice/transfer
- POST /api/voice/dial
- POST /api/voice/recording
- POST /api/voice/status
- POST /api/kb/search
- POST /api/kb/doc
- GET  /api/stripe/usage
- GET  /api/integrations/oauth/start
- POST /api/numbers/buy
- POST /api/numbers/webhook
- POST /api/agent/tool

## Security & Posture (must remain true)
- CSP with nonce (no unsafe-inline), HSTS preload, Permissions-Policy deny list, COOP same-origin, COEP require-corp, X-XSS-Protection: 0, X-Content-Type-Options: nosniff, no x-powered-by.
- PHI boundary: Public vs Protected zones; BAA-only vendors for PHI.

## Next Actions (Diamond Team owners)
1) **Voice ops** — implement `/api/voice/transfer`, then `dial`, `recording`, `status`. Owner: Backend · Gate: typecheck/build + unsigned 403 for Twilio when missing signature; TwiML success path 200.  
2) **KB** — implement `/api/kb/search` and `/api/kb/doc` (stubs → typed handlers). Owner: Backend.  
3) **Stripe usage** — GET `/api/stripe/usage` (reads from Stripe, no PHI). Owner: Backend.  
4) **OAuth start** — GET `/api/integrations/oauth/start` (safe redirect scaffold). Owner: Backend/Security.  
5) **Numbers** — `/api/numbers/buy` & `/api/numbers/webhook` (signature validation). Owner: Backend/Security.  
6) **Agent tool** — POST `/api/agent/tool` (typed JSON; deny-by-default). Owner: Backend.

## Gates per change
Typecheck → Build → Route presence → Header smoke on home → Endpoint smoke (codes as specified). Confidence ≥97% or `zz`.
