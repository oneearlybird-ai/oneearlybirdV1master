# Media Orchestrator (WS) — Scaffold

Purpose: Terminate Twilio Media Streams at `wss://<host>/rtm/voice` with keepalive + backpressure and no PHI logs.

Local run
- Prereqs: Node 18+, install `ws` in a place Node can resolve (root or app)
- Example:
```
npm i ws
PORT=8080 WS_PATH=/rtm/voice node apps/media/server.ts
```

Endpoints
- `GET /` (health): returns `{ ok:true, service:'media', time:'...' }`
- `WS /rtm/voice`: upgrades to WebSocket. Text `ping` -> `pong`. Backpressure drops when `bufferedAmount > 1MB`.

Security posture
- No PHI in logs (structured logs only)
- TLS terminated at platform (Fly.io/Railway); process runs HTTP and upgrades to WS
- Backpressure safeguards and periodic ping keepalives

Deploy (Fly.io example)
- Create app, set `PORT` and `WS_PATH` env as needed
- Route DNS: `wss://media.oneearlybird.ai/rtm/voice`
- Point Twilio Media Streams WebSocket URL to the above

