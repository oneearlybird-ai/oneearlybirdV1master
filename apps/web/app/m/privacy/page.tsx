import Section from "@/components/marketing/Section";

const privacyPoints = [
  {
    title: "Data we collect",
    bullets: [
      "Account details: name, email, organization, and billing contact.",
      "Operational metadata for call handling (timestamps, routing outcomes, retry counts).",
      "Usage and billing metrics required for invoicing and fraud prevention.",
    ],
  },
  {
    title: "How we use data",
    bullets: [
      "Deliver, troubleshoot, and improve the EarlyBird service.",
      "Provide dashboards, analytics, and audit trails for your team.",
      "Process payments and enforce abuse safeguards.",
    ],
  },
  {
    title: "Your choices",
    description:
      "Request export or deletion at any time by emailing privacy@earlybird.ai. We respond within two business days and provide a secure handoff.",
  },
];

export const metadata = {
  title: "Privacy Policy",
  description: "What data EarlyBird collects, how it is used, and how you can exercise control over it.",
};

export default function PrivacyPage() {
  return (
    <div className="flex flex-col">
      <section className="px-5 pt-20 pb-12 sm:px-6 md:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="stellar-pill">Privacy</span>
          <h1 className="mt-6 text-4xl font-semibold text-white md:text-5xl">We protect caller and business data by default.</h1>
          <p className="mt-6 text-base text-white/70 md:text-lg">
            EarlyBird only collects the information required to operate the service. We never sell data, and we keep PHI out of logs.
          </p>
        </div>
      </section>

      <Section className="pt-0">
        <div className="mx-auto flex max-w-3xl flex-col gap-8">
          {privacyPoints.map((point) => (
            <article key={point.title} className="stellar-grid-card bg-white/5">
              <h2 className="text-xl font-semibold text-white">{point.title}</h2>
              {point.description ? (
                <p className="mt-3 text-sm text-white/70">{point.description}</p>
              ) : (
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-white/80">
                  {point.bullets?.map((entry) => (
                    <li key={entry}>{entry}</li>
                  ))}
                </ul>
              )}
            </article>
          ))}
          <article className="stellar-grid-card bg-white/5">
            <h2 className="text-xl font-semibold text-white">Contact</h2>
            <p className="mt-3 text-sm text-white/70">
              Email <a className="underline decoration-dotted underline-offset-4" href="mailto:privacy@earlybird.ai">privacy@earlybird.ai</a> for any privacy question.
            </p>
          </article>
        </div>
      </Section>
    </div>
  );
}
