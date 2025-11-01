# /api/upstream Shim Retirement Checklist

Keep the Next.js `/api/upstream` proxy only as a fallback while the API custom
domain settles. Remove it once the following checks are green:

## 1. Environment parity
- Vercel Production **and** Preview expose `NEXT_PUBLIC_API_BASE=https://api.oneearlybird.ai`.
- No `API_UPSTREAM` variables remain in Vercel (UI/CLI secrets).
- Preview deploy renders signup/signin flows without depending on the rewrite.

## 2. Validation runs
- Deploy preview → production after confirming the envs above.
- Run `npm run test:smoke` against prod **and** preview; both must pass.
- Run `npm run test:platinum` against prod; capture artifact links in
  `docs/automation-roadmap.md`.

## 3. Observability
- CloudWatch/Datadog shows synthetic/browser traffic landing directly on
  `https://api.oneearlybird.ai`.
- No spikes in 404/429/5xx after the rewrite is disabled.

### Removal Steps
1. Delete `apps/web/app/api/upstream/[...path]/route.ts` and any references.
2. Redeploy Preview → Production (confirm env parity post-deploy).
3. Update runbooks with the deploy + synthetic evidence.

> If an issue appears, restore the route file from git history and redeploy,
> then revisit this checklist.
