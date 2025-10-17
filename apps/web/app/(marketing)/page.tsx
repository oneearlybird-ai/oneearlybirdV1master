export const dynamic = "force-dynamic";

import Link from "next/link";
import AuthModalTriggerButton from "@/components/auth/AuthModalTriggerButton";
import Section from "@/components/stellar/Section";
import { Marquee } from "@/components/Marquee";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import { BoltIcon, CalendarIcon, CheckIcon, ControlsIcon, CrmIcon, LockIcon, PhoneIcon, PlugIcon, SavingsIcon, VoiceIcon } from "@/components/icons";
import { resolveLogoSrc } from "@/lib/logoAssets";

const heroStats = [
  { value: "24/7", label: "Answering coverage", caption: "Never miss a call — we pick up on the first ring." },
  { value: "3 days", label: "Average time to go live", caption: "Pre-built playbooks, calendar sync, and onboarding assistance." },
  { value: "2.8×", label: "More booked appointments", caption: "Real-time scheduling with conflict checks and reminders." },
];

const featureCards = [
  {
    icon: <VoiceIcon />,
    title: "Human-like voice, no scripts",
    description: "Dynamic voice models that greet callers by name, adapt tone, and handle interruptions naturally.",
  },
  {
    icon: <CalendarIcon />,
    title: "Instant scheduling & rescheduling",
    description: "Two-way sync with Google and Microsoft 365 calendars, appointment reminders, and double booking protection.",
  },
  {
    icon: <CrmIcon />,
    title: "CRM + ticket sync",
    description: "Push leads, call summaries, and transcripts into HubSpot, Salesforce, or the tools you rely on.",
  },
  {
    icon: <SavingsIcon />,
    title: "Always-on ROI",
    description: "Operate with concierge-level coverage at a fraction of staffing costs—plus built-in analytics to prove it.",
  },
];

const workflowSteps = [
  {
    icon: <PlugIcon />,
    title: "Connect your stack",
    description: "Securely link your phone number, calendars, CRM, and knowledge base—no code required.",
  },
  {
    icon: <PhoneIcon />,
    title: "Train your receptionist",
    description: "Upload FAQs, set availability rules, and review sample conversations before you go live.",
  },
  {
    icon: <CheckIcon />,
    title: "Go live with confidence",
    description: "We monitor every call, capture transcripts, and surface alerts so you can fine-tune in real time.",
  },
];

const differentiation = [
  {
    icon: <BoltIcon />,
    title: "Real-time context switching",
    description: "EarlyBird handles interruptions, transfers warm leads, and hands off to humans without awkward pauses.",
  },
  {
    icon: <ControlsIcon />,
    title: "Operations-friendly controls",
    description: "Role-based access, business hour overrides, and granular call routing for each location.",
  },
  {
    icon: <LockIcon />,
    title: "Enterprise-grade security",
    description: "HSTS, CSP, signed webhooks, encrypted recordings, and audit trails baked in from day one.",
  },
];

const complianceHighlights = [
  {
    title: "No inline scripts or eval",
    description: "Marketing surfaces ship with nonce-based CSP and Trusted Types reporting—no security theatre.",
  },
  {
    title: "Cookie model stays untouched",
    description: "We rely on secure, httpOnly cookies across apex and mobile. No client-side token parsing—ever.",
  },
  {
    title: "Step-up ready when needed",
    description: "403 step_up_required seamlessly triggers our OTP flow without disrupting the original action.",
  },
];

