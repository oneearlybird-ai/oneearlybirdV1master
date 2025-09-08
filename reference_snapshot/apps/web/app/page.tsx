export const dynamic = 'force-dynamic';

import Link from "next/link";

function Section({
  id,
  title,
  children,
}: {
  id?: string;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      {title ? (
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-6">
          {title}
        </h2>
      ) : null}
      {children}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="text-3xl font-semibold">{value}</div>
      <div className="mt-2 text-white/70">{label}</div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white">
      {/* Hero */}
      <Section>
        <div className="mb-6">
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/70">
            🚀 AI Voice Receptionist for business phone calls
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight">
          Answer every call. <span className="text-white/70">Book more appointments.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-white/70">
          EarlyBird handles inbound calls with a natural, on-brand voice: qualification, FAQs,
          routing/transfers, and scheduling across Google/Microsoft Calendar. Owners get transcripts,
          recordings, analytics, and clean billing.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/signup" className="rounded-xl bg-white px-5 py-3 font-medium text-black">
            Start free
          </Link>
          <Link href="/pricing" className="rounded-xl border border-white/20 px-5 py-3 text-white/80 hover:text-white">
            See pricing
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          <Stat label="Call answer rate" value="99.9%" />
          <Stat label="Avg. booking time" value="~35s" />
          <Stat label="Languages & accents" value="40+" />
        </div>
      </Section>

      {/* Why EarlyBird */}
      <Section title="Why EarlyBird">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 p-6">
            <h3 className="font-medium">Natural voice</h3>
            <p className="mt-2 text-sm text-white/70">
              Low-latency ASR ↔ policy ↔ TTS with barge-in for real conversation flow.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 p-6">
            <h3 className="font-medium">Scheduling automation</h3>
            <p className="mt-2 text-sm text-white/70">
              Reads availability, books/reschedules/cancels, sends confirmations & reminders.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 p-6">
            <h3 className="font-medium">Owner visibility</h3>
            <p className="mt-2 text-sm text-white/70">
              Secure dashboard with transcripts, recordings, outcomes, and cost/min margins.
            </p>
          </div>
        </div>
      </Section>

      {/* How it works */}
      <Section id="how" title="How it works">
        <ol className="grid gap-4 md:grid-cols-3 list-decimal pl-6">
          <li className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="font-medium">Connect your number</div>
            <p className="mt-2 text-sm text-white/70">
              Point Twilio/Plivo/Vonage to EarlyBird. We handle PSTN/SIP and routing.
            </p>
          </li>
          <li className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="font-medium">Set rules & knowledge</div>
            <p className="mt-2 text-sm text-white/70">
              Import FAQs, business hours, locations, provider mapping, and guardrails.
            </p>
          </li>
          <li className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="font-medium">Go live</div>
            <p className="mt-2 text-sm text-white/70">
              EarlyBird answers calls, books appointments, and routes to humans when needed.
            </p>
          </li>
        </ol>
      </Section>

      {/* Integrations */}
      <Section id="integrations" title="Integrations">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            "Twilio",
            "Plivo",
            "Google Calendar",
            "Microsoft 365",
            "Stripe",
            "Postmark",
            "HubSpot",
            "Salesforce",
          ].map((name) => (
            <div
              key={name}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/80"
            >
              {name}
            </div>
          ))}
        </div>
      </Section>

      {/* ROI */}
      <Section title="Proven ROI">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 p-6">
            <div className="text-3xl font-semibold">$5–$12</div>
            <div className="mt-1 text-sm text-white/70">typical effective cost per booking</div>
          </div>
          <div className="rounded-2xl border border-white/10 p-6">
            <div className="text-3xl font-semibold">60–85%</div>
            <div className="mt-1 text-sm text-white/70">deflection to self-serve</div>
          </div>
          <div className="rounded-2xl border border-white/10 p-6">
            <div className="text-3xl font-semibold">24/7</div>
            <div className="mt-1 text-sm text-white/70">coverage with on-brand voice</div>
          </div>
        </div>

        <div className="mt-8">
          <Link href="/pricing" className="inline-block rounded-xl bg-white px-5 py-3 font-medium text-black">
            View Pricing
          </Link>
        </div>
      </Section>
    </main>
  );
}
