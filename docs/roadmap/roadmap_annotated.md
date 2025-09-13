<!-- Imported from Desktop/untitled folder 2/roadmap_annotated.txt -->

[Content migrated from local note for version control; see repository history for edits.]

EarlyBird — Roadmap (Annotated, Team 5 Handoff)
Date: 2025-09-10

Primary URLs
- Prod: https://oneearlybird.ai
- Latest Vercel prod (may rotate): https://oneearlybird-v1master-l1qi0xxvt-chris-projects-45b85c02.vercel.app

Workflow & Guardrails
- Workflow v1.7; SVP ≤2 files/≤120 LOC; one batch per change.
- Anti-Drift Gate header before every action.
- Gates: Typecheck → Build → Manifest → Header smoke → Endpoint smokes.

Security Baseline (single source = middleware)
- CSP with per-request nonce; no unsafe-inline/eval.
- HSTS preload; COOP=same-origin; COEP=require-corp.
- Permissions-Policy deny list; X-XSS-Protection: 0; nosniff; no x-powered-by.
- Webhooks Node runtime + force-dynamic; never cached.

Phases — Status (%)
- 1 Manifest verify ............. 100% | /api/routes/manifest 200 on prod.
- 2 Stripe webhook .............. 100% | Raw body + signature verify; unsigned 400.
- 3 Twilio ingress .............. 90%  | Unsigned 403; TwiML Connect/Stream; media WSS pending.
- 4 S3 wrapper .................. 100% | Presign GET/PUT; Rumble endpoint + path-style.
- 5 Rate-limit proof ............ 100% | 200→429; cooldown → 200.
- 6 Env template audit .......... 90%  | Placeholders added; Vercel envs seeded; dedupe pending.
- 7 Voice ops stubs ............. 0%   | transfer/dial/recording/status present; unverified.
- 8 KB stubs .................... 50%  | search/doc present; no smoke.
- 9 Stripe usage (GET) .......... 50%  | present; UI wiring pending.
-10 Integrations & numbers ...... 40%  | oauth/start, numbers/buy/webhook present; smokes pending.
-11 Agent tool (deny-first) ..... 50%  | route present; tighten policy.
-12 Health polish ............... 80%  | /health, /status present; headers green.
-13 Docs & artifacts ............ 65%  | Media note, Anti-Drift, roadmap added.

Routes — Present / Smokes
- GET  /api/routes/manifest .... 200 (prod)
- GET  /api/status ............. 200
- GET  /api/ratelimit-test ..... 200→429→200 (cooldown)
- POST /api/stripe/webhook ..... unsigned 400 (prod)
- POST /api/voice/incoming ..... unsigned 403; TwiML OK
- POST /api/storage/presign .... PASS (x-smoke-key; template enforced)
- POST /api/voice/{ops} ........ present (no smoke)
- POST /api/tools/{*} .......... present (no smoke)
- POST /api/kb/{search|doc} .... present (no smoke)
- GET  /api/usage/summary ...... present (no smoke)
- GET  /api/stripe/usage ....... present (no smoke)
- POST /api/billing/portal ..... present (no smoke)
- GET  /api/integrations/oauth/start ... present (no smoke)
- POST /api/numbers/{buy|webhook} ..... present (no smoke)

Integrations — Matrix
- Stripe: webhook verified; usage present; portal present.
- Twilio: ingress verified; media Streams handoff pending.
- S3/Object: AWS SDK v3; presigned GET/PUT; S3-compatible endpoint support.
- Neon Postgres: pooled DSN (-pooler) planned; not smoked.
- Upstash Redis: limiter backend; proven 200→429.
- OAuth start: present; safe redirect scaffold.

Security/Compliance — Controls
- Headers via middleware (CSP nonce, HSTS, COOP/COEP, PP deny, XSS=0, nosniff, no x-powered-by).
- Stripe: raw body then constructEvent; no PHI/secrets in logs.
- Twilio: X-Twilio-Signature; JSON/form aware; validates full external URL.
- Storage: server-only client; short-TTL presign; no PHI in keys/logs.
- CORS: never * on Protected; secrets via env only (no hardcoding).

Storage Key Template — Enforced
- {env}/tenants/{tenantId}/{type}/{yyyy}/{mm}/{dd}/{objectId}.{ext}
- Env must match VERCEL_ENV (prod/preview/dev); validates date; no traversal.

Smokes — Evidence
- Headers (/) show CSP nonce, HSTS preload, COOP/COEP, PP deny, XSS=0, no x-powered-by.
- Stripe unsigned → 400; Twilio unsigned → 403.
- Presign: returned URL; PUT to Rumble → 200 OK.
- Limiter: 200→429, then 200 after 70s cooldown.

Known Issues / Follow-ups
- Duplicate legacy /api/webhooks/stripe — consider 410 or removal.
- Media WS host (wss://media.oneearlybird.ai) not yet live; Twilio 31920 until ready.
- Env dedupe: one value per env per name; replace placeholders with real values.

Environment Variable Names (placeholders only)
- Stripe: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- Twilio: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_TWIML_APP_SID, MEDIA_WSS_URL, NEXT_PUBLIC_SITE_URL
- S3/Object: AWS_REGION, S3_BUCKET or AWS_S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_ENDPOINT, S3_FORCE_PATH_STYLE, S3_SIGNED_URL_EXPIRES
- DB/Cache: POSTGRES_URL, POSTGRES_URL_NON_POOLING, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
- Smokes/Flags: SMOKE_KEY

Frontend Wiring — State
- Design freeze; pages present: /, /login, /signup, /dashboard, /dashboard/usage, /dashboard/billing, etc.
- Minimal wiring pending for Usage/Billing/Numbers/Settings against /api/routes/manifest.

Next Actions (Team 5)
- Media: deploy WSS, verify 101 upgrade + latency target; set MEDIA_WSS_URL.
- Stripe: CLI smoke signed events; confirm 2xx.
- Cleanup: deprecate legacy stripe webhook; env dedupe.
- UI: minimal affordances to existing endpoints (no inline scripts; no header duplication).

