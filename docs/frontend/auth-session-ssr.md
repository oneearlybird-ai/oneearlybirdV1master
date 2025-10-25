# Frontend Auth Session SSR Notes — 2025-10-25

## Summary
- Added `apps/web/lib/server/loadSession.ts` to pull `/api/dashboard/profile` via SSR with forwarded cookies and `no-store` caching.
- Updated Next API proxy `apps/web/app/api/dashboard/profile/route.ts` to send the inbound `Cookie` header to `process.env.API_UPSTREAM`.
- Converted Google OAuth "done" pages (desktop + mobile) to server components that redirect to `/account/create` or `/dashboard` with no client-side flicker.
- `apps/web/app/layout.tsx` now loads the session during SSR and hydrates `AuthSessionProvider` with `initialStatus`/`initialProfile`.
- `AuthSessionProvider` accepts the SSR payload without forcing an immediate refetch while still allowing refresh hooks/events.

## CSP
- Current policy remains report-only for enforcement, but no new inline scripts/styles were introduced.
- Local `npm run lint` and `npm run build` succeed under the report-only CSP check script (`scripts/ci/verify-csp.js`).
- Follow-up: enforce CSP once prod verifies the SSR path (no inline requirements observed).

## Verification
- `npm run lint` ✅
- `npm run build` ✅
- `npm run dev` (root) ❌ — fails because the script shells out to `pnpm`, which rejects the `packageManager: "npm@10"` metadata. Tracked via `/tmp/fe-dev.log`.
- `npm --prefix apps/web run dev` ✅ — `curl -i http://localhost:3000/api/dashboard/profile` returns `500 upstream_unconfigured` locally (expected without `API_UPSTREAM`).
- Pending after deploy: capture screenshot of OAuth success arriving at `/account/create` (desktop + mobile) and attach to this doc.

## Environment
- Ensure Vercel production env includes:
  - `API_UPSTREAM=https://api.oneearlybird.ai`
  - `NEXT_PUBLIC_API_BASE=https://api.oneearlybird.ai`
- No backend changes performed in this run.
