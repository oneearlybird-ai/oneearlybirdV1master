# Vercel Quick Deploy

This package includes a root `vercel.json` so Vercel always uses `apps/web` as the project root.

**Steps**
1. Push to GitHub.
2. Import into Vercel — no additional config needed.
3. (Optional) Set `NEXT_PUBLIC_API_URL` in Vercel if you have a live API, or leave default.
4. Visit your site with `?demo=1` to see the DEMO badge.

**Reminder**: Run `pnpm i` locally and commit the generated real `pnpm-lock.yaml` when convenient.
