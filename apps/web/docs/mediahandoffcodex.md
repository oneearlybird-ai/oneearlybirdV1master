# MEDIA VOICE PIPELINE — ENGINEERING HANDOFF (CURRENT STATE)

## Scope
- Two-way PSTN calls using Twilio Media Streams, ElevenLabs ConvAI (ASR/TTS), and our Media Gateway (AWS EC2 behind ALB). This handoff captures exactly what has been implemented, what is deployed, how to verify, and the next steps to finish resolving the “silent outbound audio” issue without re-doing work already done.

## High-Level Architecture
- Twilio Programmable Voice
  - Number webhook → Vercel (apps/web) returns TwiML `<Connect><Stream url="wss://media.oneearlybird.ai/rtm/voice/jwt/<token>"/>` (bidirectional). No `<Start>` is used.
  - Twilio Media Streams WebSocket to our media gateway. `start` message contains `streamSid`; we must reply with outbound media frames JSON using the same `streamSid`.
- Web (Vercel / Next.js, apps/web)
  - `apps/web/app/api/voice/incoming/route.ts` returns `<Connect><Stream>` with path-style JWT token.
  - `apps/web/app/api/voice/logs/ingest/route.ts` accepts Twilio Event Streams posts (and can verify signing if a secret is set), returning `200` for accepted posts.
- Media Gateway (AWS EC2 behind ALB)
  - ALB: HTTPS 443 → target group → EC2 instances (Node 20) with systemd service `media-ws`.
  - Instances fetch `/opt/media-ws/server.mjs` artifact from S3 on boot; IAM policy now allows both `s3:GetObject` and `s3:HeadObject` for `media/server-*.mjs` under bucket `oneearlybird-media-artifacts-102732512054-us-east-1`.
- ElevenLabs ConvAI
  - Realtime WebSocket connects on Twilio `start`; we explicitly request conversation client events so agent audio is streamed back.

## What We Changed (and Why)
- Bidirectional stream (TwiML): Using `<Connect><Stream>` (not `<Start>`) so Twilio will play outbound audio.
- Outbound frames include `track:"outbound"`: Twilio requires this field on media JSON for playback to the caller.
- Strict Twilio media JSON:
  - `{ "event":"media", "streamSid":"<from Twilio start>", "media": { "track":"outbound", "payload":"<base64 μ-law 160B>" } }`
- Pacing outbound audio:
  - Send exactly one 160-byte μ-law frame every ~25 ms (slightly slower than 20 ms) to avoid bursts that Twilio drops. No multi-frame bursts; queue/tick architecture.
- Strict 160-byte frames:
  - If computed frame < 160 → pad with `0xFF` (μ-law silence). If > 160 → split into 160B slices. Always emit 160B.
- ElevenLabs ingestion:
  - After `el:open`, send `conversation_initiation_client_data` to request `client_events` `["audio","user_transcript","agent_response"]`.
  - Accept both JSON (`type:"audio"` with `audio_event.audio_base_64`) and binary frames. `EL_ACCEPT_BINARY=true`.
  - Metadata latch (sr + format) and robust fallback:
    - `agentOutFmt=ulaw_8000` → `mode=pass`; `agentOutFmt=pcm_16000/pcm_8000` → `mode=encode`.
    - If metadata late: infer from container/raw (WAV μ-law@8k → pass; PCM16/F32 → encode; else default `encode`) and proceed.
  - Window 20ms by `streamSr`; resample as needed; μ-law encode → 160B.
- Observability (Event Streams):
  - `/api/voice/logs/ingest` now accepts Twilio Event Streams posts and supports HMAC-SHA256 verification if `TWILIO_EVENT_STREAMS_SECRET` is set and sink signing is enabled.
  - Twilio CLI sink test was submitted for the sink (see Sink SID below).
- IAM S3 permission fixed:
  - Added `s3:HeadObject` (and `s3:GetObject`) for `media/server-*.mjs` so instances can fetch the artifact without 403 errors.
- Launch Template updated as artifacts changed; ASG instance refresh used with `MinHealthy=100`.

## Current Behavior in Logs (as of last run)
- Twilio leg: `upgrade` → `auth:allow` → `media:start` (sid present) → `twilio:tracks inbound`.
- ElevenLabs leg: `el:open` arrives. We should see `el:msg type=conversation_initiation_metadata` and/or `el:bin n=<bytes>`. In recent logs we still saw `mode=unsupported vendor_fmt=` (repeating) which indicates metadata didn’t latch and no usable audio chunks were processed. This is the last mile to fix (ensure EL actually streams audio frames to our client WS during the call).

## Exactly What’s Deployed (Paths, Keys, Env)
- Web TwiML endpoint: `apps/web/app/api/voice/incoming/route.ts` → `<Connect><Stream url="${MEDIA_WSS_URL}/jwt/<token>"/>`
  - JWT signed with `MEDIA_SHARED_SECRET` when present (short TTL ~120s)
