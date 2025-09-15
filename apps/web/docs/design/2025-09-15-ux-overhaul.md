# EarlyBird AI — UX/UI Overhaul (Preview Plan)

Date: 2025-09-15
Owner: Design/UX
Scope: Landing page (below hero) and logged-in Dashboard. Header, footer, and hero wording remain unchanged. This document guides implementation of the high-polish redesign, referencing security posture from `security_features_expectations.txt`.

## Objectives
- Apple‑level clarity and finish; bold, trustworthy visual tone.
- Communicate value in seconds with visual sections and micro‑interactions.
- Ship a safe preview in a feature branch without risking production.

## Preview URLs (local)
- Landing preview: `/preview`
- Dashboard preview: `/dashboard-preview`

## Brand & Visual System
- Typography: Inter (UI), bold headings; 16px base, 1.6 lh.
- Color: Keep EarlyBird gold; use neutral ink (#0E1116) on light, white on dark.
- Components: Cards with soft borders, 10px radius, subtle elevation.
- Motion: Fade/slide on scroll (200–350ms), marquee manual scroll (CSP‑safe), tasteful hover lifts.

## Landing Page — Section Breakdown
1) What EarlyBird AI Does (4 cards)
   - 24/7 Answering — “Never miss a call…”.
   - Appointment Booking — “Seamlessly schedule…”.
   - CRM Integration — “Automatically log…”.
   - Cost Savings — “Save on staffing…”.

2) Integrations (“Integrates with your tools”)
   - Horizontal manual scroll with recognizable brand names (Salesforce, HubSpot, Zoho, Google Calendar, Outlook, Twilio, SignalWire, Stripe, Slack, Zapier, AWS).
   - Upgrade later to continuous marquee with CSS module + `prefers-reduced-motion` support.

3) How It Works (1–2–3)
   - Connect → AI Answers → Scheduling & Follow‑up.
   - Minimal copy; icon + one line each.

4) Testimonials / Social Proof
   - 2–3 quotes carousel (static in preview). Swap with real quotes when available.

5) Feature Highlights (“Why EarlyBird”)
   - Human‑Like Voice; Barge‑in & Real‑Time; Security & Privacy; Easy Setup & Management.

6) CTA Banner
   - “Never miss another call. Ready to get started?” with Start Trial / Book Demo.

7) Pricing Teaser
   - Basic / Pro / Elite / Enterprise (“Custom — let’s talk”). Link to full pricing.

Notes: Copy is intentionally concise; replace with validated marketing copy before production. All animations remain CSS‑only and CSP‑safe.

## Dashboard — Preview Layout
- Overview: Welcome, service status, plan + usage with progress, quick stats.
- Recent Calls: Compact table with time, caller, duration, outcome (badges), quick link to Calls page.
- Onboarding Checklist: Connect phone, calendar, CRM; customize greeting; test call.
- Actions: Upgrade plan, open integrations, edit greeting.

## Navigation (App Shell)
- Sidebar (existing) items: Dashboard, Calls/Recordings, Appointments, Contacts/CRM, Integrations, Billing & Plan, Account Settings, Support.

## Accessibility & Performance
- Contrast: Ensure gold accent is darkened when on light backgrounds.
- Motion: No inline scripts; no un‑nonce’d inline styles; respect `prefers-reduced-motion` (future marquee enhancement).
- Assets: SVG or small Lottie only; lazy‑load below‑fold later.

## Security Posture (reference)
Adhere to `Desktop/security_features_expectations.txt`:
- No inline scripts; CSP nonce‑based policy respected. Avoid inline styles in preview.
- Do not duplicate header logic; no changes to middleware or headers in preview.
- Keep preview routes public, content‑only; no PHI, secrets, or webhook logic.
- Mark preview as `dynamic='force-dynamic'` where appropriate and avoid caching sensitive endpoints (none used here).

## Implementation Notes
- Tech: Next.js (app router) + Tailwind. All preview changes live under non‑invasive routes.
- Components are defined inline within route files for minimal surface area. Extract to shared components post‑validation.

## Next Steps (Post‑Preview)
1) Replace emoji icons with unified SVG set; add CSS marquee module with reduced‑motion.
2) Add gentle on‑scroll reveal animations (IntersectionObserver, CSS classes).
3) Wire dashboard preview to real data behind feature flags; add audio player + transcript drawer.
4) Finalize copy, QA accessibility, and performance pass.

