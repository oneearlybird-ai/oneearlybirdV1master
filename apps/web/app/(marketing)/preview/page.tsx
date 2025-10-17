export const dynamic = "force-dynamic";

import Link from "next/link";
import AuthModalTriggerButton from "@/components/auth/AuthModalTriggerButton";
import Section from "@/components/stellar/Section";
import { Marquee } from "@/components/Marquee";
import { resolveLogoSrc } from "@/lib/logoAssets";
import { BoltIcon, CalendarIcon, ControlsIcon, CrmIcon, LockIcon, PhoneIcon, VoiceIcon } from "@/components/icons";

const demoHighlights = [
  {
    title: "Live conversation intelligence",
    description:
      "Follow a full booking call end-to-end: interruptions, rescheduling, and confirmations are all handled in real time.",
  },
  {
    title: "Owner cockpit",
    description:
      "The dashboard shows transcripts, sentiment, and next best actions. Share recordings or dive into analytics instantly.",
  },
  {
    title: "Mobile parity",
    description:
      "Switch to the mobile shell to see how managers review calls, approve changes, and trigger OTP step-up from their phone.",
  },
];

const workflowSteps = [
  {
    icon: <PhoneIcon />,
    title: "Qualify & greet",
    body: "Callers hear your brand voice. EarlyBird greets them, gathers intent, and triages urgent issues automatically.",
  },
  {
    icon: <CalendarIcon />,
    title: "Schedule & confirm",
    body: "Two-way calendar sync with Google and Microsoft 365, plus SMS/email confirmations for every booked appointment.",
  },
  {
    icon: <CrmIcon />,
    title: "Sync to your tools",
    body: "Push transcripts, notes, and outcomes into the CRM of your choice. No copy/paste or manual recounting.",
  },
];

