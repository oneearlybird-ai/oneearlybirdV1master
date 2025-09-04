# Fix: Vercel Config (remove rootDirectory)

Your previous `vercel.json` used `rootDirectory`, which Vercel rejects.
This patch:
- Replaces the **root** `vercel.json` with a minimal, valid one (no `rootDirectory`).
- Adds **apps/web/vercel.json** for Next.js build settings (only used if project root is `apps/web`).

## What to do

**Option A — Dashboard (recommended)**
1. In Vercel → Project → Settings → General → *Root Directory* = `apps/web`
2. Build & Development → Node.js = 20.x
3. Environment Variables → set `NEXT_PUBLIC_API_URL` (e.g., `https://example.invalid` for now)
4. Redeploy

**Option B — CLI deploy**
```bash
npm i -g vercel
vercel --cwd apps/web --prod
```

## Files changed by this patch
- `vercel.json` (root) — minimal (no rootDirectory)
- `apps/web/vercel.json` — Next.js-specific settings
