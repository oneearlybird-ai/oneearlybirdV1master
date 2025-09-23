Title: Twilio Auth Token Rotation (Production)

Date: 2025-09-22

Summary
- Rotated the Twilio Auth Token used by the Voice webhook signature validator.
- New token is stored in AWS SSM for ops reference; Vercel Production env must be updated to take effect.

Details
- SSM: /oneearlybird/twilio/AUTH_TOKEN (SecureString)
  - length: 32
  - sha256: 1039bc0d1198e298f1eb9ad0c92985271a4b05d348bb26deed32629618951d84
- Web route(s) reading the token:
  - apps/web/app/api/voice/incoming/route.ts (validator)
  - apps/web/app/api/voice/status/route.ts

Required Action (Vercel Production)
- Vercel Project (apps/web): Settings → Environment Variables → set TWILIO_AUTH_TOKEN = <new token> (Production) and redeploy.

Verification
1) Signed probe with new token → 200 OK (or if signature optional is disabled, strict 200)
2) TwiML returns <Stream track="inbound_track" url="wss://media.oneearlybird.ai/rtm/voice?token=…"/>
3) Gateway WS accepts token (no 1008 jwt_invalid)

Notes
- Do not commit plaintext tokens to the repo. The value is only in Vercel env and SSM.
- Nodes do not use TWILIO_AUTH_TOKEN.
