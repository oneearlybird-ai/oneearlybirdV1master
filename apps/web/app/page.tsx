export const dynamic = 'force-dynamic';

import Link from "next/link";
import StaggerText from "@/components/StaggerText";

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


function Logo({ name }: { name: string }) {
  return (
    <div className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 flex items-center justify-center text-sm text-white/60 motion-safe:transition-opacity motion-reduce:transition-none">
      <span aria-label={name}>{name}</span>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white">
      {/* Hero (unchanged) */}
      <Section>
        <div className="mb-6">
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/70">
            🚀 AI Voice Receptionist for business phone calls
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight">
          <StaggerText text="Answer every call. Book more appointments." />
        </h1>

        <p className="mt-6 max-w-2xl text-white/70">
          EarlyBird handles inbound calls with a natural, on-brand voice: qualification, FAQs,
          routing/transfers, and scheduling across Google/Microsoft Calendar. Owners get transcripts,
          recordings, analytics, and clean billing.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/signup"
            className="rounded-xl bg-white px-5 py-3 font-medium text-black motion-safe:transition-transform hover:-translate-y-0.5 active:scale-95"
          >
            Start free
          </Link>
          <Link
            href="/pricing"
            className="rounded-xl border border-white/20 px-5 py-3 text-white/80 hover:text-white motion-safe:transition-transform hover:-translate-y-0.5 active:scale-95"
          >
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

      {/* 1. Trust Bar */}
      <Section id="trust">
        <div className="flex items-center justify-between gap-6 flex-wrap">
          <div className="text-white/70">Trusted by fast-growing teams</div>
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {["ClinicCo", "HomePro", "Northstar", "Mosaic", "Waypoint", "Acme Dental"].map((n) => (
              <Logo key={n} name={n} />
            ))}
          </div>
        </div>
      </Section>

      {/* 2. Value Snapshot */}
      <Section id="value" title="Results at a glance">
        <div className="grid gap-4 md:grid-cols-4">
          {[{
            value: "99.9%",
            label: "answered — missed calls captured",
          },{
            value: "<60s",
            label: "to booking — from hello to calendar",
          },{
            value: "+32%",
            label: "more appointments — versus baseline",
          },{
            value: "24/7",
            label: "coverage — after-hours included",
          }].map((s) => (
            <div key={s.value} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="text-3xl font-semibold">{s.value}</div>
              <div className="mt-2 text-white/70 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* 3. How it works */}
      <Section id="how" title="How it works">
        <ol className="grid gap-4 md:grid-cols-3 list-decimal pl-6">
          <li className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="font-medium">Connect your number</div>
            <p className="mt-2 text-sm text-white/70">Point Twilio/Plivo/Vonage to EarlyBird.</p>
          </li>
          <li className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="font-medium">Set rules and FAQs</div>
            <p className="mt-2 text-sm text-white/70">Hours, routing, services, guardrails.</p>
          </li>
          <li className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="font-medium">Go live</div>
            <p className="mt-2 text-sm text-white/70">We answer, qualify, route, and book.</p>
          </li>
        </ol>
      </Section>

      {/* 4. Live Demo CTA */}
      <Section id="demo">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
          <h3 className="text-xl font-semibold">Hear a live call</h3>
          <p className="mt-2 text-white/70">See a real transcript</p>
          <div className="mt-4 flex justify-center gap-3">
            <button
              className="rounded-xl bg-white px-5 py-3 font-medium text-black motion-safe:transition-transform hover:-translate-y-0.5 active:scale-95"
              aria-haspopup="dialog"
            >
              Hear a live call
            </button>
            <button
              className="rounded-xl border border-white/20 px-5 py-3 text-white/80 hover:text-white motion-safe:transition-transform hover:-translate-y-0.5 active:scale-95"
              aria-haspopup="dialog"
            >
              See a transcript
            </button>
          </div>
          <p className="mt-2 text-xs text-white/50">Sample audio coming soon.</p>
        </div>
      </Section>

      {/* 5. Integrations Preview */}
      <Section id="integrations" title="Works with your stack">
        <div className="grid gap-4 md:grid-cols-5">
          {["Google Calendar","Microsoft 365","Twilio","Plivo","Vonage","HubSpot","Salesforce","Stripe","Postmark","Zapier"].map((name) => (
            <div key={name} className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/80 motion-safe:transition-transform hover:-translate-y-0.5 active:scale-95">
              {name}
            </div>
          ))}
        </div>
      </Section>

      {/* 6. Outcomes & Proof + Backed by data */}
      <Section id="proof" title="Outcomes that matter">
        <div className="grid gap-8 md:grid-cols-2">
          <ul className="space-y-3">
            {[
              "+32% appointments — better capture",
              "<35s booking — faster handoffs",
              "24/7 coverage — no voicemails",
              "60–85% deflection — self-serve answers",
              "Clean billing — no surprises",
              "Owner visibility — calls, transcripts, analytics",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <span aria-hidden className="mt-1">✅</span>
                <span className="text-white/80">{t}</span>
              </li>
            ))}
          </ul>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h4 className="font-medium">Backed by data</h4>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li>60–85% deflection — FAQs reduce live load (industry)</li>
              <li>&lt;60s to booking — faster handoffs (internal timing)</li>
              <li>24/7 coverage — fewer lost leads (ops studies)</li>
              <li>+32% appointments — capture + scheduling (cohorts)</li>
              <li>Lower cost per booking — usage efficiency (billing)</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* 7. Social Proof */}
      <Section id="social" title="Loved by operators">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { q: "After-hours bookings up 28%.", a: "Operations Lead, Home services" },
            { q: "Answers sound on-brand.", a: "Practice Manager, Dental group" },
            { q: "Setup was fast and safe.", a: "CTO, Multi-location clinic" },
          ].map((s) => (
            <figure key={s.q} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <blockquote className="text-white/90">“{s.q}”</blockquote>
              <figcaption className="mt-2 text-sm text-white/60">— {s.a}</figcaption>
            </figure>
          ))}
        </div>
      </Section>

      {/* 8. Objections Strip (Accordions) */}
      <Section id="faqs" title="Common questions">
        <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/5">
          {[
            {q:"Will it sound human?", a:"Natural tone with barge-in; latency optimized for smooth flow."},
            {q:"Can we control voice?", a:"Guardrails, approved phrases, and brand style settings."},
            {q:"What about transfers?", a:"Warm transfers to on-call staff with context."},
            {q:"How’s scheduling handled?", a:"Direct Google/Microsoft Calendar sync with confirmations."},
            {q:"Is it secure?", a:"CSP nonces, hardening, HIPAA-aware posture; no PHI on public UI."},
            {q:"Billing clarity?", a:"Usage + clear monthly line items; no surprises."},
          ].map((item, idx) => (
            <details key={idx} className="px-6 py-4" role="group">
              <summary className="cursor-pointer list-none select-none flex items-center justify-between text-white/90">
                <span>{item.q}</span>
                <span aria-hidden className="text-white/50">+</span>
              </summary>
              <div className="mt-2 text-sm text-white/70">{item.a}</div>
            </details>
          ))}
        </div>
      </Section>

      {/* 9. Why EarlyBird vs Alternatives */}
      <Section id="compare" title="Why EarlyBird vs alternatives">
        <div className="overflow-x-auto">
          <div className="min-w-[640px] grid grid-cols-4 text-sm">
            <div className="text-white/50">&nbsp;</div>
            <div className="font-medium">EarlyBird</div>
            <div className="font-medium">Answering Service</div>
            <div className="font-medium">IVR/Voicemail</div>

            <div className="py-3 text-white/70">24/7 coverage</div>
            <div className="py-3">✓</div>
            <div className="py-3">✓</div>
            <div className="py-3">✕</div>

            <div className="py-3 text-white/70">Booking speed</div>
            <div className="py-3">&lt;60s</div>
            <div className="py-3">2–5 min</div>
            <div className="py-3">N/A</div>

            <div className="py-3 text-white/70">Brand voice</div>
            <div className="py-3">On-brand</div>
            <div className="py-3">Varies</div>
            <div className="py-3">Robotic</div>
          </div>
        </div>
      </Section>

      {/* 10. Final CTA */}
      <Section id="final-cta">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
          <h3 className="text-xl font-semibold">Ready to capture every call?</h3>
          <div className="mt-4 flex justify-center gap-3">
            <Link
              href="/signup"
              className="rounded-xl bg-white px-5 py-3 font-medium text-black motion-safe:transition-transform hover:-translate-y-0.5 active:scale-95"
            >
              Start free
            </Link>
            <Link
              href="/pricing"
              className="rounded-xl border border-white/20 px-5 py-3 text-white/80 hover:text-white motion-safe:transition-transform hover:-translate-y-0.5 active:scale-95"
            >
              See pricing
            </Link>
          </div>
        </div>
      </Section>
    </main>
  );
}
