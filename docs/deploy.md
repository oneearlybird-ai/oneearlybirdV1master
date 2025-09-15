Note: Previous deployments used Railway and Fly.io for the media service. This has been replaced with AWS (EC2 behind ALB/ACM).

Media (AWS) quick start
```
# Build container and run under systemd on EC2; place behind an internal ALB with ACM TLS.
# See docs/operations/handoff_checklist.md for environment variables and smokes.
```

Trigger: automated commit to initiate deploys via your chosen CI/CD.

## 2025-09-15 — Web preview deploy + route dedupe
- Removed duplicate `/api/usage/summary` route files outside `apps/web` to keep a single canonical handler.
- Built `apps/web` locally; types OK. Next build succeeded; header posture intact.
- Preview deployed via Vercel. Verify:
  - GET `/api/usage/summary` → 200 with `version` = short SHA.
  - GET `/api/routes/manifest` includes `/api/usage/summary` with status `stable`.
  - GET `/api/ratelimit-test` twice (fresh UA) → 200 then 429.

Promote to production when ready:
```
vercel --prod
```
