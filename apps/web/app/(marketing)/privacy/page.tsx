const PRIVACY_SECTIONS = [
  {
    title: "Information we collect",
    intro: "Everything we collect is tied to operating the AI receptionist and supporting your workspace.",
    bullets: [
      "Account details you provide: name, email, organization, role, and billing contact.",
      "Telephony metadata: numbers involved, timestamps, call duration, routing outcomes, and retry counts.",
      "Content you enable: call recordings, transcripts, tags, and automation payloads.",
      "Usage signals: feature flags, login timestamps, IP addresses, and device data for security and abuse prevention.",
    ],
  },
  {
    title: "How we use it",
    intro: "Data stays inside EarlyBird unless you authorize an integration or export.",
    bullets: [
      "Deliver the service, including call handling, integrations, analytics, and support.",
      "Provide incident response and audit logs so you can understand how every call was handled.",
      "Process invoices, detect fraud, and comply with legal obligations.",
      "Improve voice quality, routing accuracy, and AI prompts using aggregated, de-identified metrics.",
    ],
  },
  {
    title: "Retention & deletion",
    paragraphs: [
      "Call recordings, transcripts, and automations follow the retention schedule you configure in the dashboard. By default we retain 180 days of recordings and transcripts." ,
      "Delete a workspace or email privacy@earlybird.ai to request export or deletion. We respond within two business days and complete verified deletion within 30 days unless applicable law requires longer retention." ,
    ],
  },
  {
    title: "AI, voice, and human oversight",
    paragraphs: [
      "EarlyBird agents run in isolated sandboxes. Prompts, transcripts, and automation payloads are versioned so you can audit what was said and why.",
      "We never train public models on your data. When we evaluate AI performance we use de-identified snippets and only with employees under NDA.",
    ],
  },
  {
    title: "Subprocessors",
    paragraphs: [
      "We use a short list of subprocessors to host infrastructure and deliver features. Each vendor is under a data processing agreement and must meet our security requirements.",
    ],
    bullets: [
      "Amazon Web Services (US) – core hosting and storage",
      "Vercel (US) – edge delivery of the marketing site",
      "Postmark (US) – transactional email",
      "Stripe (US) – billing and invoicing",
      "Google Cloud Platform (US) – speech-to-text processing when you enable transcripts",
    ],
  },
  {
    title: "Your rights",
    paragraphs: [
      "You can access, correct, export, or delete your data at any time by emailing privacy@earlybird.ai. Workspace owners can configure retention and access controls directly from the dashboard.",
      "We honor GDPR, CCPA, and similar regional requests. If you are an end caller, EarlyBird acts as a processor on behalf of the business you called—contact them directly to exercise your rights and we will assist." ,
    ],
  },
];

export const metadata = {
  title: "Privacy Policy",
  description: "How EarlyBird collects, uses, retains, and safeguards customer and caller data.",
};

export default function PrivacyPage() {
  const lastUpdated = new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(new Date());

  return (
    <div className="relative flex flex-col">
      <section className="relative overflow-hidden px-5 pb-12 pt-20 sm:px-6 md:pt-28">
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.28),_transparent_70%)]" />
          <div className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.08),_transparent_60%)] blur-3xl" />
        </div>
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
            Privacy
          </span>
          <h1 className="mt-6 text-4xl font-semibold text-white md:text-5xl">We protect caller and business data by default.</h1>
          <p className="mt-6 max-w-2xl text-base text-white/70 md:text-lg">
            EarlyBird only collects what’s required to route calls, power the AI assistant, and support your team. We never sell data, and you control how long voice content lives inside the platform.
          </p>
          <div className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
            <span>Last update {lastUpdated}</span>
            <span>privacy@earlybird.ai</span>
          </div>
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-6xl px-5 pb-24 sm:px-6">
        <div className="relative overflow-hidden rounded-[40px] border border-white/12 bg-white/5 px-6 py-12 md:px-12 md:py-16">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_72%)]" />
            <div className="absolute -left-14 top-20 h-40 w-40 rounded-full bg-purple-500/25 blur-[120px]" />
            <div className="absolute -right-12 bottom-16 h-48 w-48 rounded-full bg-sky-500/20 blur-[140px]" />
          </div>
          <div className="space-y-8">
            {PRIVACY_SECTIONS.map((section) => (
              <article key={section.title} className="rounded-3xl border border-white/12 bg-white/5 p-6 text-white/80">
                <h2 className="text-2xl font-semibold text-white">{section.title}</h2>
                {section.intro ? <p className="mt-3 text-sm text-white/70">{section.intro}</p> : null}
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph} className="mt-3 text-sm text-white/70">
                    {paragraph}
                  </p>
                ))}
                {section.bullets ? (
                  <ul className="mt-4 space-y-2 text-sm text-white/80">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-purple-400/70" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
            <article className="rounded-3xl border border-white/12 bg-white/5 p-6 text-sm text-white/70">
              <h2 className="text-xl font-semibold text-white">Contact</h2>
              <p className="mt-3">
                Have a privacy question or need to execute a data processing agreement? Email <a className="underline decoration-dotted underline-offset-4" href="mailto:privacy@earlybird.ai">privacy@earlybird.ai</a>. We respond within two business days.
              </p>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
