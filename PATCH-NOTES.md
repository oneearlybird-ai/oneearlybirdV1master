# Patch Notes (Vercel 404 Fix)

- Added `apps/web/pages/index.tsx` so the root `/` resolves even if App Router isn't detected.
- Updated `apps/web/next.config.js` with `experimental.appDir=true` and `output: 'standalone'`.
- Added `engines.node>=20.x` to `apps/web/package.json`.
- Keep `vercel.json` at repo root to force Root Directory = `apps/web`.
