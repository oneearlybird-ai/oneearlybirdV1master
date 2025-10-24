
# EarlyBird — AI Voice Receptionist (v1.0.1)

PolyAI-style AI voice assistant for business calls: inbound call handling, scheduling, FAQs, routing/transfers, analytics, and billing.

## Monorepo
- `apps/web` — Next.js 14 App Router (marketing site, dashboard, docs)
- `apps/api` — NestJS + Prisma + queues + Stripe/Twilio hooks (scaffolded; ready to extend)
- `prisma` — shared schema (referenced by API)

## Quick Start (local)
```bash
corepack enable
pnpm i

# DB (local or cloud URL)
export DATABASE_URL="postgres://user:pass@localhost:5432/earlybird"

# Migrate + seed
pnpm -C apps/api prisma:migrate:deploy
pnpm -C apps/api prisma:seed

# Run API and Web
pnpm -C apps/api dev
pnpm -C apps/web dev
```

## Deploy
- **API**: AWS (EC2/ECS) — containerized via Dockerfile; Fly-specific configs removed.
- **Web**: Vercel; set `Root Directory` = `apps/web` and `NEXT_PUBLIC_API_URL` to your API base URL.
- **Frontend**: Single-branch workflow (commit and push directly to `main` after lint/build checks; no feature branches). Last deployment: 2025-10-24 — commit `789c533`.

## Environment
See `.env.example` and `apps/api/.env.example` for required secrets.

## Signup Pending Flow
- Successful account creation now routes to `/account/pending`, keeping users in an accessible status view while automation finishes.
- The pending screen polls `GET /provisioning/status` every 4s (up to 120s). After 60s we surface a “taking longer than usual” hint; at 120s polling pauses until the user presses “Keep checking”.
- Failed provisioning responses surface the backend `lastErrorCode` and expose a retry CTA that invokes `POST /provisioning/retry` (max three attempts) before nudging the user to email support@oneearlybird.ai.
- Network/CORS errors render an inline “Server unreachable. Retry.” banner with a single manual retry; subsequent issues leave the poll idle for observability.
- The dashboard mirrors provisioning state: metrics/buttons stay in read-only skeleton mode while status=Pending/Failed, and minutes usage alerts fire at 50%/80%/95% thresholds.
- Dashboard quick links now include an integrations preview for Google Calendar, Microsoft 365, Calendly, and CRM (HubSpot/Salesforce); buttons route to `/dashboard/integrations` but remain disabled until backend runbooks ship.
