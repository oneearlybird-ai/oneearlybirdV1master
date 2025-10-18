import Section from "@/components/marketing/Section";

const contacts = [
  {
    title: "Support",
    items: [
      {
        label: "Email",
        value: "support@earlybird.ai",
        href: "mailto:support@earlybird.ai",
      },
      {
        label: "Documentation",
        value: "Developer docs",
        href: "/docs",
      },
    ],
  },
  {
    title: "Telephony & porting",
    description:
      "We manage carriers for you. Request new numbers or port existing ones — usage and carrier fees roll into a single Stripe invoice.",
    cta: {
      href: "/support/porting",
      label: "Start a port request",
    },
  },
];

const tips = [
  "Include repro steps, expected vs. actual behavior, and call IDs when emailing support.",
  "Keep the current carrier active during porting until we confirm the firm order commit (FOC) date.",
  "Use the dashboard wizard to invite teammates securely; OTP step-up protects sensitive actions.",
];

export const metadata = {
  title: "Support",
  description: "Contact the EarlyBird team, manage telephony requests, or troubleshoot common issues.",
};

export default function SupportPage() {
  return (
    <div className="flex flex-col">
      <section className="px-5 pt-20 pb-12 sm:px-6 md:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="stellar-pill">Support</span>
          <h1 className="mt-6 text-4xl font-semibold text-white md:text-5xl">We’re on-call for your team.</h1>
          <p className="mt-6 text-base text-white/70 md:text-lg">
            Reach out anytime — the same engineers who maintain the platform handle support so responses are accurate and fast.
          </p>
        </div>
      </section>

      <Section className="pt-0">
        <div className="mx-auto flex max-w-3xl flex-col gap-8">
          {contacts.map((entry) => (
            <article key={entry.title} className="stellar-grid-card bg-white/5">
              <h2 className="text-xl font-semibold text-white">{entry.title}</h2>
              {entry.items ? (
                <ul className="mt-3 space-y-2 text-sm text-white/80">
                  {entry.items.map((item) => (
                    <li key={item.label} className="flex flex-col gap-1">
                      <span className="text-xs uppercase tracking-wide text-white/60">{item.label}</span>
                      <a className="underline decoration-dotted underline-offset-4" href={item.href}>
                        {item.value}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
              {entry.description ? <p className="mt-3 text-sm text-white/70">{entry.description}</p> : null}
              {entry.cta ? (
                <a
                  href={entry.cta.href}
                  className="mt-4 inline-flex items-center rounded-2xl border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/35 hover:text-white"
                >
                  {entry.cta.label}
                </a>
              ) : null}
            </article>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Helpful tips"
        title="Speed up triage"
        description="A few quick reminders that help us resolve issues without back-and-forth."
      >
        <div className="stellar-grid-card bg-white/5">
          <ul className="list-disc space-y-2 pl-5 text-sm text-white/80">
            {tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>
      </Section>
    </div>
  );
}
