# EarlyBird — Handoff Checklist (Team 5)

Date: 2025-09-11

## Domains
- Web (Vercel, prod): `https://oneearlybird-v1master.vercel.app`
- API (Fly): `https://earlybird-api.fly.dev`
- Media (Railway): `https://earlybird-media-production.up.railway.app`
  - WS: `wss://earlybird-media-production.up.railway.app/rtm/voice`

## Health Endpoints
- Web: `GET /api/usage/summary` and `GET /api/status`
- API: `GET /health` → 200 JSON
- Media: `GET /` → 200 JSON; `WS /rtm/voice` ping→pong

## Environment Variables

### Vercel (Production)
- `NEXT_PUBLIC_API_BASE = https://earlybird-api.fly.dev`
- `API_UPSTREAM = https://earlybird-api.fly.dev`
- `MEDIA_WSS_URL = wss://earlybird-media-production.up.railway.app/rtm/voice`
- `NEXT_PUBLIC_SITE_URL = https://oneearlybird-v1master.vercel.app`
- `NEXT_PUBLIC_BASE_URL = https://oneearlybird-v1master.vercel.app`
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

### Railway — Media Service (earlybird-media)
- `WS_PATH = /rtm/voice`
- `NODE_ENV = production`
- `(optional) PORT = 8080` (platform also provides `$PORT`)
- Health check path: `/` (timeout 5s; bump to 10–15s if cold starts)
- Build method: Dockerfile (apps/media) — Start command blank (CMD in Dockerfile)

### Fly — API (earlybird-api)
- Configure `fly.toml` as needed; consider:
  - `[http_service]` → `min_machines_running = 1` to avoid cold starts

## Deploy Commands

### Web (Vercel)
```
cd apps/web
vercel link --yes
vercel env add NEXT_PUBLIC_API_BASE production <<< "https://earlybird-api.fly.dev"
vercel env add API_UPSTREAM production       <<< "https://earlybird-api.fly.dev"
vercel env add MEDIA_WSS_URL production      <<< "wss://earlybird-media-production.up.railway.app/rtm/voice"
vercel env add NEXT_PUBLIC_SITE_URL production <<< "https://oneearlybird-v1master.vercel.app"
vercel env add NEXT_PUBLIC_BASE_URL production <<< "https://oneearlybird-v1master.vercel.app"
vercel deploy --prod --confirm
```

### API (Fly)
```
cd apps/api
fly deploy -a earlybird-api --remote-only --auto-confirm
curl -i https://earlybird-api.fly.dev/health
```

### Media (Railway)
```
cd apps/media
railway link -p shimmering-light -s earlybird-media
railway up
curl -i https://earlybird-media-production.up.railway.app/
npx -y wscat@6 -c wss://earlybird-media-production.up.railway.app/rtm/voice
```

## Twilio & Stripe
- Twilio number → Voice webhook (HTTP POST): `https://<vercel-domain>/api/voice/incoming`
  - Returns TwiML `<Connect><Stream url="${MEDIA_WSS_URL}"/>`
  - Next: live call smoke (verify 101 upgrade and audio flow)
- Stripe webhook: `POST /api/stripe/webhook` (Node + raw body + `constructEvent`)
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

