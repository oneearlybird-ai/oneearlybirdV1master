# Next.js Lint Follow-ups

ESLint (Next.js plugin) currently has the `@next/next/no-html-link-for-pages`
and `@next/next/no-img-element` rules disabled because of legacy usage of `<a>`
and `<img>` within marketing and dashboard components. Before GA:

- Replace `<a>` navigation with `<Link>` from `next/link` (preserve styling).
- Replace `<img>` with `<Image>` or an approved loader for optimized assets.
- Re-run `npm --prefix apps/web run lint` and update this doc once resolved.

Tracked components:
- `apps/web/app/dashboard/page.tsx`
- `apps/web/app/dashboard-preview/page.tsx`
- `apps/web/components/ui/footer.tsx`
- Marketing content (`customers/single-post`, features sections, Plasmic registry).

After remediation, re-enable the rules in `eslint.config.mjs` and
record the lint run evidence in `docs/frontend/deploy-log-2025-10-24.md`.
