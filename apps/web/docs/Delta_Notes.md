# Delta Notes

## CTA Link Audit
- Hero primary CTA (`Start free` / `Start free trial`) → modal signup flow (EarlyBird auth controls).
- Secondary CTA (`Book a live demo`) → `/signup` as before.
- Pricing support CTAs remain `/support` + `mailto:support@earlybird.ai`.
- Mobile bottom nav (logged out) → Home, How it works hash, `/m/pricing`, modal `Sign in`; logged-in tabs → `/m/dashboard` routes.

## Build / Config
- Existing `next.config.mjs` `outputFileTracingRoot` continues to resolve workspace-root warning (no new changes).
- Production build + `next start` run locally with updated copy (no errors in logs).

## Dependencies / Shims
- No new dependencies or shims added; copy-only changes across TSX files.
- Image/SVG shim files untouched.

## Proof Artifacts
- Lighthouse JSON exports for `/` and `/pricing` (desktop + mobile) stored here; CLS < 0.01 on all runs.
- `Headers_Proofs.txt` captures curl header checks for apex + `/m`, plus upstream proxy behavior (401 expected in prod when bearer token missing).
