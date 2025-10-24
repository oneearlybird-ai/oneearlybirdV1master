export const dynamic = "force-static";

import Link from "next/link";

const GUIDE_SECTIONS = [
  {
    id: "workspace",
    title: "Workspace setup",
    summary: "Lay the foundation the moment you sign in.",
    bullets: [
      "Invite your team and assign voice, billing, or analytics roles with OTP-backed approvals.",
      "Complete the branding checklist so callers hear your business name, not a generic greeting.",
      "Review the control center to confirm default hours, fallback numbers, and escalation rules.",
    ],
  },
  {
    id: "forwarding",
    title: "Telephony & forwarding",
    summary: "Keep your carrier and route every call through EarlyBird.",
    bullets: [
      "Generate your connect number after billing is active, then verify it with a single test call.",
      "Follow the forwarding playbook for AT&T, Verizon, RingCentral, Zoom Phone, and PBX flows.",
      "Use dashboard health cards to confirm forwarding stays enabled and SMS routing looks correct.",
    ],
    cta: { label: "Forwarding checklist", href: "/support/porting" },
  },
  {
    id: "integrations",
    title: "Integrations & CRM sync",
    summary: "Sync transcripts, bookings, and dispositions into the systems ops already uses.",
    bullets: [
      "Authorize HubSpot, Salesforce, ServiceTitan, and Zoho with secure OAuth—no API keys in the browser.",
      "Map call outcomes to deals, tickets, and jobs so every capture feeds the right pipeline.",
      "Enable transcript + recording attachments for QA and coaching with one toggle.",
    ],
  },
  {
    id: "automation",
    title: "Automations & analytics",
    summary: "Instrument the AI agent just like any human teammate.",
    bullets: [
      "Schedule automations to trigger follow-up texts, emails, or Slack alerts on qualified calls.",
      "Benchmark answer rate, hand-offs, and booking conversion from the live analytics deck.",
      "Export transcripts, tags, and sentiment for deeper reporting or LLM tuning.",
    ],
  },
  {
    id: "support",
    title: "Support & escalation",
    summary: "Know how to reach us when you need a human.",
    bullets: [
      "Open the in-app drawer any time—engineers and onboarding specialists answer every request.",
      "Subscribe to status notifications so leadership hears about incidents first, not Twitter.",
      "Use the forwarding helper to schedule a joint session if your carrier portal needs a walk-through.",
    ],
    cta: { label: "Contact support", href: "mailto:support@earlybird.ai" },
  },
];

const SECURITY_POINTS = [
  "Cookie-only auth (Secure, httpOnly, SameSite=Lax) with short-lived sessions refreshed server-side.",
  "Strict CSP, HSTS, Referrer-Policy, and Permissions-Policy baked into every marketing and dashboard route.",
  "Every webhook, storage upload, and provider callback signed and scoped to the requesting workspace.",
  "SOC 2 controls in progress; HIPAA BAAs available for healthcare partners on request.",
];

const API_REFERENCE = [
  {
    title: "Voice & call control",
    description: "Trigger calls, fetch transcripts, and replay recordings.",
    endpoints: ["POST /v1/calls", "GET /v1/calls/{id}", "GET /v1/calls/{id}/recording"],
  },
  {
    title: "Customer data",
    description: "Keep CRM context aligned with every conversation.",
    endpoints: ["POST /v1/customers", "GET /v1/customers/{id}", "POST /v1/customers/{id}/tags"],
  },
  {
    title: "Automation hooks",
    description: "Respond to AI outcomes with your own workflows.",
    endpoints: ["POST /v1/automation/triggers", "POST /v1/automation/webhooks"],
  },
];

