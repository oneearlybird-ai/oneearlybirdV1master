# Frontend Deploy Log — 2025-10-24

- **Timestamp (UTC)**: 2025-10-24T17:27:20Z
- **Commit**: b4150cb
- **Summary**: Finalized provisioning pending flow, dashboard gating, integrations preview, and one-click call demo adjustments.
- **Verification**:
  - Lint/build locally: ✅ (`npm --prefix apps/web run lint`, `npm --prefix apps/web run build`)
  - Vercel preview URL: Pending (await main push)
  - Signup → Pending → Active flow: Pending (to validate on production once deploy completes)
  - One-click call demo (desktop/iOS): Pending validation post-deploy
  - Dashboard read-only gating while Pending: Pending validation post-deploy

- **Timestamp (UTC)**: 2025-10-24T19:50:17Z
- **Commit**: ae26a5f
- **Summary**: Forced Google OAuth chooser, send all post-auth flows through `/account/pending`, and tightened middleware exclusions to prevent auth loops.
- **Verification**:
  - Lint/build locally: ✅ (`npm --prefix apps/web run lint`, `npm --prefix apps/web run build`)
  - Vercel deployment: Pending (auto after pushing main)
  - Google chooser + redirect to `/account/pending`: Pending (verify in production incognito once deploy is live)
  - Session cookie scope `.oneearlybird.ai`: Pending (check post-deploy)

- **Timestamp (UTC)**: 2025-10-24T21:37:04Z
- **Commit**: 317a61f
- **Summary**: Routed dashboard/auth data through new `/api/dashboard/*` proxies to eliminate `/tenants/profile` and `/usage/summary` 404s; added inline 401 handling.
- **Verification**:
  - Lint/build locally: ✅ (`npm --prefix apps/web run lint`, `npm --prefix apps/web run build`)
  - Vercel deployment: Pending (await production build)
  - Network check: Pending (verify no requests to `/tenants/profile` or `/usage/summary` post-deploy)
  - Dashboard data: Pending (confirm usage/profile widgets hydrate via new API routes)

- **Timestamp (UTC)**: 2025-10-25T00:32:49Z
- **Commit**: 9f96a2f
- **Summary**: Cleared skip-worktree flags so staged auth redirect and API proxy updates ship with main; reran lint/build before production push.
- **Verification**:
  - Lint/build locally: ✅ (`npm --prefix apps/web run lint`, `npm --prefix apps/web run build`)
  - Vercel production URL: https://earlybird-ai.vercel.app (auto deploy from main push at 2025-10-25T00:32Z; monitor for completion)
  - Incognito auth flow `/account/pending` → `/dashboard`: Pending (run once deployment finishes)
  - Network check (only `/api/dashboard/*` + `/api/places/*` calls): Pending (confirm in prod DevTools)

- **Timestamp (UTC)**: 2025-10-25T20:48:10Z
- **Commit**: (pending main push — SSR session redirect + proxy update)
- **Summary**: SSR session loader forwards cookies to `/api/dashboard/profile`, header renders authenticated state on first paint, and Google OAuth done routes redirect server-side without client flashes.
- **Verification**:
  - Lint/build locally: ✅ (`npm run lint`, `npm run build`)
  - `npm run dev`: ❌ (root script fails — `pnpm` rejects `packageManager: "npm@10"`; tracked in `/tmp/fe-dev.log`)
  - `npm --prefix apps/web run dev`: ✅ (`curl -i http://localhost:3000/api/dashboard/profile` → `500 upstream_unconfigured`, expected without local `NEXT_PUBLIC_API_BASE`)
  - Production follow-up: validate incognito OAuth flow hits `/account/create` 302 then `/dashboard`; capture screenshots for `docs/frontend/auth-session-ssr.md`
