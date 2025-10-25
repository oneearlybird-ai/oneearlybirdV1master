'use client'

import { type ReactNode, useMemo, useState } from "react";
import Section from "@/components/marketing/Section";
import Particles from "@/components/particles";
import AuthModalTriggerButton from "@/components/auth/AuthModalTriggerButton";
import RevealOnScroll from "@/components/RevealOnScroll";
import IntegrationsCarousel from "@/components/integrations-carousel";
import {
  CalendarIcon,
  ClockIcon,
  ControlsIcon,
  CrmIcon,
  PhoneIcon,
  PlugIcon,
  CheckIcon,
} from "@/components/icons";

type Highlight = {
  title: string;
  copy: string;
  bullets: string[];
  icon: ReactNode;
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
    copy: "Flip the switch on routing, voices, and escalation without waiting for support tickets.",
    bullets: [
      "Instant routing toggles with built-in guardrails",
      "Voice presets for tone, language, and brand nuance",
    ],
    icon: <PhoneIcon className="h-6 w-6 text-purple-300" />,
  },
  {
    title: "Calendar & CRM automation",
    copy: "Bookings, reschedules, and notes flow into the systems your teams already trust.",
    bullets: ["Two-way calendar sync", "HubSpot, Salesforce, ServiceTitan, and more"],
    icon: <CalendarIcon className="h-6 w-6 text-purple-300" />,
  },
  {
    title: "Every conversation captured",
    copy: "Searchable transcripts, highlights, and share links keep everyone aligned in minutes.",
    bullets: ["Live summaries for handoffs", "Secure recordings with smart tags"],
    icon: <CrmIcon className="h-6 w-6 text-purple-300" />,
  },
];

const coverageModes: CoverageMode[] = [
  {
    id: "always-on",
    label: "24/7 coverage",
    summary:
      "Let EarlyBird answer every call day or night, escalating humans only when revenue is on the line.",
    bullets: ["Hands-off routing between locations", "Slack or SMS nudges for urgent callers"],
  },
  {
    id: "after-hours",
    label: "After hours assistant",
    summary:
      "Keep your daytime crew in the driver’s seat and hand off to EarlyBird once doors close.",
    bullets: ["Smart cutover windows by day or holiday", "Open with summaries waiting for your team"],
  },
  {
    id: "time-slots",
    label: "Custom coverage windows",
    summary:
      "Drag coverage blocks around training, meetings, or seasonal spikes and save them as presets.",
    bullets: ["Timeline editor with preset templates", "Syncs with staffing calendars automatically"],
  },
];

const stages: Stage[] = [
  {
    label: "01",
    title: "Configure in plain language",
    description: "Upload scripts, pricing, and FAQs. EarlyBird learns your tone from the first hello.",
  },
  {
    label: "02",
    title: "Connect the tools that matter",
    description: "Authorize calendars, CRMs, and ticketing tools with secure, per-tenant scopes.",
  },
  {
    label: "03",
    title: "Launch with live monitoring",
    description: "Watch calls appear in real time and jump in instantly when a human touch is needed.",
  },
  {
    label: "04",
    title: "Optimize with clear insights",
    description: "Minutes, bookings, and alerts update continuously so finance and ops stay aligned.",
  },
];

const insightCallouts = [
  {
    title: "Usage that stays predictable",
    copy: "Minutes, bookings, and headroom stay visible so renewals never surprise finance.",
    icon: <ClockIcon className="h-5 w-5 text-white/70" />,
  },
  {
    title: "Billing built for operators",
    copy: "Download invoices, update payment methods, and export logs directly into your accounting system.",
    icon: <ControlsIcon className="h-5 w-5 text-white/70" />,
  },
  {
    title: "Team-based permissions",
    copy: "Assign roles for owners, managers, and agents so sensitive data stays scoped.",
    icon: <PlugIcon className="h-5 w-5 text-white/70" />,
  },
];

