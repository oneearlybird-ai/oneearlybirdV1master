export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Marquee } from '@/components/Marquee';
import { BoltIcon, CalendarIcon, CheckIcon, ClockIcon, ControlsIcon, CrmIcon, LockIcon, PhoneIcon, PlugIcon, SavingsIcon, VoiceIcon } from '@/components/icons';

function Section({ id, title, children }: { id?: string; title?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      {title ? (
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-6">{title}</h2>
      ) : null}
      {children}
    </section>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 p-6 motion-safe:transition-transform hover:-translate-y-0.5 active:scale-95 eb-reveal ${className}`}>
      {children}
    </div>
  );
}

function Benefit({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <Card>
      <div className="text-amber-400" aria-hidden>{icon}</div>
      <div className="mt-3 font-medium">{title}</div>
      <p className="mt-1 text-sm text-white/70">{text}</p>
    </Card>
  );
}

function Step({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className="text-amber-400" aria-hidden>{icon}</div>
        <div className="font-medium">{title}</div>
      </div>
      <p className="mt-2 text-sm text-white/70">{text}</p>
    </Card>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className="text-amber-400" aria-hidden>{icon}</div>
        <div className="font-medium">{title}</div>
      </div>
      <p className="mt-2 text-sm text-white/70">{text}</p>
    </Card>
  );
}

function LogoBadge({ id, label }: { id: string; label: string }) {
  return (
    <figure className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 flex items-center justify-center text-sm text-white/60 hover:bg-white/10 hover:text-white motion-safe:transition-colors">
      <img src={`/logos/${id}.svg`} alt={label} className="h-6 w-auto opacity-80 hover:opacity-100 motion-safe:transition-opacity" />
      <figcaption className="sr-only">{label}</figcaption>
    </figure>
  );
}

export default function PreviewLanding() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white">
      {/* Hero (keep wording; style-only tweaks) */}
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
      </Section>

      {/* What EarlyBird AI Does */}
      <Section title="What EarlyBird AI does">
        <div className="grid gap-4 md:grid-cols-4">
          <Benefit icon={<ClockIcon />} title="24/7 Answering" text="Never miss a call — your AI receptionist is on duty 24/7." />
          <Benefit icon={<CalendarIcon />} title="Appointment Booking" text="Seamlessly schedule or cancel appointments in your calendar." />
          <Benefit icon={<CrmIcon />} title="CRM Integration" text="Automatically log calls and leads into your CRM." />
          <Benefit icon={<SavingsIcon />} title="Cost Savings" text="Save on staffing costs while increasing customer satisfaction." />
        </div>
      </Section>

      {/* Integrations Marquee (manual scroll for CSP safety) */}
      <Section id="integrations" title="Integrates with your tools">
        <div className="text-white/60 text-sm mb-3">Seamless integration with your workflow</div>
        <Marquee ariaLabel="Integrations logos" speedSec={16}>
          {[
            { id: 'salesforce', label: 'Salesforce' },
            { id: 'hubspot', label: 'HubSpot' },
            { id: 'zoho', label: 'Zoho' },
            { id: 'google-calendar', label: 'Google Calendar' },
            { id: 'microsoft-365', label: 'Microsoft 365' },
            { id: 'twilio', label: 'Twilio' },
            { id: 'signalwire', label: 'SignalWire' },
            { id: 'stripe', label: 'Stripe' },
            { id: 'slack', label: 'Slack' },
            { id: 'zapier', label: 'Zapier' },
            { id: 'aws', label: 'AWS' },
          ].map((it) => (
            <LogoBadge key={it.id} id={it.id} label={it.label} />
          ))}
        </Marquee>
      </Section>

      {/* How it works */}
      <Section id="how" title="How it works">
        <div className="grid gap-4 md:grid-cols-3">
          <Step icon={<PlugIcon />} title="Connect Your Systems" text="Sign up and connect your phone line, calendar, and CRM in minutes." />
          <Step icon={<PhoneIcon />} title="AI Answers Calls" text="Friendly, human‑like greeting, 24/7 — fast and natural responses." />
          <Step icon={<CheckIcon />} title="Scheduling & Follow‑up" text="Books appointments, answers FAQs, and logs details + transcripts in your CRM." />
        </div>
      </Section>

      {/* Social Proof / Testimonials */}
      <Section title="Trusted by operators">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { q: '“EarlyBird AI is like having a full‑time receptionist at a fraction of the cost.”', a: 'Alex R., Owner — ServicePro' },
            { q: '“Setup took minutes. Our calendar started filling the same week.”', a: 'Mia L., Practice Manager — Bright Dental' },
            { q: '“We capture after‑hours leads we used to miss — huge impact.”', a: 'Sam D., Ops Lead — Northstar Clinics' },
          ].map((t) => (
            <Card key={t.q}>
              <blockquote className="text-white/90">{t.q}</blockquote>
              <figcaption className="mt-2 text-sm text-white/60">{t.a}</figcaption>
            </Card>
          ))}
        </div>
      </Section>

      {/* Feature Highlights */}
      <Section title="Why EarlyBird">
        <div className="grid gap-4 md:grid-cols-4">
          <Feature icon={<VoiceIcon />} title="Human‑Like Voice" text="Natural, friendly voice agents callers can’t distinguish from a human." />
          <Feature icon={<BoltIcon />} title="Barge‑in & Real‑Time" text="Understands interruptions; fast responses without awkward pauses." />
          <Feature icon={<LockIcon />} title="Security & Privacy" text="Enterprise‑grade security; encrypted recordings and data handling." />
          <Feature icon={<ControlsIcon />} title="Easy Setup & Management" text="No code. Set up in minutes and monitor everything in one place." />
        </div>
      </Section>

      {/* CTA Banner */}
      <Section>
        <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-white/5 to-white/10 p-8 text-center">
          <h3 className="text-xl font-semibold">Never miss another call. Ready to get started?</h3>
          <div className="mt-4 flex justify-center gap-3">
            <Link href="/signup" className="rounded-xl bg-white px-5 py-3 font-medium text-black hover:bg-white/90">Start Free Trial</Link>
            <Link href="/signup" className="rounded-xl border border-white/20 px-5 py-3 text-white/80 hover:text-white">Book a Demo</Link>
          </div>
        </div>
      </Section>

      {/* Pricing Teaser */}
      <Section title="Plans for every stage">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <div className="font-medium">Basic</div>
            <p className="mt-1 text-sm text-white/70">For small businesses getting started.</p>
          </Card>
          <Card>
            <div className="font-medium">Pro</div>
            <p className="mt-1 text-sm text-white/70">For growing teams that want more.</p>
          </Card>
          <Card>
            <div className="font-medium">Elite</div>
            <p className="mt-1 text-sm text-white/70">High volume or multi‑location.</p>
          </Card>
          <Card>
            <div className="font-medium">Enterprise</div>
            <p className="mt-1 text-sm text-white/70">Custom solution — let’s talk.</p>
          </Card>
        </div>
        <div className="mt-6">
          <Link href="/pricing" className="inline-flex items-center rounded-xl border border-white/20 px-5 py-3 text-white/80 hover:text-white">
            View detailed pricing
          </Link>
        </div>
      </Section>
    </main>
  );
}