- Event Streams ingest (verifies Event Streams signature if secret provided):
  - `apps/web/app/api/voice/logs/ingest/route.ts`
  - Env for signing (optional, recommended): `TWILIO_EVENT_STREAMS_SECRET` (Vercel Production)
- Media Gateway server: `infra/terraform/media-gateway/templates/server.mjs`
  - Pacing: 25 ms tick; single 160B frame per tick; marks sent.
  - Outbound JSON includes `track:"outbound"`.
  - EL handshake sending `conversation_initiation_client_data` on open; accept JSON + binary.
  - sr latch + robust fallback; strict 160B; padding/truncation.
- S3 artifact bucket: `oneearlybird-media-artifacts-102732512054-us-east-1`
  - Artifact key format: `media/server-<sha256>.mjs`
- IAM policy (instances): allows `s3:GetObject` + `s3:HeadObject` for `media/server-*.mjs` keys.
- ASG: `media-ws-asg`; Launch Template updated to latest artifact and env; instance refresh used to roll out changes.

## Twilio Sink (Event Streams)
- Sink SID: `DGd22aaa6f1337509195803b6392e4b417` (destination: `https://oneearlybird.ai/api/voice/logs/ingest`)
- Status: active; tested with Twilio CLI (test submitted).
- Signing: webhook sink config does not expose signing in `sink_configuration`. Our ingest route accepts posts and can verify signatures if the account/feature supports signing; otherwise it returns `200` by body shape.

## Verification Checklist (Next Call)
- Expect logs (PHI-safe):
  - `el:msg type=conversation_initiation_metadata` and/or `el:bin n=<bytes>`
  - `vmeta:sr=<...>`
  - `mode=pass vendor_fmt=ulaw_8000` OR `mode=encode vendor_fmt=pcm_16000/pcm_8000` (or fallback logs)
  - `sendBytes:160` (every tick) and `twilio:mark eb:<n>`
- If `el:msg`/`el:bin` never appear, ElevenLabs is not streaming audio back to our socket yet. We sent client_data; if needed, add their minimal post-open message (session/update / response/create) per their WS contract.

## One Guaranteed Proof Call
- Temporarily set the EL agent’s `agent_output_audio_format = ulaw_8000` for one call. Expect `mode=pass`; should be crystal clear pass-through (no encoder involved). Then switch back to `pcm_16000` if desired.

## Known-Audio Isolation Test (Optional)
- For strict Twilio-path validation, stream a known 8k μ-law clip (160B frames) at 25 ms from the media gateway with the vendor path temporarily bypassed. If this plays, Twilio path is confirmed; then focus on EL return audio streaming.

## Open Items (Prioritized)
- P0: Ensure ElevenLabs actually streams agent audio to our WS:
  - We already send `conversation_initiation_client_data`; if still silent, add the minimal EL post-open message (e.g., session/update or response/create) documented for your agent to start streaming audio out.
- P1: Observability finalization:
  - If account supports Event Streams request signing, enable it and set `TWILIO_EVENT_STREAMS_SECRET` in Vercel to stop 93101 and get reliable Twilio marks.
- P1: Confirm `streamSid`/`track` correctness in outbound frames (we already send `track:"outbound"` and current Twilio `streamSid`; look for Twilio “mark” ACKs).

## Operational Notes
- Twilio CLI profile present on host (`~/.twilio-cli`). Active profile: `earlybird` (Account SID present). Used to list sink and submit sink test.
- IAM change applied; if any instance shows S3 403 on HeadObject during artifact fetch, ensure instance has refreshed IAM and re-fetchs artifact; instance refresh resolves this.

## Commands (Reference)
- Tail key logs on instances (via SSM): look for `el:open`, `el:msg`, `el:bin`, `vmeta:sr`, `mode=...`, `sendBytes:160`, `twilio:mark`.
- Twilio sink list: `twilio api:events:v1:sinks:list -o json`
- Twilio sink test: `twilio api:events:v1:sinks:test:create --sid DGd22aaa6f1337509195803b6392e4b417`

## Contact / Ownership
- Code: media server at `infra/terraform/media-gateway/templates/server.mjs`; TwiML and ingest at `apps/web/app/api/voice/...`.
- Deploy: artifact → S3; Terraform LT + IAM; ASG instance refresh; service is `media-ws`.
- Twilio: use `<Connect><Stream>` only; outbound JSON must include `track:"outbound"` with correct `streamSid`.

END — Next codex: do not re-implement the above. Focus on (1) ensuring EL WS actually streams to our client (add required post-open message if needed), and (2) confirming Twilio “mark” ACKs once Event Streams sink auth is aligned.

