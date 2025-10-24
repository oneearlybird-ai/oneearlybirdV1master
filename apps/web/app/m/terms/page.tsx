const TERMS_SECTIONS = [
  {
    title: "Accounts",
    paragraphs: [
      "You must provide accurate company and billing details. Workspace owners are responsible for how teammates use the service.",
    ],
  },
  {
    title: "Acceptable use",
    bullets: [
      "Follow all telemarketing, privacy, and call-recording laws that apply to your business.",
      "Do not probe or disrupt carrier networks, or attempt to bypass security controls.",
      "Keep prompts, transcripts, and recordings within legitimate business use cases.",
    ],
  },
  {
    title: "Billing",
    paragraphs: [
      "Plans bill monthly via Stripe based on minutes and add-ons you enable. Upgrades apply immediately; downgrades take effect at the next renewal.",
      "Unpaid invoices may result in suspension after reasonable notice.",
    ],
  },
  {
    title: "AI & recordings",
    paragraphs: [
      "You configure how the agent answers and when humans are notified. Monitor hand-offs and adjust scripts as needed.",
      "Recordings are disabled by default where dual consent is required—turn them on only if you have permission.",
    ],
  },
  {
    title: "Termination",
    paragraphs: [
      "Cancel anytime from the dashboard or by emailing legal@earlybird.ai. We may suspend service for non-payment or abuse after notice.",
    ],
  },
  {
    title: "Liability",
    paragraphs: [
      "The service is provided “as is”. Our aggregate liability is limited to fees paid in the prior three months.",
    ],
  },
];

export const metadata = {
  title: "Terms of Service",
  description: "Key obligations when you use EarlyBird.",
};

export default function TermsPage() {
  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden px-5 pt-20 pb-12 sm:px-6 md:pt-28">
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.26),_transparent_70%)]" />
        </div>
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Terms</span>
          <h1 className="mt-6 text-4xl font-semibold text-white">The essentials in plain language</h1>
          <p className="mt-6 text-base text-white/70">By using EarlyBird you agree to the points below. Reach out if you need a signed copy or custom agreement.</p>
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-6 md:pb-24">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          {TERMS_SECTIONS.map((section) => (
            <article key={section.title} className="rounded-3xl border border-white/12 bg-white/5 p-5 text-sm text-white/75">
              <h2 className="text-lg font-semibold text-white">{section.title}</h2>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="mt-3">{paragraph}</p>
              ))}
              {section.bullets ? (
                <ul className="mt-3 space-y-2 text-left">
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
            <p className="mt-2">Email <a className="underline decoration-dotted underline-offset-4" href="mailto:legal@earlybird.ai">legal@earlybird.ai</a> for agreements, BAAs, or custom terms.</p>
          </article>
        </div>
      </section>
    </div>
  );
}