const integrationLogos = [
  { id: "google-workspace", label: "Google Workspace" },
  { id: "google-calendar", label: "Google Calendar" },
  { id: "microsoft-365", label: "Microsoft 365" },
  { id: "outlook", label: "Outlook" },
  { id: "salesforce", label: "Salesforce" },
  { id: "hubspot", label: "HubSpot" },
  { id: "zoho", label: "Zoho" },
  { id: "twilio", label: "Twilio" },
  { id: "signalwire", label: "SignalWire" },
  { id: "stripe", label: "Stripe" },
  { id: "slack", label: "Slack" },
  { id: "aws", label: "AWS" },
  { id: "zapier", label: "Zapier" },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="stellar-hero px-5 pt-20 pb-24 sm:px-6 md:pt-28 md:pb-32">
        <div className="stellar-hero-content mx-auto flex w-full max-w-6xl flex-col gap-14 md:flex-row md:items-center md:gap-16">
          <div className="max-w-2xl">
            <span className="stellar-pill">AI receptionist that sounds human</span>
            <h1 className="mt-6 font-medium leading-tight text-4xl text-white md:text-5xl lg:text-6xl">
              Feel like you have a front-desk team on every line—without adding headcount.
            </h1>
            <p className="mt-6 text-lg text-white/70 md:text-xl">
              EarlyBird answers, qualifies, and books every inbound call with natural conversation. Keep your team focused on the work only humans
              can do while we manage scheduling, FAQs, and follow-up across web and mobile.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <AuthModalTriggerButton
                mode="signup"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-base font-semibold text-black shadow-[0_20px_60px_rgba(255,255,255,0.25)] transition hover:bg-white/90"
              >
                Start free trial
              </AuthModalTriggerButton>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-2xl border border-white/20 px-6 py-3 text-base font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
              >
                See pricing
              </Link>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {heroStats.map((stat) => (
                <div key={stat.label} className="stellar-grid-card bg-white/5">
                  <div className="text-2xl font-semibold text-white">{stat.value}</div>
                  <div className="mt-2 text-sm font-medium uppercase tracking-wide text-white/60">{stat.label}</div>
                  <p className="mt-3 text-sm text-white/70">{stat.caption}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative flex-1">
            <div className="relative mx-auto max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_30px_120px_rgba(59,130,246,0.35)]">
              <div className="flex items-center justify-between">
                <span className="stellar-badge bg-white/10 text-xs font-medium uppercase tracking-[0.12em] text-white/80">
                  Live call • Reception desk
                </span>
                <span className="text-sm font-medium text-emerald-300">Connected</span>
              </div>
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-white/10 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">Caller</div>
                  <p className="mt-2 text-sm text-white">
                    “Hi, I need to reschedule my consultation for next week. Anything available on Thursday afternoon?”
                  </p>
                </div>
                <div className="rounded-2xl bg-gradient-to-r from-white/15 to-white/5 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">EarlyBird</div>
                  <p className="mt-2 text-sm text-white">
                    “Happy to help. I can move you to Thursday at 3:30 PM with Dr. Patel. I&apos;ll send a confirmation email and text.”
                  </p>
                </div>
              </div>
              <div className="mt-6 rounded-2xl border border-white/10 bg-[#05050b]/60 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">Outcome</div>
                <div className="mt-2 flex items-center justify-between text-sm text-white/80">
                  <span>Consultation rescheduled</span>
                  <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-xs font-semibold text-emerald-200">Success</span>
                </div>
                <div className="mt-3 text-xs text-white/55">
                  CRM updated • Confirmation email & SMS sent • Call transcript stored in dashboard
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Section
        id="product"
        eyebrow="Platform overview"
        title="Every call becomes an opportunity, not an interrupt."
        description="Designed with operations leaders in mind: faster response times, tighter processes, and zero compromise on brand voice."
      >
        <div className="grid gap-6 md:grid-cols-2">
          {featureCards.map((card) => (
            <div key={card.title} className="stellar-grid-card">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white">
                {card.icon}
              </span>
              <h3 className="mt-6 text-lg font-semibold text-white">{card.title}</h3>
              <p className="mt-3 text-sm text-white/70">{card.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="how-it-works"
        eyebrow="How it works"
        title="Launch in days, not months."
        description="Our team guides you through onboarding, configures call flows, and pressure tests before the first customer ever dials in."
      >
        <div className="grid gap-6 md:grid-cols-3">
          {workflowSteps.map((step, idx) => (
            <div key={step.title} className="stellar-grid-card">
              <div className="stellar-badge text-xs font-semibold">{`Step ${idx + 1}`}</div>
              <span className="mt-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">{step.icon}</span>
              <h3 className="mt-5 text-lg font-semibold text-white">{step.title}</h3>
              <p className="mt-3 text-sm text-white/70">{step.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Integrations"
        title="Wired into the tools your team already uses."
        description="EarlyBird plugs into your comms, scheduling, CRM, and payments stack so nothing slips through the cracks."
        className="pt-0"
      >
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <Marquee ariaLabel="Integration logos" speedSec={20}>
            {integrationLogos.map((logo) => (
              <figure
                key={logo.id}
                className="mx-6 flex h-12 w-36 items-center justify-center rounded-2xl border border-white/10 bg-[#05050b]/70 px-4"
              >
                <img
                  src={resolveLogoSrc(logo.id) ?? `/logos/${logo.id}.svg`}
                  alt={logo.label}
                  className="max-h-7 max-w-[9rem] object-contain opacity-85"
                  loading="lazy"
                  decoding="async"
                />
                <figcaption className="sr-only">{logo.label}</figcaption>
              </figure>
            ))}
          </Marquee>
        </div>
      </Section>

      <Section
        eyebrow="Operational advantages"
        title="Built for teams who can’t afford missed calls."
        description="From after-hours coverage to multilingual greetings, EarlyBird feels like a teammate who never sleeps."
      >
        <div className="grid gap-6 md:grid-cols-3">
          {differentiation.map((item) => (
            <div key={item.title} className="stellar-grid-card">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">{item.icon}</span>
              <h3 className="mt-5 text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-sm text-white/70">{item.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Security & compliance"
        title="Security-first foundation—no surprise regressions."
        description="We carry forward every auth, cookie, and header invariant from the previous build while hardening marketing and auth surfaces."
      >
        <div className="grid gap-6 md:grid-cols-3">
          {complianceHighlights.map((item) => (
            <div key={item.title} className="stellar-grid-card">
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-sm text-white/70">{item.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Customer stories"
        title="Teams love handing the phone to EarlyBird."
        description="Underwriting firms, dental groups, and home services operators trust EarlyBird to represent their brand around the clock."
      >
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <TestimonialsCarousel
            items={[
              { q: "“EarlyBird feels like a teammate. Our no-show rate dropped 27% in the first month.”", a: "Mia L., Practice Manager — Bright Dental" },
              { q: "“We tried call centers and scripts. Nothing sounded this natural or booked this many meetings.”", a: "Sam D., Ops Lead — Northstar Clinics" },
              { q: "“After-hours leads now get scheduled automatically. The dashboard transcripts are gold.”", a: "Alex R., Owner — ServicePro" },
            ]}
            interval={6000}
          />
        </div>
      </Section>

      <section className="relative mx-auto w-full max-w-6xl px-5 pb-24 sm:px-6 md:pb-32">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-white/10 via-white/5 to-transparent p-10 text-center md:text-left">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.35),_transparent_55%)] opacity-80" />
          <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <span className="stellar-pill bg-white/15 text-white/85">Ready to launch?</span>
              <h2 className="mt-6 text-3xl font-semibold text-white md:text-4xl">
                Never miss another qualified call. Launch your AI receptionist this week.
              </h2>
              <p className="mt-4 text-base text-white/75">
                We’ll move your playbooks, verify auth flows, and stand up a preview environment before you flip traffic.
              </p>
            </div>
            <div className="flex flex-col gap-3 md:items-end">
              <AuthModalTriggerButton
                mode="signup"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-base font-semibold text-black transition hover:bg-white/90"
              >
                Start my free trial
              </AuthModalTriggerButton>
              <Link
                href="/preview"
                className="inline-flex items-center justify-center rounded-2xl border border-white/25 px-6 py-3 text-base font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
              >
                Watch a live preview
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
