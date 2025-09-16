# Legacy Integrations (Removed/Replaced)

Status
- Railway: removed in favor of AWS for media server hosting.
- Fly.io: removed in favor of AWS (EC2/ALB) for media server hosting.
- Deepgram: removed; ElevenLabs is the current ASR/TTS agent path.

Cleanups Applied
- Deleted any Fly/Railway deployment scripts and configuration (e.g., fly.toml).
- Updated handoff checklist to reference AWS (`docs/operations/handoff_checklist.md`).
- Retained historical docs under `docs/` for context; marked Fly/Railway steps as deprecated.

Action Items
- Ensure `MEDIA_WSS_URL` points to your AWS-hosted media endpoint, e.g., `wss://media.oneearlybird.ai/rtm/voice` (ALB).
- Remove/rename any remaining Fly/Railway domains from environment files.
