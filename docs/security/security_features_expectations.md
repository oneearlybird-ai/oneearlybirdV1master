<!-- Imported from Desktop/untitled folder 2/security_features_expectations.txt -->

EarlyBird — Security Features & Expectations (Team 5 Handoff)

Date: 2025-09-10

Scope
- Production URL: https://oneearlybird.ai
- Latest observed Vercel prod URL (may rotate): https://oneearlybird-v1master-…vercel.app
- This document summarizes the security posture, guardrails, and checks enforced across backend, integrations, storage, and process.

[Content migrated from local note for version control; see repository history for edits.]

EarlyBird — Security Features & Expectations (Team 5 Handoff)
Date: 2025-09-10

Scope
- Production URL: https://oneearlybird.ai
- Latest observed Vercel prod URL (may rotate): https://oneearlybird-v1master-l1qi0xxvt-chris-projects-45b85c02.vercel.app
- This document summarizes the security posture, guardrails, and checks enforced across backend, integrations, storage, and process.

1) Headers & Edge Baseline (Single Source)
- Single source: central Edge middleware sets all headers. No header duplication elsewhere (e.g., next.config.js exposes only poweredByHeader=false).
- CSP: Nonce-based policy per request; no unsafe-inline/eval; scripts and styles require the nonce.
- HSTS: max-age=63072000; includeSubDomains; preload.
- Cross-origin isolation: COOP=same-origin; COEP=require-corp (or credentialless rationale if needed).
- Permissions-Policy: deny list for geolocation, camera, microphone, payment, usb, xr, pip, etc.
- X-Content-Type-Options: nosniff; X-XSS-Protection: 0; no x-powered-by.
- Verified on production responses via smokes.

2) Edge Safety & Runtime Controls
- Middleware runs on Edge, avoids Node-only APIs; per-request WebCrypto nonce.
- Sensitive API routes declare: runtime='nodejs' and dynamic='force-dynamic' to prevent caching.
- No inline scripts in frontend; no duplicated header logic.

3) Webhooks (Signed, Never Cached)
- Stripe (POST /api/stripe/webhook):
  - Node runtime + force-dynamic; reads raw body (req.text()).
  - Verifies signature with official Stripe SDK; invalid/unsigned → 400.
  - Minimal, safe handling; no PHI or secrets in logs.
- Twilio (POST /api/voice/incoming):
  - Node runtime + force-dynamic.
  - Validates X-Twilio-Signature using official SDK; supports both JSON (validateRequestWithBody) and form (validateRequest).
  - Validates against the full external URL derived from NEXT_PUBLIC_SITE_URL.
  - Unsigned/invalid → 403; success returns TwiML <Connect><Stream url="${MEDIA_WSS_URL}"/>.

4) Storage (S3/Object) Security
- Server-only AWS SDK v3 wrapper; not importable client-side.
- Presigned URL helpers (GET/PUT) with controlled expiry (env-driven), no credential exposure to client.
- Supports S3-compatible endpoints (e.g., Rumble) via S3_ENDPOINT and S3_FORCE_PATH_STYLE=true.
- Protected presign route (POST /api/storage/presign):
  - Requires x-smoke-key header equal to SMOKE_KEY (env configured on server only).
  - Strict key template enforced: {env}/tenants/{tenantId}/{type}/{yyyy}/{mm}/{dd}/{objectId}.{ext}
  - Validates env against VERCEL_ENV; validates date; restricts charset; blocks traversal.
  - Returns signed URLs only on valid auth + key shape; otherwise 4xx.

5) Rate Limiting
- Route present: GET /api/ratelimit-test.
- Expectation: smoke must demonstrate 200 then 429 from same client key; no wildcard CORS; no caching.

6) HIPAA/Data Hygiene
- Public vs Protected zones defined; no PHI to non-BAA vendors (e.g., S3/Neon/Redis vendors must be considered for PHI scope).
- No PHI or secrets in application logs; redact tokens and sensitive identifiers.
- Avoid logging full request bodies on sensitive endpoints; log minimal metadata only.

7) Secrets Management
- No hardcoded secrets in code. Only .env.example placeholders are committed.
- Vercel env management used for actual values (production/preview scoped). Enforce one value per env per name (dedupe extras).
- Client-side exposure only for NEXT_PUBLIC_* variables (e.g., publishable Stripe key); all others server-only.

8) CORS & Caching
- No '*' CORS on Protected/PHI endpoints.
- Webhooks/sensitive routes are dynamic=no-cache. CDN/cache headers reflect no-store/no-cache as appropriate.

9) Input Validation & Deny-by-Default
- Storage presign route validates JSON body, 'op' (upload|download), key shape, and environment.
- Agent tool endpoint present with deny-by-default policy (tighten as features land).
- Rejects malformed inputs early with explicit 4xx.

10) Integrations Security Posture
- Stripe: webhook signature verify; usage route present; billing portal endpoint present.
- Twilio: signed ingress; TwiML connect; Media Streams WS handoff planned (separate host), with TLS 443 and 101 upgrade.
- Object storage: presigned operations only; server-only credentials; S3-compatible support.
- Neon Postgres: planned pooled DSN (-pooler) for app; unpooled only for admin/migrations.
- Upstash Redis: rate limiter backend (smoke pending for 200→429).
- OAuth start: safe redirect scaffold present; finalize with strict allowlists.

11) Media Streams (Operational Expectations)
- Host media server off Vercel (Fly/Railway/EC2) to support long-lived WebSocket.
- TLS 443 with valid cert; path /rtm/voice upgrades with HTTP 101; ping/pong; safe closure.
- Follow Twilio Media Streams framing; target end-to-end latency 500–700 ms.
- No PHI in media logs; redact tokens and IDs.

12) Process Controls & Workflow Discipline
- Workflow v1.7; SVP discipline per change (≤2 files or ≤120 LOC), single deterministic batch.
- Anti-Drift Gate at the top of Team messages (precedes Probe → SVP Patch → Gates → Verdicts).
- Prefer surgical, minimal changes and explicit validation (typecheck/build/smokes).
- Frontend wiring under strict design freeze (add only minimal buttons/tabs/panels to wire to existing endpoints).

13) Validated Smokes (Non-secret Evidence)
- /api/routes/manifest → 200 with canonical routes.
- /api/stripe/webhook unsigned → 400.
- /api/voice/incoming unsigned → 403.
- /api/storage/presign with compliant key + SMOKE_KEY → presigned PUT URL returned; PUT upload → 200 OK on provider.
- Root (/) headers show CSP nonce, HSTS preload, COOP/COEP, Permissions-Policy deny, X-XSS-Protection: 0, and no x-powered-by.

14) Known Todos/Follow-ups
- Rate-limit smoke (200→429) and documentation of limiter keys.
- Media server deployment and Twilio media handshake smoke (avoid Twilio 31920 handshake errors).
- Remove/disable legacy duplicate Stripe route (/api/webhooks/stripe) if not used.
- Dedupe Vercel env entries; replace placeholders with real values; restrict access.
- Tighten agent tool deny-by-default with schema validation and audit logs.

15) References (Internal, Non-secret)
- Roadmap (annotated): apps/web/docs/roadmap_annotated.txt
- Media Streams notes: apps/web/docs/media/README.md
- Anti-Drift Gate: apps/web/docs/anti-drift-gate.md

