export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { Marquee } from '@/components/Marquee';
import { BoltIcon, CalendarIcon, CheckIcon, ClockIcon, ControlsIcon, CrmIcon, LockIcon, PhoneIcon, PlugIcon, SavingsIcon, VoiceIcon } from '@/components/icons';
import TestimonialsCarousel from '@/components/TestimonialsCarousel';
import AuthModalTriggerButton from '@/components/auth/AuthModalTriggerButton';

function Section({ id, title, children }: { id?: string; title?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-14 md:py-24">
      {title ? (<h2 className="text-2xl md:3xl font-semibold tracking-tight mb-6">{title}</h2>) : null}
      {children}
    </section>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 p-6 eb-surface motion-safe:transition-all hover:-translate-y-0.5 active:scale-95 eb-reveal ${className}`}>
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

function Feature({ icon, title, text, mutedClassName }: { icon: React.ReactNode; title: string; text: string; mutedClassName?: string }) {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className="text-amber-400" aria-hidden>{icon}</div>
        <div className="font-medium">{title}</div>
      </div>
      <p className={`mt-2 text-sm ${mutedClassName || 'text-white/70'}`}>{text}</p>
    </Card>
  );
}

function LogoBadge({ id, label }: { id: string; label: string }) {
  const colored = new Set(['google-workspace','google-calendar','aws']);
  const masked = new Set(['hubspot','salesforce','zoho','twilio','slack','stripe','signalwire','outlook','microsoft-365','zapier']);
  return (
    <figure className="logo-badge h-10 w-32 overflow-hidden rounded-lg border border-white/10 bg-white px-3 py-1.5 flex items-center justify-center flex-shrink-0 motion-safe:transition-transform hover:-translate-y-0.5 active:scale-95">
      {colored.has(id) ? (
        <img src={`/logos/${id}.svg`} alt={label} className="block max-h-6 max-w-full object-contain" />
      ) : masked.has(id) ? (
        <span className={`logo-mask logo-${id}`} aria-label={label} />
      ) : (
        <img src={`/logos/${id}.svg`} alt={label} className="block max-h-6 max-w-full object-contain" />
      )}
      <figcaption className="sr-only">{label}</figcaption>
    </figure>
  );
}

export default function Home() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white">
      {/* Hero with wave background and timed word fade-in */}
      <Section>
        <div className="relative">
          <div className="absolute inset-0 -z-10 eb-hero-wave pointer-events-none">
            <svg viewBox="0 0 1200 400" className="h-[420px] w-full" aria-hidden>
              <defs>
                <linearGradient id="ebWaveGrad" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                  <stop offset="50%" stopColor="rgba(255,255,255,0.25)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </linearGradient>
              </defs>
              <path className="eb-wave-path" stroke="url(#ebWaveGrad)" strokeWidth="2" fill="none" d="M0,240 C120,180 240,300 360,240 C480,180 600,300 720,240 C840,180 960,300 1080,240 C1140,210 1200,240 1200,240"/>
            </svg>
          </div>
        </div>
        {/* Updated hero copy for unified branding */}
        <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
          AI receptionist that feels personal, designed for your business.
        </h1>
        <p className="mt-6 max-w-xl sm:max-w-2xl text-white/70">
          EarlyBird answers every inbound call with a natural voice that represents your brand, handles FAQs, books meetings across Google or
          Microsoft calendars, and routes hot leads to your team. Review transcripts, recordings, and analytics from web or mobile.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <AuthModalTriggerButton
            mode="signup"
            className="rounded-xl bg-white px-5 py-3 font-medium text-black motion-safe:transition-transform hover:-translate-y-0.5 active:scale-95"
          >
            Start free
          </AuthModalTriggerButton>
          <Link href="/pricing" className="rounded-xl border border-white/20 px-5 py-3 text-white/80 hover:text-white motion-safe:transition-transform hover:-translate-y-0.5 active:scale-95">See pricing</Link>
        </div>
      </Section>

      {/* Benefits */}
      <Section title="What EarlyBird AI does">
        <div className="grid gap-4 md:grid-cols-4">
          <Benefit icon={<ClockIcon />} title="24/7 Answering" text="Never miss a call — your AI receptionist is on duty 24/7." />
          <Benefit icon={<CalendarIcon />} title="Appointment Booking" text="Seamlessly schedule or cancel appointments in your calendar." />
          <Benefit icon={<CrmIcon />} title="CRM Integration" text="Automatically log calls and leads into your CRM." />
          <Benefit icon={<SavingsIcon />} title="Cost Savings" text="Save on staffing costs while increasing customer satisfaction." />
        </div>
      </Section>

      {/* Integrations marquee */}
      <Section id="integrations" title="Integrates with your tools">
        <div className="text-white/60 text-sm mb-2 sm:mb-3">Seamless integration with your workflow</div>
        <Marquee ariaLabel="Integrations logos" speedSec={16}>
          {[
            { id: 'google-workspace', label: 'Google Workspace' },
            { id: 'google-calendar', label: 'Google Calendar' },
            { id: 'microsoft-365', label: 'Microsoft 365' },
            { id: 'outlook', label: 'Outlook' },
            { id: 'salesforce', label: 'Salesforce' },
            { id: 'hubspot', label: 'HubSpot' },
            { id: 'zoho', label: 'Zoho' },
            { id: 'twilio', label: 'Twilio' },
            { id: 'signalwire', label: 'SignalWire' },
            { id: 'stripe', label: 'Stripe' },
            { id: 'slack', label: 'Slack' },
            { id: 'aws', label: 'AWS' },
            { id: 'zapier', label: 'Zapier' },
          ].map((it) => (
            <LogoBadge key={it.id} id={it.id} label={it.label} />
          ))}
        </Marquee>
      </Section>

      {/* How it works */}
      <Section id="how" title="How it works">
        <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
          <Step icon={<PlugIcon />} title="Connect Your Systems" text="Sign up and connect your phone line, calendar, and CRM in minutes." />
          <Step icon={<PhoneIcon />} title="AI Answers Calls" text="Friendly, human‑like greeting, 24/7 — fast and natural responses." />
          <Step icon={<CheckIcon />} title="Scheduling & Follow‑up" text="Books appointments, answers FAQs, and logs details + transcripts in your CRM." />
        </div>
      </Section>

      {/* Testimonials */}
      <Section title="Trusted by operators">
        <TestimonialsCarousel
          items={[
            { q: '“EarlyBird AI is like having a full‑time receptionist at a fraction of the cost.”', a: 'Alex R., Owner — ServicePro' },
            { q: '“Setup took minutes. Our calendar started filling the same week.”', a: 'Mia L., Practice Manager — Bright Dental' },
            { q: '“We capture after‑hours leads we used to miss — huge impact.”', a: 'Sam D., Ops Lead — Northstar Clinics' },
          ]}
          interval={6000}
        />
      </Section>

      {/* Feature highlights */}
      <Section title="Why EarlyBird">
        <div className="grid gap-4 md:grid-cols-4">
          <Feature icon={<VoiceIcon />} title="Human‑Like Voice" text="Natural, friendly voice agents callers can’t distinguish from a human." />
          <Feature icon={<BoltIcon />} title="Barge‑in & Real‑Time" text="Understands interruptions; fast responses without awkward pauses." />
          <Feature icon={<LockIcon />} title="Security & Privacy" text="Enterprise‑grade security; encrypted recordings and data handling." />
          <Feature icon={<ControlsIcon />} title="Easy Setup & Management" text="No code. Set up in minutes and monitor everything in one place." />
        </div>
      </Section>

      {/* Security & Compliance */}
      <Section title="Security & Compliance">
        <div className="grid gap-4 md:grid-cols-3">
          <Feature icon={<LockIcon />} title="Strict CSP & HSTS" text="Per‑request nonces, no inline/eval; HTTPS enforced with preload." mutedClassName="text-white/80" />
          <Feature icon={<LockIcon />} title="Signed Webhooks" text="Twilio/Stripe/ElevenLabs events validated with HMAC; no PHI in logs." mutedClassName="text-white/80" />
          <Feature icon={<LockIcon />} title="Least Privilege" text="Short‑lived presigned URLs; rate limits and deny‑by‑default routes." mutedClassName="text-white/80" />
        </div>
      </Section>

      {/* CTA */}
      <Section>
        <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-white/5 to-white/10 p-8 text-center">
          <h3 className="text-xl font-semibold">Never miss another call. Ready to get started?</h3>
          <div className="mt-4 flex justify-center gap-3">
            <AuthModalTriggerButton mode="signup" className="btn btn-primary">
              Start Free Trial
            </AuthModalTriggerButton>
            <Link href="/signup" className="btn btn-outline">Book a Demo</Link>
          </div>
        </div>
      </Section>

      {/* Pricing teaser */}
      <Section title="Plans for every stage">
        <div className="grid gap-4 md:grid-cols-4">
          <Card><div className="font-medium">Basic</div><p className="mt-1 text-sm text-white/70">For small businesses getting started.</p></Card>
        	<Card><div className="font-medium">Pro</div><p className="mt-1 text-sm text-white/70">For growing teams that want more.</p></Card>
        	<Card><div className="font-medium">Elite</div><p className="mt-1 text-sm text-white/70">High volume or multi‑location.</p></Card>
        	<Card><div className="font-medium">Enterprise</div><p className="mt-1 text-sm text-white/70">Custom solution — let’s talk.</p></Card>
        </div>
        <div className="mt-6">
          <Link href="/pricing" className="btn btn-outline">View detailed pricing</Link>
        </div>
      </Section>
    </main>
  );
}