export default function DocsPage() {
  const lastUpdated = new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(new Date());

  return (
    <div className="relative flex flex-col">
      <section className="relative overflow-hidden px-5 pb-12 pt-20 sm:px-6 md:pt-28">
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.32),_transparent_68%)]" />
          <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.1),_transparent_60%)] blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,9,26,0)_0%,rgba(18,16,38,0.5)_100%)]" />
        </div>
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
            Doc hub
          </span>
          <h1 className="mt-6 text-4xl font-semibold leading-tight text-white md:text-5xl">Launch EarlyBird with confidence</h1>
          <p className="mt-6 max-w-2xl text-base text-white/70 md:text-lg">
            Configure telephony, integrations, automation, and security in one place. These guides match the exact flow you see inside the dashboard—no marketing-only screenshots.
          </p>
          <div className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
            <span>Last updated {lastUpdated}</span>
            <span>Support: support@earlybird.ai</span>
          </div>
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-6xl px-5 pb-20 sm:px-6">
        <div className="relative overflow-hidden rounded-[40px] border border-white/12 bg-white/5 px-6 py-12 md:grid md:grid-cols-[minmax(0,260px),minmax(0,1fr)] md:px-12">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_72%)]" />
            <div className="absolute -left-12 top-24 h-40 w-40 rounded-full bg-purple-500/25 blur-[100px]" />
            <div className="absolute -right-16 bottom-16 h-44 w-44 rounded-full bg-sky-500/20 blur-[120px]" />
          </div>

          <nav className="hidden md:block">
            <ul className="sticky top-24 space-y-3 text-sm text-white/60">
              {GUIDE_SECTIONS.map((section) => (
                <li key={section.id}>
                  <a className="block rounded-xl border border-transparent px-3 py-2 transition hover:border-white/20 hover:text-white" href={`#${section.id}`}>
                    {section.title}
                  </a>
                </li>
              ))}
              <li>
                <a className="block rounded-xl border border-transparent px-3 py-2 transition hover:border-white/20 hover:text-white" href="#security">
                  Security & compliance
                </a>
              </li>
              <li>
                <a className="block rounded-xl border border-transparent px-3 py-2 transition hover:border-white/20 hover:text-white" href="#api">
                  API reference
                </a>
              </li>
            </ul>
          </nav>

          <div className="space-y-10">
            {GUIDE_SECTIONS.map((section) => (
              <article key={section.id} id={section.id} className="rounded-3xl border border-white/12 bg-white/5 p-6">
                <header className="flex flex-col gap-2">
                  <h2 className="text-2xl font-semibold text-white">{section.title}</h2>
                  <p className="text-sm text-white/70">{section.summary}</p>
                </header>
                <ul className="mt-4 space-y-2 text-sm text-white/80">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-purple-400/70" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
                {section.cta ? (
                  <Link
                    href={section.cta.href}
                    className="mt-4 inline-flex items-center rounded-2xl border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/35 hover:text-white"
                  >
                    {section.cta.label}
                  </Link>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="security" className="relative mx-auto w-full max-w-6xl px-5 pb-16 sm:px-6 md:pb-24">
        <div className="relative overflow-hidden rounded-[40px] border border-white/12 bg-white/5 px-6 py-12 md:px-12">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.1),_transparent_70%)]" />
          </div>
          <div className="grid gap-10 md:grid-cols-[minmax(0,1.2fr),minmax(0,1fr)]">
            <div>
              <span className="stellar-badge mb-4">Security & compliance</span>
              <h2 className="text-3xl font-semibold text-white">How we keep customer conversations safe</h2>
              <p className="mt-3 text-sm text-white/70">
                Every layer—telephony, storage, analytics, and access—is designed around least privilege. SOC 2 Type II evidence is available under NDA.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-white/80">
                {SECURITY_POINTS.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-purple-400/70" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-white/12 bg-white/5 p-6 text-sm text-white/75">
              <h3 className="text-base font-semibold text-white">Responsible AI guardrails</h3>
              <p className="mt-2">
                EarlyBird agents run inside auditable sandboxes. Prompts, transcripts, and automations are versioned so you can prove what the AI said—and why. You control retention and redaction per workspace.
              </p>
              <p className="mt-3">
                Want a deeper dive? Email <a className="underline decoration-dotted underline-offset-4" href="mailto:security@earlybird.ai">security@earlybird.ai</a>.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="api" className="relative mx-auto w-full max-w-6xl px-5 pb-24 sm:px-6">
        <div className="relative overflow-hidden rounded-[40px] border border-white/12 bg-white/5 px-6 py-12 md:px-12">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_70%)]" />
          </div>
          <div className="mx-auto max-w-4xl text-center">
            <span className="stellar-badge mb-4">API overview</span>
            <h2 className="text-3xl font-semibold text-white">Build on top of EarlyBird</h2>
            <p className="mt-3 text-base text-white/70">
              These endpoints mirror what the dashboard does under the hood. Authentication uses workspace-scoped API keys and HMAC signatures.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {API_REFERENCE.map((group) => (
              <article key={group.title} className="rounded-3xl border border-white/12 bg-white/5 p-6 text-left">
                <h3 className="text-base font-semibold text-white">{group.title}</h3>
                <p className="mt-2 text-sm text-white/70">{group.description}</p>
                <ul className="mt-4 space-y-1 text-xs text-purple-200/80">
                  {group.endpoints.map((endpoint) => (
                    <li key={endpoint} className="rounded-xl border border-white/15 bg-white/[0.05] px-3 py-1 font-mono uppercase tracking-[0.2em] text-[0.65rem]">
                      {endpoint}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
