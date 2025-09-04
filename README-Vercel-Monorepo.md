# Vercel Monorepo Setup (Fix for Next.js detection)

If your Vercel build logs say "No Next.js version detected", Vercel is building the **repo root** instead of `apps/web`.

## Steps (Dashboard)
1. In Vercel → *New Project* → select this GitHub repo.
2. Click **"Edit"** and set:
   - **Root Directory**: `apps/web`
   - **Framework Preset**: Next.js
   - **Node.js Version**: 20.x
   - **Install Command**: `pnpm i`
   - **Build Command**: `pnpm build`
   - **Output Directory**: `.next`
3. Add env var (optional for demo): `NEXT_PUBLIC_API_URL=https://example.invalid`
4. Deploy. Visit `/` (append `?demo=1` to see demo badge, if implemented).

## CLI (bypass dashboard settings)
```bash
npm i -g vercel
vercel --cwd apps/web --prod
```

This creates a Vercel project pinned to `apps/web` so Next.js is detected properly.
