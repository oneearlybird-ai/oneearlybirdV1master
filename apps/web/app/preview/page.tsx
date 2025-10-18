export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Marquee } from '@/components/Marquee';
import AuthModalTriggerButton from '@/components/auth/AuthModalTriggerButton';
import { BoltIcon, CalendarIcon, CheckIcon, ClockIcon, ControlsIcon, CrmIcon, LockIcon, PhoneIcon, PlugIcon, SavingsIcon, VoiceIcon } from '@/components/icons';
import { resolveLogoSrc } from '@/lib/logoAssets';

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
  // Brand backgrounds — use the brand’s typical presentation background.
  // Most integrations present on white; Google explicitly on white.
  const brandBg: Record<string, string> = {
    'google-workspace': '#ffffff',
    'microsoft-365': '#ffffff',
    'outlook': '#ffffff',
    'salesforce': '#ffffff',
    'hubspot': '#ffffff',
    'zoho': '#ffffff',
    'twilio': '#ffffff',
    'stripe': '#ffffff',
    'slack': '#ffffff',
    'zapier': '#ffffff',
  };
  const bg = brandBg[id] ?? '#ffffff';
  return (
    <figure
      className="h-10 w-32 overflow-hidden rounded-lg border border-white/10 px-3 flex items-center justify-center motion-safe:transition-transform hover:-translate-y-0.5 active:scale-95"
      style={{ backgroundColor: bg }}
    >
      <img
        src={resolveLogoSrc(id) ?? `/logos/${id}.svg`}
        alt={label}
        className="block max-h-6 max-w-full object-contain"
      />
      <figcaption className="sr-only">{label}</figcaption>
    </figure>
  );
}

export default function PreviewLanding() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white">
      {/* Hero (keep wording; style-only tweaks) */}
      <Section>
        <div className="relative">
          {/* Subtle animated waveform background */}
          <div className="absolute inset-0 -z-10 eb-hero-wave pointer-events-none">
            <svg viewBox="0 0 1200 400" className="h-[420px] w-full" aria-hidden>
              <defs>
                <linearGradient id="ebWaveGrad" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                  <stop offset="50%" stopColor="rgba(255,255,255,0.25)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </linearGradient>
              </defs>
              <path className="eb-wave-path" stroke="url(#ebWaveGrad)" strokeWidth="2" fill="none"
                d="M0,240 C120,180 240,300 360,240 C480,180 600,300 720,240 C840,180 960,300 1080,240 C1140,210 1200,240 1200,240"/>
            </svg>
          </div>
        </div>
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
          <AuthModalTriggerButton
            mode="signup"
            className="rounded-xl bg-white px-5 py-3 font-medium text-black motion-safe:transition-transform hover:-translate-y-0.5 active:scale-95"
          >
            Start free
          </AuthModalTriggerButton>
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
          <Benefit icon={<ClockIcon />} title="Instant pickup" text="Answer every caller in under a second with a friendly, on-brand greeting." />
          <Benefit icon={<CalendarIcon />} title="Real scheduling" text="Book, reschedule, or cancel visits across Google and Microsoft calendars." />
          <Benefit icon={<CrmIcon />} title="Auto CRM notes" text="Summaries, next steps, and caller details sync to HubSpot, Salesforce, or Slack." />
          <Benefit icon={<SavingsIcon />} title="Lower staffing load" text="Deflect repetitive calls while routing buying signals to your team." />
        </div>
      </Section>

      {/* Integrations Marquee (manual scroll for CSP safety) */}
      <Section id="integrations" title="Integrates with your tools">
        <div className="text-white/60 text-sm mb-3">Seamless integration with your workflow</div>
        <Marquee ariaLabel="Integrations logos" speedSec={16}>
          {[
            { id: 'google-workspace', label: 'Google Workspace' },
            { id: 'microsoft-365', label: 'Microsoft 365' },
            { id: 'outlook', label: 'Outlook' },
            { id: 'salesforce', label: 'Salesforce' },
            { id: 'hubspot', label: 'HubSpot' },
            { id: 'zoho', label: 'Zoho' },
            { id: 'twilio', label: 'Twilio' },
            { id: 'stripe', label: 'Stripe' },
            { id: 'slack', label: 'Slack' },
            { id: 'zapier', label: 'Zapier' },
          ].map((it) => (
            <LogoBadge key={it.id} id={it.id} label={it.label} />
          ))}
        </Marquee>
      </Section>

      {/* How it works */}
      <Section id="how" title="How it works">
        <div className="grid gap-4 md:grid-cols-3">
          <Step icon={<PlugIcon />} title="Connect numbers & playbooks" text="Port or forward lines, import FAQs, and plug in calendars or CRMs." />
          <Step icon={<PhoneIcon />} title="EarlyBird handles every call" text="Brand-trained voice greets callers, qualifies intent, and adapts in real time." />
          <Step icon={<CheckIcon />} title="Route & review" text="Live-transfer hot leads, then review transcripts, recordings, and actions in your dashboard." />
        </div>
      </Section>

      {/* Social Proof / Testimonials */}
      <Section title="Trusted by operators">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { q: '“EarlyBird books 35% more consults than our in-house CSRs.”', a: 'Jamie Q., Director of Ops — Midtown Smiles' },
            { q: '“Patients think it’s a real person. We ported two lines and went live in 48 hours.”', a: 'Priya K., Practice Manager — Nova PT' },
            { q: '“After-hours conversion doubled because every hot lead gets routed immediately.”', a: 'Caleb M., GM — Horizon Services' },
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
          <Feature icon={<VoiceIcon />} title="On-brand conversations" text="Train EarlyBird on your scripts, tone, and FAQs for natural dialogues." />
          <Feature icon={<BoltIcon />} title="Real-time actions" text="Interrupt, update context, and trigger workflows without putting callers on hold." />
          <Feature icon={<LockIcon />} title="Guardrails you trust" text="Consent prompts, encrypted storage, and PHI-safe transcripts keep ops compliant." />
          <Feature icon={<ControlsIcon />} title="Operator control center" text="Tune prompts, review analytics, and manage numbers from a single dashboard." />
        </div>
      </Section>

      {/* CTA Banner */}
      <Section>
        <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-white/5 to-white/10 p-8 text-center">
          <h3 className="text-xl font-semibold">Go live in days with an AI receptionist your callers trust.</h3>
          <div className="mt-4 flex justify-center gap-3">
            <AuthModalTriggerButton mode="signup" className="rounded-xl bg-white px-5 py-3 font-medium text-black hover:bg-white/90">
              Start free trial
            </AuthModalTriggerButton>
            <Link href="/signup" className="rounded-xl border border-white/20 px-5 py-3 text-white/80 hover:text-white">Book a live demo</Link>
          </div>
        </div>
      </Section>

      {/* Pricing Teaser */}
      <Section title="Plans for every stage">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <div className="font-medium">Starter</div>
            <p className="mt-1 text-sm text-white/70">Launch on one line with 200 included minutes.</p>
          </Card>
          <Card>
            <div className="font-medium">Professional</div>
            <p className="mt-1 text-sm text-white/70">Add multi-calendar routing, analytics, and live summaries.</p>
          </Card>
          <Card>
            <div className="font-medium">Growth</div>
            <p className="mt-1 text-sm text-white/70">Live transfer, onboarding, and CRM automations for scale.</p>
          </Card>
          <Card>
            <div className="font-medium">Enterprise</div>
            <p className="mt-1 text-sm text-white/70">Custom routing, SSO, and compliance reviews with SLAs.</p>
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