const featureCallouts = [
  {
    icon: <VoiceIcon />,
    title: "Human-quality voice",
    description: "Multiple tones, interruption handling, and contextual memory keep every call on brand.",
  },
  {
    icon: <BoltIcon />,
    title: "Realtime transfers",
    description: "Escalate warm leads to your sales or service line while EarlyBird keeps the caller engaged.",
  },
  {
    icon: <ControlsIcon />,
    title: "Ops guardrails",
    description: "Safe defaults for after-hours, holidays, and OTP-protected actions. No accidental changes.",
  },
  {
    icon: <LockIcon />,
    title: "Security-first",
    description: "Cookie auth, strict CSP, HSTS, Trusted Types — the demo runs with the exact same contracts as production.",
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
  { id: "stripe", label: "Stripe" },
  { id: "slack", label: "Slack" },
  { id: "zapier", label: "Zapier" },
];

function IntegrationBadge({ id, label }: { id: string; label: string }) {
  return (
    <figure className="mx-6 flex h-12 w-36 items-center justify-center rounded-2xl border border-white/10 bg-[#05050b]/80 px-4">
      <img
        src={resolveLogoSrc(id) ?? `/logos/${id}.svg`}
        alt={label}
        className="max-h-7 max-w-[8.5rem] object-contain opacity-85"
        loading="lazy"
        decoding="async"
      />
      <figcaption className="sr-only">{label}</figcaption>
    </figure>
  );
}

export default function PreviewPage() {
  return (
    <div className="flex flex-col">
      <section className="relative px-5 pt-20 pb-16 sm:px-6 md:pt-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.35),_transparent_65%)]" />
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 lg:flex-row lg:items-center lg:gap-16">
          <div className="max-w-xl">
            <span className="stellar-pill">Interactive preview</span>
            <h1 className="mt-6 text-4xl font-semibold text-white md:text-5xl lg:text-6xl">
              Watch EarlyBird handle a real booking call from start to finish.
            </h1>
            <p className="mt-6 text-base text-white/70 md:text-lg">
              Dive into the live demo environment — hear the AI receptionist greet callers, reschedule appointments, transfer hot leads,
              and sync data back into your stack. No staged scripts, no animation tricks.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <AuthModalTriggerButton
                mode="signup"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-base font-semibold text-black transition hover:bg-white/90"
              >
                Launch demo
              </AuthModalTriggerButton>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-2xl border border-white/25 px-6 py-3 text-base font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
              >
                Explore pricing
              </Link>
            </div>
          </div>
          <div className="relative w-full max-w-md">
            <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-white/5 p-6 shadow-[0_30px_120px_rgba(59,130,246,0.35)]">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Call timeline</div>
              <div className="mt-4 space-y-4 text-sm">
                <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">Caller</div>
                  <p className="mt-2 text-white">
                    “Hi — can we move my consultation to Thursday afternoon? I&apos;ll be traveling Tuesday.”
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-white/20 to-white/5 p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">EarlyBird</div>
                  <p className="mt-2 text-white">
                    “Absolutely. I have openings at 3:10 PM and 3:40 PM on Thursday. Which works best for you?”
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#05050b]/70 p-4">
                  <div className="flex items-center justify-between text-sm text-white/70">
                    <span>Booking locked in • confirmation sent</span>
                    <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-xs font-semibold text-emerald-200">Success</span>
                  </div>
                  <p className="mt-3 text-xs text-white/60">
                    CRM updated · transcript stored · agent notified · HMAC webhooks delivered
                  </p>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between text-xs text-white/50">
                <span>Demo stack • cookie-auth only • SameSite=Lax</span>
                <span className="rounded-full border border-white/15 px-2 py-0.5">Live</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Section
        eyebrow="Preview tour"
        title="Inside the demo environment"
        description="This isn’t a marketing reel — you can click through the exact flows operators use every day."
      >
        <div className="grid gap-6 md:grid-cols-3">
          {demoHighlights.map((item) => (
            <div key={item.title} className="stellar-grid-card bg-white/5">
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-sm text-white/70">{item.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Call flow"
        title="See how EarlyBird runs a conversation"
        description="From greeting to wrap-up, every step is observable in the preview — including OTP step-up, billing fetches, and dashboard refresh events."
      >
        <div className="grid gap-6 md:grid-cols-3">
          {workflowSteps.map((step) => (
            <div key={step.title} className="stellar-grid-card">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">{step.icon}</span>
              <h3 className="mt-5 text-lg font-semibold text-white">{step.title}</h3>
              <p className="mt-3 text-sm text-white/70">{step.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Integrations"
        title="All your systems stay in sync"
        description="The demo shows call outcomes updating your CRM, calendar, and analytics stack in seconds."
        className="pt-0"
      >
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <Marquee ariaLabel="Integrations carousel" speedSec={18}>
            {integrationLogos.map((logo) => (
              <IntegrationBadge key={logo.id} id={logo.id} label={logo.label} />
            ))}
          </Marquee>
        </div>
      </Section>

      <Section
        eyebrow="Why teams choose the preview"
        title="Experience the exact product you’ll deploy"
        description="No hidden feature flags. The Stellar release uses the same auth/session posture, cookie model, and analytics pipeline as production."
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {featureCallouts.map((item) => (
            <div key={item.title} className="stellar-grid-card">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">{item.icon}</span>
              <h3 className="mt-5 text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-sm text-white/70">{item.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Next steps"
        title="Ready to go live after the preview?"
        description="Spin up a project and invite your team. The onboarding wizard, OTP step-up, and billing portal are ready the moment you convert."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div className="stellar-grid-card bg-white/5">
            <h3 className="text-lg font-semibold text-white">Start free</h3>
            <p className="mt-3 text-sm text-white/70">
              Launch with 100 trial minutes. Cookie-auth keeps everything secure; no need to manage tokens from the frontend.
            </p>
            <AuthModalTriggerButton
              mode="signup"
              className="mt-6 inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              Create account
            </AuthModalTriggerButton>
          </div>
          <div className="stellar-grid-card bg-white/5">
            <h3 className="text-lg font-semibold text-white">Talk with us</h3>
            <p className="mt-3 text-sm text-white/70">
              Need to cover compliance or migration details? We’ll walk through CSP, HSTS, headers, and dashboard guardrails with your team.
            </p>
            <Link
              href="mailto:hello@oneearlybird.ai"
              className="mt-6 inline-flex items-center justify-center rounded-2xl border border-white/25 px-5 py-3 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
            >
              hello@oneearlybird.ai
            </Link>
          </div>
        </div>
      </Section>
    </div>
  );
}
