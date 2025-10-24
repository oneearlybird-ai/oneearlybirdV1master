const TERMS_SECTIONS = [
  {
    title: "Accounts & eligibility",
    paragraphs: [
      "You must be at least 18, able to sign contracts on behalf of your organization, and provide accurate contact, billing, and company information. Workspace owners are responsible for the actions of their teammates.",
      "You’re responsible for maintaining the confidentiality of your credentials. Notify us immediately if you suspect unauthorized access." ,
    ],
  },
  {
    title: "Acceptable use",
    bullets: [
      "Only place calls and send messages that comply with applicable telemarketing, privacy, and consent laws (including state call-recording rules and TCPA).",
      "Do not probe, scan, or reverse engineer the service, bypass rate limits, or disrupt carrier networks.",
      "Use transcriptions and recordings only for legitimate business purposes and keep sensitive information out of prompts where possible.",
    ],
  },
  {
    title: "Billing & renewals",
    paragraphs: [
      "Paid plans bill monthly in arrears via Stripe using metered minutes and any add-ons you enable. All fees are exclusive of taxes, which we collect when required.",
      "Upgrades take effect immediately with prorated charges. Downgrades and cancellations apply at the next renewal; you are responsible for usage incurred before the plan change." ,
    ],
  },
  {
    title: "AI & call recordings",
    paragraphs: [
      "AI agents run according to the routing, scripts, and automations you configure. We don’t guarantee any specific business outcome, and you should monitor hand-offs and CRM updates periodically.",
      "Call recordings and transcripts are disabled by default in jurisdictions that require dual consent. You are responsible for enabling or disabling them based on your legal obligations." ,
    ],
  },
  {
    title: "Confidentiality & data",
    paragraphs: [
      "We treat customer data as confidential and only use it to provide and improve the service, consistent with our Privacy Policy. Each party agrees to protect the other’s confidential information with reasonable care.",
      "If law enforcement or regulators request your data, we’ll notify you unless legally prohibited. You remain the controller of the data you upload." ,
    ],
  },
  {
    title: "Service changes & termination",
    paragraphs: [
      "We may update features or make non-breaking changes to these terms by posting a new effective date. Material changes will be communicated at least 30 days in advance.",
      "You can terminate at any time by emailing legal@earlybird.ai or cancelling in the dashboard. We may suspend the service for non-payment, abuse, or security risks after reasonable notice." ,
    ],
  },
  {
    title: "Disclaimers & liability",
    paragraphs: [
      "The service is provided on an “as is” basis without implied warranties. We do not guarantee uninterrupted access—carrier outages and internet disruptions can occur.",
      "Our aggregate liability for any claim is capped at the fees you paid to EarlyBird in the prior three months. We are not liable for indirect or consequential damages." ,
    ],
  },
  {
    title: "Governing law",
    paragraphs: [
      "These terms are governed by the laws of the State of Delaware, excluding conflict of law principles. Any disputes will be resolved in the state or federal courts located in Wilmington, Delaware." ,
    ],
  },
];

export const metadata = {
  title: "Terms of Service",
  description: "The conditions of using EarlyBird, including acceptable use, billing, AI responsibilities, and legal contact details.",
};

export default function TermsPage() {
  const effectiveDate = new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(new Date());

  return (
    <div className="relative flex flex-col">
      <section className="relative overflow-hidden px-5 pb-12 pt-20 sm:px-6 md:pt-28">
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.26),_transparent_70%)]" />
          <div className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.08),_transparent_60%)] blur-3xl" />
        </div>
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
            Terms of service
          </span>
          <h1 className="mt-6 text-4xl font-semibold text-white md:text-5xl">The agreement behind EarlyBird</h1>
          <p className="mt-6 max-w-2xl text-base text-white/70 md:text-lg">
            This summary keeps the legalese readable. By using EarlyBird you agree to the terms below, including our Privacy Policy and any service-specific addenda.
          </p>
          <div className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
            <span>Effective {effectiveDate}</span>
            <span>legal@earlybird.ai</span>
          </div>
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-6xl px-5 pb-24 sm:px-6">
        <div className="relative overflow-hidden rounded-[40px] border border-white/12 bg-white/5 px-6 py-12 md:px-12 md:py-16">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_72%)]" />
            <div className="absolute -left-16 top-24 h-44 w-44 rounded-full bg-purple-500/25 blur-[130px]" />
            <div className="absolute -right-14 bottom-20 h-48 w-48 rounded-full bg-sky-500/20 blur-[140px]" />
          </div>
          <div className="space-y-8">
            {TERMS_SECTIONS.map((section) => (
              <article key={section.title} className="rounded-3xl border border-white/12 bg-white/5 p-6 text-white/80">
                <h2 className="text-2xl font-semibold text-white">{section.title}</h2>
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
              <h2 className="text-xl font-semibold text-white">Questions?</h2>
              <p className="mt-3">
                Email <a className="underline decoration-dotted underline-offset-4" href="mailto:legal@earlybird.ai">legal@earlybird.ai</a>. We’re happy to send a countersigned copy, complete DPAs, or discuss custom terms for enterprise agreements.
              </p>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
