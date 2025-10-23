export const dynamic = "force-static";

import Link from "next/link";

const GUIDE_SECTIONS = [
  {
    title: "Workspace setup",
    summary: "Invite teammates, brand the receptionist, and review call defaults.",
    bullets: [
      "Send invites with role-based approvals and OTP step-up.",
      "Upload greeting audio and review fallback routing.",
      "Confirm calendar sources before connecting integrations.",
    ],
  },
  {
    title: "Telephony & forwarding",
    summary: "Keep your carrier. Point calls at EarlyBird in minutes.",
    bullets: [
      "Verify the connect number after billing is active.",
      "Follow the forwarding steps for AT&T, Verizon, RingCentral, or PBXs.",
      "Run a live test call and watch analytics populate instantly.",
    ],
    link: { label: "Forwarding checklist", href: "/support/porting" },
  },
  {
    title: "Integrations",
    summary: "Sync call outcomes into the tools ops already trusts.",
    bullets: [
      "Authorize HubSpot, Salesforce, ServiceTitan, and Zoho via secure OAuth.",
      "Map dispositions to deals, tickets, and jobs with a few clicks.",
      "Toggle transcript + recording attachments for QA and coaching.",
    ],
  },
  {
    title: "Automation & analytics",
    summary: "Automate hand-offs and monitor the AI like any teammate.",
    bullets: [
      "Trigger follow-up texts, emails, or Slack alerts on qualified calls.",
      "Inspect answer rate, booking conversion, and hand-offs from the live dashboard.",
      "Export transcripts, tags, and sentiment for deeper reporting.",
    ],
  },
];

const SECURITY_POINTS = [
  "Cookie-only auth with Secure, httpOnly, SameSite=Lax flags.",
  "CSP, HSTS, Referrer-Policy, and Permissions-Policy enforced by default.",
  "Signed webhooks and workspace-scoped API keys with HMAC signatures.",
];

const API_ENDPOINTS = [
  "POST /v1/calls",
  "GET /v1/calls/{id}",
  "POST /v1/customers",
  "GET /v1/customers/{id}",
  "POST /v1/automation/triggers",
];

export default function DocsPage() {
  const lastUpdated = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date());

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden px-5 pt-20 pb-12 sm:px-6 md:pt-28">
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.32),_transparent_68%)]" />
          <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.1),_transparent_60%)] blur-2xl" />
        </div>
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
            Doc hub
          </span>
          <h1 className="mt-6 text-4xl font-semibold text-white">Launch EarlyBird with confidence</h1>
          <p className="mt-6 text-base text-white/70">
            Configure forwarding, integrations, and automations in minutes. These notes map exactly to the dashboard flow—no filler.
          </p>
          <div className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
            <span>Updated {lastUpdated}</span>
          </div>
        </div>
      </section>

      <section className="relative px-5 pb-16 sm:px-6 md:pb-24">
        <div className="mx-auto flex max-w-3xl flex-col gap-8">
          {GUIDE_SECTIONS.map((section) => (
            <article key={section.title} className="rounded-3xl border border-white/12 bg-white/5 p-5">
              <h2 className="text-lg font-semibold text-white">{section.title}</h2>
              <p className="mt-2 text-sm text-white/70">{section.summary}</p>
              <ul className="mt-4 space-y-2 text-sm text-white/80">
                {section.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-purple-400/70" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
              {section.link ? (
                <Link
                  href={section.link.href}
                  className="mt-4 inline-flex items-center rounded-2xl border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/35 hover:text-white"
                >
                  {section.link.label}
                </Link>
              ) : null}
            </article>
          ))}

          <article className="rounded-3xl border border-white/12 bg-white/5 p-5" id="security">
            <h2 className="text-lg font-semibold text-white">Security & compliance</h2>
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              {SECURITY_POINTS.map((point) => (
                <li key={point} className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-purple-400/70" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-white/60">
              Need evidence for your security review? Email <a className="underline decoration-dotted underline-offset-4" href="mailto:security@earlybird.ai">security@earlybird.ai</a>.
            </p>
          </article>

          <article className="rounded-3xl border border-white/12 bg-white/5 p-5" id="api">
            <h2 className="text-lg font-semibold text-white">API quick reference</h2>
            <p className="mt-2 text-sm text-white/70">Workspace-scoped API keys authenticate every request. All payloads accept JSON.</p>
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              {API_ENDPOINTS.map((endpoint) => (
                <li key={endpoint} className="rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] text-purple-200/80">
                  {endpoint}
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-3xl border border-white/12 bg-white/5 p-5 text-sm text-white/70">
            <h2 className="text-lg font-semibold text-white">Still stuck?</h2>
            <p className="mt-2">Open the support drawer in the dashboard or email <a className="underline decoration-dotted underline-offset-4" href="mailto:support@earlybird.ai">support@earlybird.ai</a>. Engineers reply within business hours and on-call handles urgent issues nights and weekends.</p>
          </article>
        </div>
      </section>
    </div>
  );
}
