'use client'

import { useMemo, useState } from "react";
import Link from "next/link";
import Section from "@/components/marketing/Section";
import Particles from "@/components/particles";
import AuthModalTriggerButton from "@/components/auth/AuthModalTriggerButton";
import {
  CalendarIcon,
  ClockIcon,
  ControlsIcon,
  CrmIcon,
  PhoneIcon,
  PlugIcon,
  VoiceIcon,
  CheckIcon,
} from "@/components/icons";

type Highlight = {
  title: string;
  copy: string;
  bullets: string[];
  icon: JSX.Element;
};

type CoverageMode = {
  id: string;
  label: string;
  summary: string;
  bullets: string[];
};

type Stage = {
  label: string;
  title: string;
  description: string;
};

const highlights: Highlight[] = [
  {
    title: "Agent control in seconds",
    copy:
      "Flip call forwarding on or off, swap voices, and tailor bilingual scripts without filing a ticket. Your live settings stay in sync across every number you manage.",
    bullets: [
      "Instant call routing toggle from the dashboard header",
      "Voice library with gender, tone, and language presets",
      "Workflow guardrails keep compliance and consent in place",
    ],
    icon: <PhoneIcon className="h-6 w-6 text-purple-300" />,
  },
  {
    title: "Calendar and CRM automation",
    copy:
      "Connect ServiceTitan, HubSpot, Salesforce, or your scheduling tool and let EarlyBird update appointments automatically. Every booking stays aligned with the calendars your teams already live in.",
    bullets: [
      "Two-way sync with Google and Microsoft 365 calendars",
      "Bookings, reschedules, and cancellations flow to your CRM",
      "Customer records enrich transcripts with context for follow-up",
    ],
    icon: <CalendarIcon className="h-6 w-6 text-purple-300" />,
  },
  {
    title: "Every conversation captured",
    copy:
      "Play recordings, scan transcripts, and share summaries from one timeline. Search by intent, tag, or outcome whenever you need the exact language a caller used.",
    bullets: [
      "Secure call recordings with downloadable share links",
      "Live transcripts and highlights for quick review",
      "Tags, outcomes, and notes stay tied to the customer profile",
    ],
    icon: <CrmIcon className="h-6 w-6 text-purple-300" />,
  },
];

const coverageModes: CoverageMode[] = [
  {
    id: "always-on",
    label: "24/7 coverage",
    summary:
      "Let your AI receptionist answer every call day or night. Intelligent escalations page the right humans when a voicemail would cost you revenue.",
    bullets: [
      "Primary and backup schedules across locations",
      "Escalation ladder for emergencies and VIP tags",
      "SMS or Slack alerts when a call needs human follow-up",
    ],
  },
  {
    id: "after-hours",
    label: "After hours assistant",
    summary:
      "Keep your team in control during the day and hand off to EarlyBird after closing. Open tasks appear in the dashboard before your staff arrives.",
    bullets: [
      "Custom cutover windows per weekday or holiday",
      "Automatic wrap-up summaries waiting at open",
      "Caller verification before booking or canceling appointments",
    ],
  },
  {
    id: "time-slots",
    label: "Custom coverage windows",
    summary:
      "Build bespoke coverage blocks around meetings, training sessions, or seasonal rushes. Toggle coverage with a single click as priorities change.",
    bullets: [
      "Drag-and-drop timeline for seasonal adjustments",
      "Syncs with staffing schedules so agents never overlap",
      "Saved presets for campaigns, pop-ups, or temporary locations",
    ],
  },
];

const stages: Stage[] = [
  {
    label: "01",
    title: "Configure in your own words",
    description:
      "Upload scripts, pricing, FAQ entries, and preferred dispositions. EarlyBird trains on your content so callers hear your brand voice from the first hello.",
  },
  {
    label: "02",
    title: "Connect the systems that matter",
    description:
      "Authorize calendars, CRMs, and ticketing tools in a few clicks. Each integration is sandboxed per tenant so data stays scoped to the right team.",
  },
  {
    label: "03",
    title: "Launch with live monitoring",
    description:
      "Watch calls appear in real time, review transcripts on the fly, and intervene instantly. No more blind handoffs or guessing what a caller asked for.",
  },
  {
    label: "04",
    title: "Optimize with usage insights",
    description:
      "Minutes, bookings, and conversion metrics update continuously. Billing, thresholds, and overage alerts keep finance and ops aligned.",
  },
];

