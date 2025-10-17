export const dynamic = "force-static";

import CopyLinkButton from "@/components/CopyLinkButton";
import Section from "@/components/stellar/Section";

const sections = [
  {
    id: "getting-started",
    title: "Getting started",
    description:
      "Provision numbers, connect calendars, and invite your team. Everything in the dashboard mirrors what you see in the preview.",
    bullets: [
      "Managed telephony — we host numbers or port your existing lines. No extra carrier account required.",
      "Single Stripe invoice for platform + usage. Taxes calculated automatically.",
      "Role-based access with OTP-backed step-up for sensitive actions.",
    ],
  },
  {
    id: "porting",
    title: "Porting your number",
    description: "Bring your voice lines over without downtime. We coordinate with your current carrier and share FOC milestones.",
    bullets: [
      "Have your account number, service address, and port-out PIN ready.",
      "Submit the request from the dashboard or email support@earlybird.ai.",
      "Keep the existing service active until you receive the cutover confirmation.",
    ],
    cta: {
      href: "/support/porting",
      label: "Start a port request",
    },
  },
  {
    id: "authentication",
    title: "Authentication",
    description:
      "Frontend stays cookie-auth only. The server validates via JWKS. No JWT parsing or token storage happens in the browser.",
    bullets: [
      "Three httpOnly cookies on .oneearlybird.ai · Secure · SameSite=Lax · Path=/.",
      "Google OAuth start URL always includes identity_provider=Google, prompt=select_account, max_age=0, return_host, return_path.",
      "Fallback redirect mirrors popup flow if window.open is blocked; listeners resolve via postMessage or custom events.",
    ],
  },
  {
    id: "api",
    title: "Key API endpoints",
    description: "Server-side calls only; marketing surfaces never ship with embedded secrets.",
    bullets: [
      "POST /api/v1/calls — create and route a new call.",
      "GET /api/v1/calls/:id — retrieve status, transcript, and metadata.",
      "POST /api/v1/customers — upsert customers with segmentation tags.",
    ],
  },
];

const guardrails = [
  "Cache-Control: no-store on every auth-protected response.",
  "Access-Control-Allow-Origin echoes the requesting origin (.oneearlybird.ai or m.oneearlybird.ai) with Access-Control-Allow-Credentials: true.",
  "Strict CSP (Report-Only today) with nonce-based scripts and Trusted Types reporting.",
  "HSTS (includeSubDomains, no preload yet), Referrer-Policy: strict-origin-when-cross-origin, X-Frame-Options: DENY, minimal Permissions-Policy.",
  "Signed webhooks, short-lived presigned URLs, and limited logging (no PHI).",
];

export default function DocsPage() {
  return (
    <div className="flex flex-col">
      <section className="px-5 pt-20 pb-12 sm:px-6 md:pt-28">
        <div className="mx-auto max-w-3xl">
          <span className="stellar-pill">Documentation</span>
          <h1 className="mt-6 text-4xl font-semibold text-white md:text-5xl">Everything you need to launch EarlyBird.</h1>
          <p className="mt-6 text-base text-white/70 md:text-lg">
            These docs match the Stellar rollout: cookie-auth, security headers, dashboard guardrails, and onboarding tasks. Bookmark this page —
            we append dated updates as the platform evolves.
          </p>
          <nav className="mt-8 flex flex-wrap gap-3 text-sm text-white/70" aria-label="On this page">
            {sections.map((section) => (
              <a key={section.id} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 transition hover:border-white/25 hover:text-white" href={`#${section.id}`}>
                {section.title}
              </a>
            ))}
            <a className="rounded-full border border-white/15 bg-white/5 px-3 py-1 transition hover:border-white/25 hover:text-white" href="#guardrails">
              Security guardrails
            </a>
          </nav>
        </div>
      </section>

      <Section>
        <div className="mx-auto flex max-w-3xl flex-col gap-12">
          {sections.map((section) => (
            <article key={section.id} id={section.id} className="rounded-3xl border border-white/12 bg-white/5 p-6 md:p-8">
              <header className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-white">{section.title}</h2>
                  <p className="mt-3 text-sm text-white/70">{section.description}</p>
                </div>
                <CopyLinkButton anchorId={section.id} />
              </header>
              <ul className="mt-6 list-disc space-y-3 pl-5 text-sm text-white/80">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
              {section.cta ? (
                <a
                  href={section.cta.href}
                  className="mt-6 inline-flex items-center rounded-2xl border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/35 hover:text-white"
                >
                  {section.cta.label}
                </a>
              ) : null}
            </article>
          ))}
        </div>
      </Section>

      <Section
        id="guardrails"
        eyebrow="Security & guardrails"
        title="What stays true across marketing, auth, and dashboard surfaces"
        description="The Stellar port keeps the same contracts you rely on today. When we flip CSP to enforcement, these controls remain identical."
      >
        <div className="stellar-grid-card bg-white/5">
          <ul className="list-disc space-y-2 pl-5 text-sm text-white/80">
            {guardrails.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-white/55">
            Need anything clarified? Email <a className="underline decoration-dotted underline-offset-4" href="mailto:security@oneearlybird.ai">security@oneearlybird.ai</a>.
          </p>
        </div>
      </Section>
    </div>
  );
}
