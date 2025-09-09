# Media Orchestrator — Twilio Media Streams Handoff (Protected Zone)

## Purpose
How web (Next.js on Vercel) hands off live call audio to an external Media WebSocket server with strict security/latency.

## Flow
- Twilio → POST /api/voice/incoming (runtime='nodejs', dynamic='force-dynamic').
- Validate X-Twilio-Signature (official SDK) against full URL; invalid/unsigned ⇒ 403.
- On success, return TwiML:

  ```xml
  <Response><Connect><Stream url="${MEDIA_WSS_URL}/rtm/voice"/></Connect></Response>
  ```

- Twilio connects directly to the media server at `wss://<media-host>/rtm/voice`.
- No long‑lived WebSocket media on Vercel; web only issues TwiML.

## External Media WS (must be separate host)
- Deploy on Fly.io/Railway/AWS/GCP/etc. (not Vercel).
- TLS: WSS over TLS 1.2+ with public CA cert.
- Path: `/rtm/voice` (configurable server-side; TwiML points here).
- Protocol: Implement Twilio Media Streams JSON envelope + base64 PCM frames.
- Control: handle `start`/`media`/`mark`/`stop`, respond to ping/pong, close cleanly.
- Latency: target ≤ 500–700 ms mouth‑to‑ear (Twilio <200 ms; ASR <150 ms; policy/LLM <150 ms; TTS <150 ms).
- Security: No PHI to non‑BAA vendors; Protected Zone; redact logs; short‑TTL creds.

## Configuration
- Env vars:
  - `MEDIA_WSS_URL` (e.g., `wss://media.example.com`).
  - `NEXT_PUBLIC_SITE_URL` (canonical origin for Twilio signature validation).
  - Twilio: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, optional `TWILIO_TWIML_APP_SID`.
- Networking:
  - Open TCP 443 on media host; allow Twilio egress IPs if firewalled.
  - Prefer HTTP/1.1 WS upgrades; do not rely on H2 websockets.
- Observability:
  - Minimal metrics; redact tokens/call SIDs; never log PHI.

## Acceptance Criteria
- POST /api/voice/incoming unsigned ⇒ 403; signed path ready when `TWILIO_AUTH_TOKEN` present.
- TwiML returns `<Connect><Stream url="${MEDIA_WSS_URL}/rtm/voice"/>`.
- No long‑lived media WS on Vercel; media WS runs only on external host.
- Site headers baseline: CSP with per‑request nonce; HSTS preload; Permissions‑Policy deny list; COOP same‑origin; COEP require‑corp; `X‑XSS‑Protection: 0`; no `x-powered-by`.
- This README is present at `apps/web/docs/media/README.md`.

## Notes
- If `TWILIO_AUTH_TOKEN` is not set, skip live-signature tests; the code path remains ready.
- Keep TwiML minimal; orchestration logic (ASR→policy→LLM→TTS) lives on the media host.