export function FeaturesPageContent() {
  const [activeMode, setActiveMode] = useState<string>(coverageModes[0]?.id ?? "");

  const selectedMode = useMemo(() => coverageModes.find((mode) => mode.id === activeMode) ?? coverageModes[0], [activeMode]);

  return (
    <div className="relative flex flex-col">
      <div className="pointer-events-none absolute inset-0 -z-20">
        <div className="absolute left-[-25%] top-[12%] h-[520px] w-[520px] rounded-full bg-purple-500/15 blur-[180px]" />
        <div className="absolute right-[-18%] top-[46%] h-[480px] w-[480px] rounded-full bg-sky-500/12 blur-[180px]" />
        <div className="absolute inset-x-[-30%] bottom-[-32%] h-[520px] rounded-full bg-emerald-500/10 blur-[220px]" />
      </div>
      <RevealOnScroll />
      <section className="relative overflow-hidden px-5 pt-20 pb-16 sm:px-6 md:pt-28 md:pb-20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-purple-600/35 blur-[160px]" />
          <Particles className="absolute inset-0" quantity={10} staticity={40} />
        </div>
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center md:items-start md:text-left">
          <span className="stellar-pill eb-reveal">Features</span>
          <h1 className="eb-reveal mt-6 max-w-3xl text-4xl font-semibold text-white md:text-5xl">
            The EarlyBird Ops Studio for calls, bookings, and follow-through.
          </h1>
          <p className="eb-reveal delay-1 mt-6 max-w-2xl text-base text-white/70 md:text-lg">
            Flip coverage on, monitor every conversation, and let automations move data back into your CRM. Less reading, more clarity on what your
            agent handled.
          </p>
          <div className="eb-reveal delay-2 mt-8 flex flex-col gap-3 sm:flex-row">
            <AuthModalTriggerButton
              mode="signup"
              className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-base font-semibold text-black transition hover:bg-white/90"
            >
              Start free trial
            </AuthModalTriggerButton>
          </div>
        </div>
      </section>

      <Section
        eyebrow="Command center"
        title="Everything your agent needs, in one canvas"
        description="Interactive panels show what’s happening live while keeping the controls a click away."
        className="pt-0 before:absolute before:-left-24 before:top-20 before:h-72 before:w-72 before:rounded-full before:bg-white/5 before:blur-3xl before:content-[''] after:absolute after:-right-28 after:top-32 after:h-64 after:w-64 after:rounded-full after:bg-purple-500/15 after:blur-3xl after:content-['']"
      >
        <div className="grid gap-6 lg:grid-cols-3">
          {highlights.map((item, index) => (
            <div
              key={item.title}
              className="eb-reveal stellar-grid-card group h-full overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-transparent p-6 transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.08] md:p-8"
              style={{ transitionDelay: `${index * 60}ms` }}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 shadow-[0_8px_20px_rgba(76,29,149,0.22)]">
                  {item.icon}
                </span>
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              </div>
              <p className="mt-4 text-sm text-white/70">{item.copy}</p>
              <ul className="mt-5 space-y-2 text-sm text-white/60">
                {item.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2 rounded-2xl border border-white/0 bg-white/0 px-2 py-1 transition group-hover:border-white/10 group-hover:bg-white/5">
                    <CheckIcon className="mt-0.5 h-4 w-4 text-purple-200" />
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
        title="Coverage windows that flex with the day"
        description="Preset schedules or ad-hoc blocks—EarlyBird keeps callers answered while your team focuses."
        className="pt-0 before:absolute before:left-1/2 before:top-1/3 before:h-[420px] before:w-[420px] before:-translate-x-1/2 before:rounded-full before:bg-white/5 before:blur-3xl before:content-['']"
      >
        <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="eb-reveal stellar-grid-card bg-white/10 p-4 backdrop-blur">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-2">
              {coverageModes.map((mode) => {
                const isActive = mode.id === selectedMode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setActiveMode(mode.id)}
                    onMouseEnter={() => setActiveMode(mode.id)}
                    className={`w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                      isActive ? "bg-white text-slate-900 shadow-[0_14px_30px_rgba(76,29,149,0.25)]" : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {mode.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-4 text-xs text-white/50">
              Coverage changes apply instantly. Need QA first? Preview them in sandbox mode before going live.
            </p>
          </div>
          <div className="eb-reveal delay-2 stellar-grid-card bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-transparent p-6 md:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-500/20 text-purple-100">
                <ClockIcon className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-xl font-semibold text-white">{selectedMode.label}</h3>
                <p className="mt-1 text-sm text-white/65">{selectedMode.summary}</p>
              </div>
            </div>
            <ul className="mt-6 grid gap-3 text-sm text-white/70 sm:grid-cols-2">
              {selectedMode.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                  <CheckIcon className="mt-0.5 h-4 w-4 text-purple-200" />
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
        description="Each step is short, visual, and ready to revisit whenever your playbook evolves."
        className="pt-0 before:absolute before:right-[-20%] before:top-10 before:h-72 before:w-72 before:rounded-full before:bg-sky-500/15 before:blur-3xl before:content-['']"
      >
        <div className="relative">
          <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-b from-white/[0.04] via-transparent to-transparent blur-xl" />
          <div className="grid gap-6 md:grid-cols-2">
            {stages.map((stage) => (
              <div
                key={stage.label}
                className="eb-reveal stellar-grid-card h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] p-6 md:p-8 transition hover:-translate-y-1 hover:border-white/20"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-sm font-semibold text-purple-100 shadow-[0_12px_24px_rgba(147,51,234,0.25)]">
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
        description="Appointment data, tickets, and insight loops keep moving—even when the front desk is quiet."
        className="pt-0 before:absolute before:left-1/2 before:top-24 before:h-[520px] before:w-[720px] before:-translate-x-1/2 before:rounded-[50%] before:bg-gradient-to-br before:from-purple-500/15 before:via-slate-900/0 before:to-transparent before:blur-3xl before:content-['']"
      >
        <div className="eb-reveal relative overflow-hidden rounded-[32px] border border-white/10 bg-[#070711]/85 p-2 md:p-3">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#070711] via-[#070711]/80 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#070711] via-[#070711]/80 to-transparent" />
          <IntegrationsCarousel />
        </div>
        <div className="eb-reveal delay-2 mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-3xl border border-white/10 bg-[#060610]/80 p-6">
            <h3 className="text-lg font-semibold text-white">Integrating CRMs with your agent has never been easier.</h3>
            <p className="mt-3 text-sm text-white/65">
              Connect HubSpot, Salesforce, ServiceTitan, or Zapier in a few clicks, choose the workflows you trust, and keep your callers in sync with the rest of ops.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-sm text-white/70">
            <p>Pick the data you want to read and write, assign team permissions, and preview the handoffs before going live.</p>
            <p className="mt-4 font-semibold text-white">Get started today &rarr;</p>
          </div>
        </div>
      </Section>

      <Section
        eyebrow="Insights and billing"
        title="Transparency that keeps leadership aligned"
        description="Know how your agent is performing and what it costs—without leaving the dashboard."
        className="pt-0"
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="eb-reveal stellar-grid-card bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-transparent p-6 md:p-8">
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
          <div className="eb-reveal delay-2 stellar-grid-card space-y-4 bg-white/[0.05] p-6 md:p-8">
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

      <section className="relative mx-auto w-full max-w-6xl px-5 pb-24 pt-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[40px] px-8 py-12 md:py-20">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white/[0.08] via-white/[0.02] to-transparent" />
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/4 top-[-20%] h-[360px] w-[360px] rounded-full bg-purple-500/25 blur-[140px]" />
            <div className="absolute right-[-10%] bottom-[-35%] h-[420px] w-[420px] rounded-full bg-sky-500/20 blur-[160px]" />
          </div>
          <div className="relative mx-auto max-w-3xl text-center">
            <span className="stellar-badge mb-5">Get started</span>
            <h2 className="h2 bg-clip-text text-transparent bg-linear-to-r from-slate-200/60 via-slate-200 to-slate-200/60 pb-4">
              CRM hand-offs tuned in minutes, not months.
            </h2>
            <p className="text-lg text-white/70">
              Connect your stack, preview the automations, and launch your agent without re-writing a single workflow.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <AuthModalTriggerButton
                mode="signup"
                className="btn text-slate-900 bg-linear-to-r from-white/80 via-white to-white/80 hover:bg-white transition duration-150 ease-in-out"
              >
                Start trial
              </AuthModalTriggerButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
