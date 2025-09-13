# Media Server — Fly.io Deploy

Goal: low-latency WS for Twilio Media Streams.

Prereqs
- Fly CLI installed and logged in
- App name: `earlybird-media` (adjust in `apps/media/fly.toml` if needed)

Deploy
```
cd apps/media
fly launch --no-deploy
fly deploy -a earlybird-media --remote-only --auto-confirm
```

Env Vars (Fly)
- `PORT=8080` (from fly.toml)
- `WS_PATH=/rtm/voice`
- `MEDIA_AUTH_TOKEN=<optional>`
- `ELEVENLABS_API_KEY=<optional>`
- `ELEVENLABS_AGENT_ID=<optional>`
- `ELEVENLABS_WS_URL=<optional>`
- `EL_FORWARD_BINARY=false` (set true only after confirming EL WS protocol)

DNS & Twilio
- Point DNS: `wss://media.oneearlybird.ai/rtm/voice` to Fly app
- In Vercel env: `MEDIA_WSS_URL = wss://media.oneearlybird.ai/rtm/voice`
- Twilio webhook (Vercel): `/api/voice/incoming` returns TwiML `<Connect><Stream url="${MEDIA_WSS_URL}"/>`

Latency Tuning
- Region near callers & ElevenLabs PoP
- `min_machines_running=1`; consider dedicated CPU for predictable p95

Smokes
- Health: `curl -s https://media.oneearlybird.ai/ | jq`
- WS ping: `npx -y wscat@6 -c wss://media.oneearlybird.ai/rtm/voice` → `ping` → expect `pong`

