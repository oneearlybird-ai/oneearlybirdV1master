Place official, up‑to‑date brand marks here as SVGs, named by provider id:

- google-calendar.svg
- microsoft-365.svg
- twilio.svg
- plivo.svg
- vonage.svg
- hubspot.svg
- salesforce.svg
- stripe.svg
- postmark.svg
- zapier.svg

Requirements
- Use vendor‑provided assets only (no re‑drawn or altered marks).
- Prefer monochrome/knockout variants suitable for dark backgrounds where available.
- Keep safe area and clearspace per brand guidelines; do not distort proportions.
- Optimize SVGs (svgo) and remove scripts/fonts; no external network refs.

Sizing in UI
- The integrator card renders the logo at `h-8 w-auto` inside padded bubbles.
- If a specific mark appears too small/large, adjust the viewBox/padding in the SVG (not CSS) to maintain consistent apparent size while preserving aspect ratio.

Accessibility
- We render an `<img alt="Provider">` and a visually hidden `<figcaption>` for screen readers.

Security
- SVGs must be static (no scripts, animations, external links). Run `svgo` before adding.
