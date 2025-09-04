# EarlyBird — PolyAI-style AI Voice Receptionist (Demo Starter)

This is a **drop-in demo starter** you can push to GitHub tonight and deploy:
- `apps/web` — Next.js (Vercel).
- `apps/api` — Express API (Fly/Render/any Node host).
- **Demo endpoints** return mock analytics, transcripts, and invoice PDFs so it runs with **no keys**.

## Quick Start (Local Demo)

```bash
# from repo root
pnpm i

# run API
pnpm -C apps/api dev

# run Web (new terminal)
pnpm -C apps/web dev

# browse
http://localhost:3000/?demo=1
# API health
curl http://localhost:4000/demo
```

## Deploy Tonight

**Vercel (web)**: Import repo → Root Directory = `apps/web` → set env `NEXT_PUBLIC_API_URL=https://your-api-url` → Deploy.

**Fly.io (api)**:
```bash
flyctl launch --config infra/fly.toml --copy-config --now
flyctl secrets set DEMO_MODE=true WEB_URL=https://<vercel-domain> PUBLIC_API_URL=https://<api-domain> REALTIME_WS_PUBLIC=wss://<api-domain>
```

> When ready for production, replace the simple Express API with the full NestJS stack from the main build, or extend this API to call your real providers.

---

## Scripts

- `pnpm -C apps/api dev` — start API on :4000
- `pnpm -C apps/web dev` — start Web on :3000

## Environment

See `.env.example`. For demo, you can leave most values empty.
