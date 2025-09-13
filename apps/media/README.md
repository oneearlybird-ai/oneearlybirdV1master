# Media Orchestrator (WS) — Skeleton

Purpose
- Terminate Twilio Media Streams at `wss://<host>/rtm/voice`.
- Maintain keepalive and basic backpressure; no PHI logs.
- Scaffold hooks to integrate ElevenLabs Realtime Agent (ASR/TTS) later.

Runtime
- Node 18+ (Dockerfile uses Node 20 Alpine)
- WebSocket server via `ws`

Env Vars
- `PORT` (default 8080)
- `WS_PATH` (default `/rtm/voice`)
- `MEDIA_AUTH_TOKEN` (optional): if set, requires header `x-media-auth: <token>` on WS connect
- `ELEVENLABS_API_KEY` (optional): realtime integration key (header `xi-api-key`)
- `ELEVENLABS_AGENT_ID` (optional): reserved for session config
- `ELEVENLABS_WS_URL` (optional): realtime WS URL; connect on Twilio `start`
- `EL_FORWARD_BINARY` (default `false`): when `true`, sends PCM16LE frames to ElevenLabs WS as binary (protocol-dependent; enable only when confirmed)

Local run
```
npm i
PORT=8080 WS_PATH=/rtm/voice npm start
# Health
curl -s http://localhost:8080/ | jq
# WS ping
npx -y wscat@6 -c ws://localhost:8080/rtm/voice
> ping
< pong
```

Twilio Media Streams
- On connect, Twilio sends JSON events:
  - `start` → contains `streamSid`
  - `media` → base64 mulaw frames in `media.payload`
  - `stop`  → stream finished
- Current behavior: counts frames; backpressure drop when `bufferedAmount > 1MB`.
- Transcode path is wired:
  - Decode mu-law (8 kHz) → Int16 PCM
  - Naive upsample to 16 kHz (linear)
  - If `EL_FORWARD_BINARY=true`, send PCM16LE frames to `ELEVENLABS_WS_URL` once connected
  - NOTE: ElevenLabs WS protocol specifics are not assumed; binary forward is guarded by env.

Endpoints
- `GET /` → `{ ok:true, service:'media', wsPath, time }`
- `WS /rtm/voice` → upgrades; responds to text `ping` with `pong`

Security posture
- No PHI in logs (only minimal structured events)
- TLS via platform (Fly); process listens HTTP and upgrades to WS
- Keepalive pings every 15s; policy-close on bad auth when `MEDIA_AUTH_TOKEN` set

Deploy (Fly.io)
```
cd apps/media
fly launch --no-deploy
fly deploy -a earlybird-media --remote-only --auto-confirm
```
Route DNS: `wss://media.oneearlybird.ai/rtm/voice` and set Twilio Streams URL accordingly.
