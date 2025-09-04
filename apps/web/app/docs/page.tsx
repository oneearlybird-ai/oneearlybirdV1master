export const metadata = {
  title: "Docs — EarlyBird",
  description: "How EarlyBird works and how to get set up.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-8">
      <h2 className="text-xl md:text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="prose prose-invert mt-4 text-white/80">
        {children}
      </div>
    </section>
  );
}

export default function DocsPage() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white">
      <header className="mx-auto max-w-6xl px-6 pt-12 pb-4">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Documentation</h1>
        <p className="mt-3 max-w-2xl text-white/70">
          Learn how to connect your number, set rules & knowledge, and go live with EarlyBird.
        </p>
      </header>

      <Section title="1) Connect your number">
        <ul>
          <li>Point Twilio/Plivo/Vonage webhooks to EarlyBird.</li>
          <li>We handle SIP/PSTN, routing, and failover targets.</li>
        </ul>
      </Section>

      <Section title="2) Rules & knowledge">
        <ul>
          <li>Business hours, locations, provider mapping.</li>
          <li>FAQs, escalation paths, and transfer policies.</li>
        </ul>
      </Section>

      <Section title="3) Go live">
        <ul>
          <li>Answer calls, book appointments, route to humans when needed.</li>
          <li>Owners see transcripts, recordings, analytics, and billing.</li>
        </ul>
      </Section>
    </main>
  );
}
