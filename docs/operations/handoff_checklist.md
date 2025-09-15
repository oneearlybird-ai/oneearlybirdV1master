# EarlyBird — Handoff Checklist (Team 5)

Date: 2025-09-11

## Domains
- Web (Vercel, prod): `https://oneearlybird-v1master.vercel.app`
- API (AWS): `https://api.yourdomain.com`
- Media (AWS): `https://media.oneearlybird.ai`
  - WS: `wss://media.oneearlybird.ai/rtm/voice`

## Health Endpoints
- Web: `GET /api/usage/summary` and `GET /api/status`
- API: `GET /health` → 200 JSON
- Media: `GET /` → 200 JSON; `WS /rtm/voice` ping→pong

## Environment Variables

### Vercel (Production)
- `NEXT_PUBLIC_API_BASE = https://api.yourdomain.com`
- `API_UPSTREAM = https://api.yourdomain.com`
- `MEDIA_WSS_URL = wss://media.oneearlybird.ai/rtm/voice`
- `NEXT_PUBLIC_SITE_URL = https://oneearlybird-v1master.vercel.app`
- `NEXT_PUBLIC_BASE_URL = https://oneearlybird-v1master.vercel.app`
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

### Media Service (AWS)
- `WS_PATH = /rtm/voice`
- `NODE_ENV = production`
- Health check path: `/` (timeout 5–10s)
- Build method: Dockerfile (apps/media); deploy on EC2 behind an internal ALB with ACM TLS

### API (AWS)
- Deploy API on ECS/EC2 with health check at `/health`. Ensure TLS termination and security groups match ingress expectations.

## Deploy Commands

### Web (Vercel)
```
cd apps/web
vercel link --yes
vercel env add NEXT_PUBLIC_API_BASE production <<< "https://api.yourdomain.com"
vercel env add API_UPSTREAM production       <<< "https://api.yourdomain.com"
vercel env add MEDIA_WSS_URL production      <<< "wss://media.oneearlybird.ai/rtm/voice"
vercel env add NEXT_PUBLIC_SITE_URL production <<< "https://oneearlybird-v1master.vercel.app"
vercel env add NEXT_PUBLIC_BASE_URL production <<< "https://oneearlybird-v1master.vercel.app"
vercel deploy --prod --confirm
```

### API (AWS)
```
# Deploy via ECS/EC2. After deploy:
curl -i https://api.yourdomain.com/health
```

### Media (AWS)
```
# Deploy on EC2 behind ALB.
curl -i https://media.oneearlybird.ai/
npx -y wscat@6 -c wss://media.oneearlybird.ai/rtm/voice
```

## Twilio & Stripe
- Twilio number → Voice webhook (HTTP POST): `https://<vercel-domain>/api/voice/incoming`
  - Returns TwiML `<Connect><Stream url="${MEDIA_WSS_URL}"/>`
  - Next: live call smoke (verify 101 upgrade and audio flow)
- Stripe webhook: `POST /api/webhooks/stripe` (Node + raw body + `constructEvent`)
  - Unsigned → 400; add `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`
  - Stripe CLI test: `stripe listen --forward-to "https://<vercel-domain>/api/stripe/webhook"`

## CI / Notes
- GitHub CI has a root “build” job that may fail when not scoped; media/web deploys are decoupled and healthy.
- Consider scoping CI by path (`apps/web/**`, `apps/api/**`, `apps/media/**`).

## Open Items
- Redis rate-limit smoke: demonstrate 200→429 at `/api/ratelimit-test`.
- Twilio Streams: run live call; measure latency (≤700ms mouth‑to‑ear); maintain PHI‑safe logs.
- Tools/KB stubs: JSON validation; 501/202 responses; wire as needed.
- Keep `/api/status` enriched and version.sha current.