const integrations = [
  "ServiceTitan",
  "HubSpot",
  "Salesforce",
  "Jobber",
  "Housecall Pro",
  "Zoho",
  "Google Workspace",
  "Microsoft 365",
  "Slack",
  "Zapier",
];

const insightCallouts = [
  {
    title: "Usage that stays predictable",
    copy: "View minutes consumed, upcoming renewals, and projected usage so there are no end-of-month surprises.",
    icon: <ClockIcon className="h-5 w-5 text-white/70" />,
  },
  {
    title: "Billing built for operators",
    copy: "Download invoices, update payment methods, and export detailed call logs in CSV or directly into your accounting system.",
    icon: <ControlsIcon className="h-5 w-5 text-white/70" />,
  },
  {
    title: "Team-based permissions",
    copy: "Assign roles for owners, managers, and agents so sensitive data only appears to the people who need it.",
    icon: <PlugIcon className="h-5 w-5 text-white/70" />,
  },
];

export function FeaturesPageContent() {
  const [activeMode, setActiveMode] = useState<string>(coverageModes[0]?.id ?? "");

  const selectedMode = useMemo(() => coverageModes.find((mode) => mode.id === activeMode) ?? coverageModes[0], [activeMode]);

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden px-5 pt-20 pb-16 sm:px-6 md:pt-28 md:pb-20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-purple-600/40 blur-[160px]" />
          <Particles className="absolute inset-0" quantity={10} staticity={40} />
        </div>
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center md:items-start md:text-left">
          <span className="stellar-pill">Features</span>
          <h1 className="mt-6 text-4xl font-semibold text-white md:text-5xl">Your AI receptionist runs from one operations HQ.</h1>
          <p className="mt-6 max-w-3xl text-base text-white/70 md:text-lg">
            EarlyBird bundles agent setup, call control, appointment automation, and analytics inside a single dashboard. Turn coverage on and off,
            watch every conversation unfold, and let your integrations handle the busywork.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <AuthModalTriggerButton
              mode="signup"
              className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-base font-semibold text-black transition hover:bg-white/90"
            >
              Launch your dashboard
            </AuthModalTriggerButton>
            <Link
              href="/preview"
              className="inline-flex items-center justify-center rounded-2xl border border-white/20 px-6 py-3 text-base font-semibold text-white/80 transition hover:border-white/35 hover:text-white"
            >
              Explore the live preview
            </Link>
          </div>
        </div>
      </section>

      <Section
        eyebrow="Command center"
        title="Everything you need to run your AI receptionist"
        description="One workspace controls routing, voices, calendars, and the context that keeps every caller feeling known."
        className="pt-0"
      >
        <div className="grid gap-6 lg:grid-cols-3">
          {highlights.map((item) => (
            <div key={item.title} className="stellar-grid-card h-full bg-white/5 p-6 transition hover:bg-white/[0.08] md:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">{item.icon}</span>
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              </div>
              <p className="mt-4 text-sm text-white/70">{item.copy}</p>
              <ul className="mt-6 space-y-2 text-sm text-white/60">
                {item.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-3">
                    <CheckIcon className="mt-0.5 h-4 w-4 text-purple-300" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Scheduling coverage"
        title="Choose exactly when EarlyBird answers the phone"
        description="Switch between presets or design custom windows while watching changes take effect in real time."
        className="pt-0"
      >
        <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="stellar-grid-card bg-white/5 p-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-2">
              {coverageModes.map((mode) => {
                const isActive = mode.id === selectedMode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setActiveMode(mode.id)}
                    onMouseEnter={() => setActiveMode(mode.id)}
                    className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                      isActive
                        ? "bg-white text-slate-900 shadow-lg shadow-purple-500/20"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {mode.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-4 text-xs text-white/50">
              Coverage updates apply instantly. Prefer to manual-test first? Stage changes in sandbox mode before promoting to production.
            </p>
          </div>
          <div className="stellar-grid-card bg-white/5 p-6 md:p-8">
            <h3 className="text-xl font-semibold text-white">{selectedMode.label}</h3>
            <p className="mt-3 text-sm text-white/70">{selectedMode.summary}</p>
            <ul className="mt-6 grid gap-3 text-sm text-white/60 sm:grid-cols-2">
              {selectedMode.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <CheckIcon className="mt-0.5 h-4 w-4 text-purple-300" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section
        eyebrow="Live operations"
        title="A guided flow from setup to optimization"
        description="We keep the path clear so you can configure, launch, and refine your AI receptionist without waiting on support tickets."
        className="pt-0"
      >
        <div className="relative">
          <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-b from-white/[0.04] via-transparent to-transparent blur-xl" />
          <div className="grid gap-6 md:grid-cols-2">
            {stages.map((stage) => (
              <div key={stage.label} className="stellar-grid-card h-full border border-white/10 bg-white/[0.04] p-6 md:p-8">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-sm font-semibold text-purple-100">
                  {stage.label}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-white">{stage.title}</h3>
                <p className="mt-3 text-sm text-white/70">{stage.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section
        eyebrow="Integrations"
        title="Plug EarlyBird into the tools your teams already trust"
        description="Appointment data, tickets, and revenue insights keep moving even when no one is at the front desk."
        className="pt-0"
      >
        <div className="stellar-grid-card bg-white/5 p-6 md:p-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {integrations.map((item) => (
              <div
                key={item}
                className="flex h-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-sm font-semibold text-white/70 transition hover:border-white/25 hover:text-white"
              >
                {item}
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/60 p-5">
            <div className="flex items-start gap-3">
              <VoiceIcon className="mt-1 h-5 w-5 text-purple-200" />
              <p className="text-sm text-white/70">
                Choose the workflows you want EarlyBird to perform inside each integration. Booking, canceling, updating a ticket, or tagging a customer
                are all permission based so nothing breaks the moment a process changes.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section
        eyebrow="Insights and billing"
        title="Transparency that keeps leadership aligned"
        description="Know how your agent is performing and what it costs without leaving the dashboard."
        className="pt-0"
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="stellar-grid-card bg-white/5 p-6 md:p-8">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6">
              <h3 className="text-lg font-semibold text-white">Real-time usage overview</h3>
              <p className="mt-3 text-sm text-white/70">
                Minutes, bookings, and qualified opportunities update live. Drill into any call, export reports, or share a filtered view with finance.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                  <p className="text-xs uppercase tracking-wide text-white/50">Minutes used</p>
                  <p className="mt-2 text-2xl font-semibold text-white">68%</p>
                  <p className="mt-2 text-xs text-white/50">Alert triggers when you near your plan threshold.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                  <p className="text-xs uppercase tracking-wide text-white/50">Appointments set</p>
                  <p className="mt-2 text-2xl font-semibold text-white">142</p>
                  <p className="mt-2 text-xs text-white/50">Break down by location, campaign, or agent tag.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                  <p className="text-xs uppercase tracking-wide text-white/50">Satisfaction score</p>
                  <p className="mt-2 text-2xl font-semibold text-white">97%</p>
                  <p className="mt-2 text-xs text-white/50">Caller surveys sync back to your CRM automatically.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="stellar-grid-card space-y-4 bg-white/5 p-6 md:p-8">
            {insightCallouts.map((callout) => (
              <div key={callout.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-start gap-3">
                  {callout.icon}
                  <div>
                    <h4 className="text-sm font-semibold text-white">{callout.title}</h4>
                    <p className="mt-2 text-xs text-white/60">{callout.copy}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section
        eyebrow="Get started"
        title="See the dashboard in action"
        description={
          <span>
            Spin up a trial, route a few calls, and explore the transcript archive before you commit. Our team will help connect your first integration
            and tune the agent for your brand.
          </span>
        }
        className="pt-0 pb-24"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <AuthModalTriggerButton
            mode="signup"
            className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-base font-semibold text-black transition hover:bg-white/90"
          >
            Start free trial
          </AuthModalTriggerButton>
          <Link
            href="mailto:hello@oneearlybird.ai"
            className="inline-flex items-center justify-center rounded-2xl border border-white/20 px-6 py-3 text-base font-semibold text-white/80 transition hover:border-white/35 hover:text-white"
          >
            Talk with an implementation specialist
          </Link>
        </div>
      </Section>
    </div>
  );
}
