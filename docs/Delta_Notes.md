# Delta Notes

## Dependencies
- Added `@tailwindcss/postcss` (required for Tailwind CSS v4 PostCSS integration).
- Upgraded Next/React/Tailwind earlier in sprint; no additional runtime deps introduced in this slice.

## Ignored Paths
- Added `lambda_src/`, `repo_eb_frontend/`, and `lambda_csp_collector.py` to `.gitignore` to keep backend artifacts out of the frontend repo.

## CTA Audit
- All landing/preview CTA buttons use `AuthModalTriggerButton` (signup) or link to `/pricing`/`/support`.
- Pricing grid continues to use `PlanCheckoutButtons` with existing checkout endpoints.

## Other Notes
- `/support/porting` remains a marketing surface; form actions generate a mailto or clipboard copy only (no new API routes).
- `/roi` now redirects to `/how-it-works`; `/signup` redirects to `/login?tab=signup`.
