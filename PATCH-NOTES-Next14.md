# Patch: Next.js 14 App Router Conflict Fix

- Removed `apps/web/pages/index.tsx` to avoid conflict with `app/page.tsx`.
- Cleaned `apps/web/next.config.js` (removed invalid `experimental.appDir`).
- This allows Next.js 14 to build using the **App Router** only.

After applying:
```bash
git add .
git commit -m "fix: remove pages/index and clean next.config for Next14 app router"
git push
```
Then redeploy in Vercel.
