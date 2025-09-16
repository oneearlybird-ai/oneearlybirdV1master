# Media Streams (Twilio) — Handshake Notes & Next Steps

Status:
- Webhook: /api/voice/incoming returns TwiML <Connect><Stream url="wss://media.oneearlybird.ai/rtm/voice"/>.
- Twilio attempts WebSocket to MEDIA_WSS_URL and logs Error 31920 (handshake): server did not return HTTP 101.

What 31920 means (Twilio):
- “Server returned an HTTP code different from 101 to the connection request.” Causes: server not speaking WS; path not WS-enabled. (Twilio docs)

Acceptance for media.oneearlybird.ai:
- Public TLS (wss://) with valid cert; port 443.
- Path “/rtm/voice” performs WebSocket upgrade (HTTP 101) and keeps connection open.
- Supports Twilio Media Streams framing; responds to ping/pong; safe closure.
- No PHI logs; redact tokens; follow HIPAA Protected Zone rules.

Operational plan:
1) Host: AWS EC2 (not Vercel; long-lived sockets).
2) Minimal WS service: accept connection, log call SID metadata only, reply to ping/pong, then close on test.
3) Configure DNS: CNAME media.oneearlybird.ai -> provider; TLS cert issued.
4) Once online, set MEDIA_WSS_URL to the deployed WSS endpoint and re-test a live call.
