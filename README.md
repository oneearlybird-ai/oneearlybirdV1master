
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

## Environment
See `.env.example` and `apps/api/.env.example` for required secrets.
