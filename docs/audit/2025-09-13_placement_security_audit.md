# Placement & Security Audit — 2025-09-13

Scope
- Repo: Desktop/oneearlybirdV1master (Next.js App Router)
- Focus: routing placements, legacy integrations cleanup, security posture

Summary of Changes
- Removed legacy: `apps/web/app/api/rl-smoke/route.ts.bak` (unused)
- Removed legacy: `scripts/deploy_media_railway.sh` (Railway deprecated)
- Unified Stripe webhook path: kept `/api/webhooks/stripe`, removed duplicate `/api/stripe/webhook`
- ElevenLabs webhooks: invalid signature now returns 403 (was 401)
- Docs: moved handoff checklist to `docs/operations/` and updated Media to AWS (`media.oneearlybird.ai`)
- Docs: added `docs/README.md`, `docs/architecture/voice_pipeline.md`, `docs/security/headers.md`, and migration notes
- Docs: imported Desktop notes (security_features_expectations, roadmap_annotated) into `docs/`
- .gitignore: ensured local .env files are ignored; keep only `.example` files tracked

Findings & Recommendations
- Routing
  - App Router structure is correct under `apps/web/app/api/*/route.ts`.
  - Duplicate `upstream` handlers exist at `api/upstream/[...path]` (edge) and `api/_upstream/[...path]` (node). Choose one to avoid confusion; recommend keeping the edge version if `guardUpstream` supports edge.
  - Tools catch‑all `api/tools/[...path]` is deny‑by‑default (501) — good. Keep behind auth when enabling.
- Security
  - Central headers enforced in `apps/web/middleware.ts` — good.
  - Sensitive webhooks declare `runtime='nodejs'` and `dynamic='force-dynamic'` — good.
  - Twilio voice ingress (`/api/voice/incoming`) validates signature and returns TwiML Stream — good.
  - Twilio status callback validates URL‑encoded signature — good.
  - ElevenLabs webhooks validate HMAC (t+v0) — tightened to 403 on failure.
  - Stripe webhook verifies signature and rejects PHI‑like metadata — good. Use `/api/webhooks/stripe` path.
  - Storage presign requires `x-smoke-key` and validates input — good. Consider enforcing a stricter key template as noted in security expectations.
- Secrets & Env
  - Local `.env.*` files are now ignored via `.gitignore`. If any non‑example env files were previously committed, remove from Git history and rotate tokens.
- Legacy Cleanup
- Removed Railway and Fly scripts and references in handoff checklist. Some historical docs still mention Railway/Deepgram; kept for context but marked in `docs/migration/`.

Next Steps
- Confirm `MEDIA_WSS_URL` points to your AWS media server (ALB): `wss://media.oneearlybird.ai/rtm/voice`.
- Decide on a single upstream proxy route and remove the alternate.
- Run smokes:
  - `/api/ratelimit-test` → 200 then 429 per client key
  - `/api/webhooks/stripe` with Stripe CLI (signed events) → 2xx
  - `/api/voice/incoming` (Twilio simulator) → TwiML Stream
- Invite Vercel team if needed and set envs via `vercel env`.
