import Section from "@/components/marketing/Section";

const termsItems = [
  {
    title: "Use of service",
    bullets: [
      "No unlawful, harmful, or abusive use of EarlyBird or the provided telephony services.",
      "Follow state and federal call-recording consent requirements in your jurisdiction.",
      "Do not attempt to reverse engineer or circumvent rate limits or security controls.",
    ],
  },
  {
    title: "Billing",
    bullets: [
      "Usage-based fees are billed monthly via Stripe; taxes applied where required.",
      "Upgrades take effect immediately with prorated invoices; downgrades apply at the next renewal.",
      "Failure to pay may result in suspension after reasonable notice.",
    ],
  },
  {
    title: "Disclaimers & liability",
    bullets: [
      "Service provided on an “as is” basis without implied warranties.",
      "Our liability is capped at fees paid in the prior three months.",
      "We are not responsible for downstream carrier outages or internet failures.",
    ],
  },
];

export const metadata = {
  title: "Terms of Service",
  description: "Conditions of using EarlyBird, billing practices, and legal contact details.",
};

export default function TermsPage() {
  return (
    <div className="flex flex-col">
      <section className="px-5 pt-20 pb-12 sm:px-6 md:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="stellar-pill">Terms</span>
          <h1 className="mt-6 text-4xl font-semibold text-white md:text-5xl">Terms of Service</h1>
          <p className="mt-6 text-base text-white/70 md:text-lg">
            By using EarlyBird you agree to these conditions. We keep the language plain and highlight the obligations that matter.
          </p>
        </div>
      </section>

      <Section className="pt-0">
        <div className="mx-auto flex max-w-3xl flex-col gap-8">
          {termsItems.map((item) => (
            <article key={item.title} className="stellar-grid-card bg-white/5">
              <h2 className="text-xl font-semibold text-white">{item.title}</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-white/80">
                {item.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </article>
          ))}
          <article className="stellar-grid-card bg-white/5">
            <h2 className="text-xl font-semibold text-white">Contact</h2>
            <p className="mt-3 text-sm text-white/70">
              Legal questions? Email <a className="underline decoration-dotted underline-offset-4" href="mailto:legal@earlybird.ai">legal@earlybird.ai</a>.
            </p>
          </article>
        </div>
      </Section>
    </div>
  );
}
