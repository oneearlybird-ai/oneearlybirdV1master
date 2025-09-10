# Least-Privilege Linking (GitHub + Vercel)

**Purpose:** Enable read-only visibility for CI and smokes without deployment or secret mutation.

## GitHub (fine-grained PAT or App)
- Scopes (read-only):
  - Repository contents: **Read**
  - Metadata: **Read**
  - Actions: **Read**
  - Code scanning alerts: **Read**
- Exclude: push/write/admin scopes.
- Optional: bot account with quarterly rotation.

## Vercel
- Role: **Viewer** (or Developer without deploy/env mutate).
- CLI: `vercel whoami` → `vercel link --project oneearlybird-v1master`
- We do **not** run deploys or `vercel env add/rm` from CI.

## Secrets
- Remain only in Vercel envs. CI uses public URLs only.
- Add a GitHub **Actions Variable** (not secret) named `PREVIEW_URL` to smoke-test latest preview.

## Proof-on-PR (CI)
- Read-only workflow runs header/route smokes:
  - HSTS preload, CSP nonce, PP deny, COOP, COEP, XSS:0, nosniff, no x-powered-by
  - `/api/routes/manifest` = 200, `/api/usage/summary` = 200
  - Stripe webhook unsigned = 400/403
- No deploys. No env writes. Fails fast on regressions.

## Manual responsibilities
- You perform merges/deploys/env edits.
- We (and CI) only **read** and **verify**.

