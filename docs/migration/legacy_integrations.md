# Legacy Integrations (Removed/Replaced)

Status
- Railway: removed in favor of Fly.io for media server hosting.
- Deepgram: removed; ElevenLabs is the current ASR/TTS agent path.

Cleanups Applied
- Deleted `scripts/deploy_media_railway.sh`.
- Updated handoff checklist to reference Fly (`docs/operations/handoff_checklist.md`).
- Retained historical docs under `docs/` for context; marked Railway steps as deprecated.

Action Items
- Ensure `MEDIA_WSS_URL` points to your Fly‑hosted media endpoint, e.g., `wss://media.oneearlybird.ai/rtm/voice`.
- Remove/rename any remaining Railway domains from environment files.

