import Section from "@/components/stellar/Section";
import AuthModalTriggerButton from "@/components/auth/AuthModalTriggerButton";
import Link from "next/link";
import { PhoneIcon, CalendarIcon, ControlsIcon } from "@/components/icons";

const metrics = [
  { label: "effective cost per booking", value: "$5–$12" },
  { label: "deflection to self-serve", value: "60–85%" },
  { label: "coverage with on-brand voice", value: "24/7" },
];

const playbook = [
  {
    icon: <PhoneIcon />, 
    title: "Capture the call",
    description:
      "EarlyBird answers on the first ring with a warm, branded greeting. Callers never hit voicemail or endless IVRs.",
  },
  {
    icon: <CalendarIcon />,
    title: "Book or reschedule",
    description:
      "We check two-way calendar availability across Google and Microsoft 365, confirm times, and send reminders.",
  },
  {
    icon: <ControlsIcon />,
    title: "Sync and notify",
    description:
      "Transcripts, outcomes, and tags flow into your CRM and Slack. OTP step-up guards any changes that need human approval.",
  },
];

const checklist = [
  "Managed telephony — keep your existing numbers or let us provision new ones.",
  "Cookie-auth only frontend; server validates sessions via JWKS; no client-side token storage.",
  "Per-request warmups of /tenants/profile and /billing/summary ensure plan cards never flicker.",
  "Fallback redirect mirrors Google popup flow if window.open is blocked.",
  "Signed webhooks + no-store caching keep data fresh without leaking PHI.",
];

export const metadata = {
  title: "How EarlyBird Works",
  description: "Understand the live call flow, ROI, and operational guardrails behind EarlyBird's AI receptionist.",
};

export default function HowItWorksPage() {
  return (
    <div className="flex flex-col">
      <section className="px-5 pt-20 pb-12 sm:px-6 md:pt-28">
        <div className="mx-auto max-w-4xl text-center">
          <span className="stellar-pill">How it works</span>
          <h1 className="mt-6 text-4xl font-semibold text-white md:text-5xl">AI voice reception, built for operators.</h1>
          <p className="mt-6 text-base text-white/70 md:text-lg">
            EarlyBird answers, qualifies, and books every inbound call. You get detailed transcripts, analytics, and an operations-friendly dashboard
            without expanding headcount.
          </p>
        </div>
      </section>

      <Section
        eyebrow="ROI at a glance"
        title="The numbers we see across deployments"
        description="Derived from service businesses running 2,500–10,000 inbound calls per month."
        className="pt-0"
      >
        <div className="grid gap-6 md:grid-cols-3">
          {metrics.map((metric) => (
            <div key={metric.label} className="stellar-grid-card bg-white/5 text-center">
              <div className="text-3xl font-semibold text-white">{metric.value}</div>
              <div className="mt-2 text-sm uppercase tracking-wide text-white/60">{metric.label}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Playbook"
        title="Every call follows a proven sequence"
        description="This mirrors the demo environment: the same auth/session posture, the same guardrails."
      >
        <div className="grid gap-6 md:grid-cols-3">
          {playbook.map((step) => (
            <div key={step.title} className="stellar-grid-card">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">{step.icon}</span>
              <h3 className="mt-5 text-lg font-semibold text-white">{step.title}</h3>
              <p className="mt-3 text-sm text-white/70">{step.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Operational guardrails"
        title="What stays true when you deploy"
        description="A quick checklist for security, auth, and billing expectations."
      >
        <div className="stellar-grid-card bg-white/5">
          <ul className="list-disc space-y-2 pl-5 text-sm text-white/80">
            {checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </Section>

      <Section
        eyebrow="Next step"
        title="Ready to calculate your savings?"
        description="We’ll plug in your call volume, staffing cost, and conversion rate to give you a credible ROI model."
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
            Request ROI worksheet
          </Link>
        </div>
      </Section>
    </div>
  );
}
