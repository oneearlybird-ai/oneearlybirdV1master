# Auth Flow Result

## Apex (Desktop)
- Launch the marketing home (`http://127.0.0.1:3000/`) and trigger **Start free** → shared `AuthModal` opens; fallback link remains `/login?tab=signup`.
- `/login` renders without console errors (Lighthouse `errors-in-console` audit passed).
- After authentication the success redirect still lands on `/dashboard` (guard defined in `app/dashboard/layout.ts`).

## Mobile (`/m`)
- Bottom nav `Sign in` button invokes the same modal; CTA copy updated, wiring unchanged.
- Fallback flows lead to `/login` which, post-auth, redirects to `/m/dashboard` for mobile layout.
- Lighthouse mobile audit reported no console or hydration issues.

## Notes
- No new auth logic added; all CTAs use `AuthModalTriggerButton` or `/login`.
- Session cookies shared across apex + `/m` origins; header state verified during local run.
- `next start` logs remained clean (no warnings) while exercising the modal.
