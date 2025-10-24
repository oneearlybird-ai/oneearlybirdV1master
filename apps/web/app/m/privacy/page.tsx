const PRIVACY_SECTIONS = [
  {
    title: "Information we collect",
    bullets: [
      "Account details (name, email, organization, billing contact).",
      "Telephony metadata such as numbers dialed, timestamps, routing outcomes, and retry counts.",
      "Content you enable: recordings, transcripts, tags, and automation payloads.",
      "Usage signals for security and abuse detection.",
    ],
  },
  {
    title: "How we use it",
    bullets: [
      "Operate the AI receptionist, integrations, analytics, and support.",
      "Provide audit trails and incident response when you request help.",
      "Process invoices and comply with legal obligations.",
      "Improve quality using aggregated, de-identified metrics—never by selling data.",
    ],
  },
  {
    title: "Retention & deletion",
    paragraphs: [
      "Recordings and transcripts follow the retention schedule you configure (180 days by default).", 
      "Email privacy@earlybird.ai to export or delete your workspace. Verified deletion completes within 30 days unless law requires longer retention." ,
    ],
  },
  {
    title: "AI & human oversight",
    paragraphs: [
      "Agents run in isolated sandboxes. Prompts, transcripts, and automations are versioned so you can audit behaviour.",
      "We never train public models on your data. Any evaluations use de-identified snippets by employees under NDA." ,
    ],
  },
];

export const metadata = {
  title: "Privacy Policy",
  description: "How EarlyBird collects, uses, and protects customer data.",
};

export default function PrivacyPage() {
  const lastUpdated = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date());

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden px-5 pt-20 pb-12 sm:px-6 md:pt-28">
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.28),_transparent_70%)]" />
        </div>
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
            Privacy
          </span>
          <h1 className="mt-6 text-4xl font-semibold text-white">Your callers. Your data.</h1>
          <p className="mt-6 text-base text-white/70">
            We collect the minimum required to route calls and support your workspace. Retention stays in your control.
          </p>
          <div className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
            <span>Updated {lastUpdated}</span>
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-6 md:pb-24">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          {PRIVACY_SECTIONS.map((section) => (
            <article key={section.title} className="rounded-3xl border border-white/12 bg-white/5 p-5 text-sm text-white/75">
              <h2 className="text-lg font-semibold text-white">{section.title}</h2>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="mt-3">{paragraph}</p>
              ))}
              {section.bullets ? (
                <ul className="mt-3 space-y-2 text-left text-white/80">
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
          <article className="rounded-3xl border border-white/12 bg-white/5 p-5 text-sm text-white/70">
            <h2 className="text-lg font-semibold text-white">Contact</h2>
            <p className="mt-2">Email <a className="underline decoration-dotted underline-offset-4" href="mailto:privacy@earlybird.ai">privacy@earlybird.ai</a> for data requests. We respond within two business days.</p>
          </article>
        </div>
      </section>
    </div>
  );
}
