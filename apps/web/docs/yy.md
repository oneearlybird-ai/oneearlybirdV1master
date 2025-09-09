# EarlyBird — Snapshot (yy)
_Last update: UTC_

## Deployment
- DEPLOY_URL: (see latest Vercel prod URL used in smokes)

## State
- Headers: PASS (CSP nonce; HSTS; Permissions-Policy deny; COOP same-origin; COEP require-corp; X-XSS-Protection: 0; X-Content-Type-Options: nosniff; no x-powered-by)
- Status: PASS — `/api/status` 200 with { up, ts (ISO), health.{db|cache|storage}, version.sha }
- Limiter: PASS — rl1=200 → rl2=429 (when configured)
- Manifest: PASS — `/api/routes/manifest` lists all canonical routes

## Changes in this cut
- Added `apps/web/docs/mm.md` (master checklist) and `apps/web/docs/yy.md` (snapshot).

## Security deltas
- None (docs-only).

## Next steps
- Implement remaining planned endpoints (see mm.md), each as SVP with gates + smokes. Update `mm.md` on each PASS.
