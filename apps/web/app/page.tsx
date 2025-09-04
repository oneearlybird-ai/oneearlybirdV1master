import Link from "next/link";

function Section({ id, title, children }: { id?: string; title?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      {title ? <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-6">{title}</h2> : null}
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
      {/* Sticky Nav */}
      <div className="sticky top-0 z-40 border-b border-white/10 bg-neutral-950/75 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/55">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="inline-block h-6 w-6 rounded bg-white" />
            EarlyBird
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <Link href="#how" className="text-white/80 hover:text-white">How it works</Link>
            <Link href="#integrations" className="text-white/80 hover:text-white">Integrations</Link>
            <Link href="/pricing" className="text-white/80 hover:text-white">Pricing</Link>
            <Link href="/docs" className="text-white/80 hover:text-white">Docs</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden md:inline rounded-xl border border-white/20 px-4 py-2 text-sm text-white/80 hover:text-white">Log in</Link>
            <Link href="/signup" className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90">Get Started</Link>
          </div>
        </nav>
      </div>

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
          EarlyBird handles inbound calls with a natural, on-brand voice: qualification, FAQs, routing/transfers, and
          scheduling across Google/Microsoft Calendar. Owners get transcripts, recordings, analytics, and clean billing.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/signup" className="rounded-xl bg-white px-5 py-3 font-medium text-black">Start free</Link>
          <Link href="/pricing" className="rounded-xl border border-white/20 px-5 py-3 text-white/80 hover:text-white">See pricing</Link>
        </div>

        {/* Stats */}
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          <Stat label="Call answer rate" value="99.9%" />
          <Stat label="Avg. booking time" value="~35s" />
          <Stat label="Languages & accents" value="40+" />
        </div>
      </Section>

      {/* Social proof */}
      <Section>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-white/80">“We doubled booked appointments without adding headcount.”</p>
            <div className="mt-4 text-sm text-white/50">Clinic Ops, DentalCare Group</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-white/80">“Call routing is instant, and our CSAT went up within a week.”</p>
            <div className="mt-4 text-sm text-white/50">Support Lead, HomeFix</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-white/80">“Transcripts + analytics finally gave us visibility into call outcomes.”</p>
            <div className="mt-4 text-sm text-white/50">GM, Lakeside Inn</div>
          </div>
        </div>
      </Section>

      {/* Benefits */}
      <Section title="Why EarlyBird">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 p-6">
            <h3 className="font-medium">Natural voice</h3>
            <p className="mt-2 text-sm text-white/70">Low-latency ASR ↔ policy ↔ TTS with barge-in for real conversation flow.</p>
          </div>
          <div className="rounded-2xl border border-white/10 p-6">
            <h3 className="font-medium">Scheduling automation</h3>
            <p className="mt-2 text-sm text-white/70">Reads availability, books/reschedules/cancels, sends confirmations &amp; reminders.</p>
          </div>
          <div className="rounded-2xl border border-white/10 p-6">
            <h3 className="font-medium">Owner visibility</h3>
            <p className="mt-2 text-sm text-white/70">Dashboard with transcripts, recordings, outcomes, and cost/min margins.</p>
          </div>
        </div>
      </Section>

      {/* How it works */}
      <Section id="how" title="How it works">
        <ol className="grid gap-4 md:grid-cols-3 list-decimal pl-6">
          <li className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="font-medium">Connect your number</div>
            <p className="mt-2 text-sm text-white/70">Point Twilio/Plivo/Vonage to EarlyBird. We handle PSTN/SIP and routing.</p>
          </li>
          <li className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="font-medium">Set rules &amp; knowledge</div>
            <p className="mt-2 text-sm text-white/70">Import FAQs, business hours, locations, provider mapping, and guardrails.</p>
          </li>
          <li className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="font-medium">Go live</div>
            <p className="mt-2 text-sm text-white/70">EarlyBird answers calls, books appointments, and routes to humans when needed.</p>
          </li>
        </ol>
      </Section>

      {/* Integrations */}
      <Section id="integrations" title="Integrations">
        <div className="grid gap-4 md:grid-cols-4">
          {["Twilio", "Plivo", "Google Calendar", "Microsoft 365", "Stripe", "Postmark", "HubSpot", "Salesforce"].map((name) => (
            <div key={name} className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/80">{name}</div>
          ))}
        </div>
      </Section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-white/60">© {new Date().getFullYear()} EarlyBird, Inc.</div>
          <div className="flex gap-6 text-sm">
            <Link href="/privacy" className="text-white/70 hover:text-white">Privacy</Link>
            <Link href="/terms" className="text-white/70 hover:text-white">Terms</Link>
            <Link href="/docs" className="text-white/70 hover:text-white">Docs</Link>
            <Link href="/support" className="text-white/70 hover:text-white">Support</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
