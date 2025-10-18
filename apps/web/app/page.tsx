export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { Marquee } from '@/components/Marquee';
import { BoltIcon, CalendarIcon, CheckIcon, ClockIcon, ControlsIcon, CrmIcon, LockIcon, PhoneIcon, PlugIcon, SavingsIcon, VoiceIcon } from '@/components/icons';
import { resolveLogoSrc } from '@/lib/logoAssets';
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
  const resolved = resolveLogoSrc(id) ?? `/logos/${id}.svg`;
  return (
    <figure className="logo-badge h-10 w-32 overflow-hidden rounded-lg border border-white/10 bg-white px-3 py-1.5 flex items-center justify-center flex-shrink-0 motion-safe:transition-transform hover:-translate-y-0.5 active:scale-95">
      <img
        src={resolved}
        alt={label}
        className="block max-h-6 max-w-full object-contain"
        loading="lazy"
        decoding="async"
      />
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
          <Benefit icon={<ClockIcon />} title="Instant pickup" text="Answer every caller in under a second with a friendly, on-brand greeting." />
          <Benefit icon={<CalendarIcon />} title="Real scheduling" text="Book, reschedule, or cancel visits across Google and Microsoft calendars." />
          <Benefit icon={<CrmIcon />} title="Auto CRM notes" text="Summaries, next steps, and caller details sync to HubSpot, Salesforce, or Slack." />
          <Benefit icon={<SavingsIcon />} title="Lower staffing load" text="Deflect repetitive calls while routing buying signals to your team." />
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
          <Step icon={<PlugIcon />} title="Connect numbers & playbooks" text="Port or forward lines, import FAQs, and plug in calendars or CRMs." />
          <Step icon={<PhoneIcon />} title="EarlyBird handles every call" text="Brand-trained voice greets callers, qualifies intent, and adapts in real time." />
          <Step icon={<CheckIcon />} title="Route & review" text="Live-transfer hot leads, then review transcripts, recordings, and actions in your dashboard." />
        </div>
      </Section>

      {/* Testimonials */}
      <Section title="Trusted by operators">
        <TestimonialsCarousel
          items={[
            { q: '“EarlyBird books 35% more consults than our in-house CSRs.”', a: 'Jamie Q., Director of Ops — Midtown Smiles' },
            { q: '“Patients think it’s a real person. We ported two lines and went live in 48 hours.”', a: 'Priya K., Practice Manager — Nova PT' },
            { q: '“After-hours conversion doubled because every hot lead gets routed immediately.”', a: 'Caleb M., GM — Horizon Services' },
          ]}
          interval={6000}
        />
      </Section>

      {/* Feature highlights */}
      <Section title="Why EarlyBird">
        <div className="grid gap-4 md:grid-cols-4">
          <Feature icon={<VoiceIcon />} title="On-brand conversations" text="Train EarlyBird on your scripts, tone, and FAQs for natural dialogues." />
          <Feature icon={<BoltIcon />} title="Real-time actions" text="Interrupt, update context, and trigger workflows without putting callers on hold." />
          <Feature icon={<LockIcon />} title="Guardrails you trust" text="Consent prompts, encrypted storage, and PHI-safe transcripts keep ops compliant." />
          <Feature icon={<ControlsIcon />} title="Operator control center" text="Tune prompts, review analytics, and manage numbers from a single dashboard." />
        </div>
      </Section>

      {/* Security & Compliance */}
      <Section title="Security & Compliance">
        <div className="grid gap-4 md:grid-cols-3">
          <Feature icon={<LockIcon />} title="Healthcare-ready handling" text="Consent scripts, caller notices, and encrypted call artifacts ship by default." mutedClassName="text-white/80" />
          <Feature icon={<LockIcon />} title="Signed integrations" text="Webhook signatures cover telephony, billing, and CRM automations with full audit trails." mutedClassName="text-white/80" />
          <Feature icon={<LockIcon />} title="Least-privilege access" text="Role-based controls, scoped API keys, and expiring media links for every org." mutedClassName="text-white/80" />
        </div>
      </Section>

      {/* CTA */}
      <Section>
        <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-white/5 to-white/10 p-8 text-center">
          <h3 className="text-xl font-semibold">Go live in days with an AI receptionist your callers trust.</h3>
          <div className="mt-4 flex justify-center gap-3">
            <AuthModalTriggerButton mode="signup" className="btn btn-primary">
              Start free trial
            </AuthModalTriggerButton>
            <Link href="/signup" className="btn btn-outline">Book a live demo</Link>
          </div>
        </div>
      </Section>

      {/* Pricing teaser */}
      <Section title="Plans for every stage">
        <div className="grid gap-4 md:grid-cols-4">
          <Card><div className="font-medium">Starter</div><p className="mt-1 text-sm text-white/70">Launch on one line with 200 included minutes.</p></Card>
          <Card><div className="font-medium">Professional</div><p className="mt-1 text-sm text-white/70">Add multi-calendar routing, analytics, and live summaries.</p></Card>
          <Card><div className="font-medium">Growth</div><p className="mt-1 text-sm text-white/70">Live transfer, onboarding, and CRM automations for scale.</p></Card>
          <Card><div className="font-medium">Enterprise</div><p className="mt-1 text-sm text-white/70">Custom routing, SSO, and compliance reviews with SLAs.</p></Card>
        </div>
        <div className="mt-6">
          <Link href="/pricing" className="btn btn-outline">View detailed pricing</Link>
        </div>
      </Section>
    </main>
  );
}
