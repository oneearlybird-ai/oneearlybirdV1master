# Smoke Tests

Headers (Vercel)
- Check CSP/HSTS/COOP/COEP/PP: `curl -I https://oneearlybird.ai/`

Webhooks
- Twilio (unsigned): `curl -i -X POST https://<vercel>/api/voice/incoming` → 403
- Stripe (unsigned): `curl -i -X POST https://<vercel>/api/webhooks/stripe` → 400/403
- ElevenLabs (unsigned): `curl -i -X POST https://<vercel>/api/elevenlabs/personalization` → 403

Rate Limit
- `curl -s https://<vercel>/api/ratelimit-test` twice → expect 200 then 429

Storage Presign
- `curl -i -X POST https://<vercel>/api/storage/presign -H 'x-smoke-key: $SMOKE_KEY' -d '{"op":"upload","key":"preview/tenants/demo/audio/2025/09/13/id.wav"}'` → 200 URL

Media WS
- `scripts/smokes/media_ws_ping.sh` → `ping` / `pong`

