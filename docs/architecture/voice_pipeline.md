# Voice Pipeline (Twilio → ElevenLabs → Media → App)

Overview
- Inbound PSTN call hits Twilio; Twilio invokes our webhook `POST /api/voice/incoming` on Vercel.
- We validate `X-Twilio-Signature` against the full external URL and respond with TwiML `<Connect><Stream url="${MEDIA_WSS_URL}"/>`.
- Twilio Media Streams connects to our media server over WSS at `MEDIA_WSS_URL` (hosted off Vercel on AWS EC2 behind an ALB).
- Media server orchestrates real‑time ASR/TTS with ElevenLabs, and relays audio back to Twilio.
- App services persist minimal metadata and enforce rate limits via Upstash Redis.

Key Endpoints
- Web (Vercel):
  - `POST /api/voice/incoming` — Signed Twilio ingress, returns TwiML Stream
  - `POST /api/voice/status` — Signed Twilio status callback (URL‑encoded)
  - `POST /api/elevenlabs/personalization` — HMAC verified webhook
  - `POST /api/elevenlabs/post-call` — HMAC verified webhook
  - `POST /api/storage/presign` — Presigned S3/Rumble URLs (auth: `x-smoke-key`)
- Media (AWS):
  - `GET /` — Health
  - `WS /rtm/voice` — Twilio Media Streams handshake and bi‑directional audio

Integrations
- Twilio: Webhook signature validation; Media Streams WS upgrade (101)
- ElevenLabs: HMAC via `ElevenLabs-Signature` (t + v0)
- Upstash Redis: Rate limiting and lightweight state
- Rumble Cloud/S3: Object storage via presigned URLs
- Stripe: Billing and webhooks

Security
- Central headers via Edge middleware (CSP nonce, HSTS, COOP/COEP, Permissions‑Policy deny, nosniff)
- Sensitive routes force Node runtime + dynamic (no caching)
- Minimal logs; no PHI

Configuration
- `MEDIA_WSS_URL` — e.g., `wss://media.oneearlybird.ai/rtm/voice`
- `NEXT_PUBLIC_SITE_URL` — external origin used in Twilio validation
- See `docs/security/headers.md` for header policy
