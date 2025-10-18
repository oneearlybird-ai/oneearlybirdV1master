import Link from "next/link";
import AuthModalTriggerButton from "@/components/auth/AuthModalTriggerButton";
import { PLAN_DEFINITIONS, getPlanPriceLabel, getPlanTrialBadge } from "@/lib/plans";
import { MobileCard, MobileCardContent, MobileCardHeader } from "@/components/mobile/Card";

const highlights = [
  {
    title: "Instant pickup",
    body: "Sub-second greetings with natural voice that follows your scripts and plays nice with caller IDs.",
  },
  {
    title: "Books while you sleep",
    body: "Sync Google or Microsoft calendars, confirm availability, and lock-in appointments automatically.",
  },
  {
    title: "Routes hot leads fast",
    body: "Escalate to SMS, voice, or email based on rules you control—no more lost voicemails.",
  },
] satisfies Array<{ title: string; body: string }>;

const mobileWorkspace = [
  {
    title: "Call intelligence",
    body: "Listen back to recordings, scan transcripts, and share moments with your team in one tap.",
  },
  {
    title: "Usage at a glance",
    body: "Track minutes, answered calls, and booked meetings right from your phone, refreshed in real time.",
  },
  {
    title: "Admin controls",
    body: "Update greetings, routing rules, FAQs, and after-hours coverage without opening your laptop.",
  },
];

const testimonials = [
  {
    quote:
      "We launched EarlyBird on a Friday and by Monday it was booking 80% of inbound consults without involving our staff.",
    name: "Alexis Moore",
    role: "COO, Crestline Dental",
  },
  {
    quote: "The follow-up transcripts are gold—our team finally has full context when returning leads.",
    name: "Jordan Price",
    role: "Head of Sales, Brightlane Solar",
  },
];

const integrations = ["HubSpot", "Salesforce", "Google Workspace", "Microsoft 365", "Slack", "Twilio Voice"];

export default function MobileLandingPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-12 px-4 py-8 text-white sm:px-6">
      <section className="space-y-6 text-center">
        <div className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-medium uppercase tracking-wide text-white/70">
          Built for AI reception
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          AI reception that sounds like your best operator.
        </h1>
        <p className="text-base text-white/70">
          EarlyBird greets callers instantly, books appointments, answers FAQs, and hands off warm leads—all while you track
          transcripts, recordings, and usage on the go.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <AuthModalTriggerButton
            mode="signup"
            className="inline-flex h-12 w-full max-w-sm items-center justify-center rounded-full bg-white px-6 text-base font-semibold text-black shadow-lg shadow-black/20 transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40"
          >
            Start free trial
          </AuthModalTriggerButton>
          <Link
            href="/preview"
            className="inline-flex h-12 w-full max-w-sm items-center justify-center rounded-full border border-white/20 px-6 text-base font-semibold text-white/80 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            Watch preview
          </Link>
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="text-xl font-semibold">Why callers love EarlyBird</h2>
        <div className="grid gap-4">
          {highlights.map((item) => (
            <MobileCard key={item.title}>
              <MobileCardHeader title={item.title} />
              <MobileCardContent>
                <p className="text-white/70">{item.body}</p>
              </MobileCardContent>
            </MobileCard>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="space-y-5">
        <h2 className="text-xl font-semibold">How it works</h2>
        <div className="grid gap-4">
          <MobileCard>
            <MobileCardHeader title="1. Connect your numbers" subtitle="Port or forward any existing line" />
            <MobileCardContent>
              Link calendars, pick call flows, and decide when EarlyBird answers versus when your team does.
            </MobileCardContent>
          </MobileCard>
          <MobileCard>
            <MobileCardHeader title="2. EarlyBird handles every call" subtitle="24/7 coverage on-brand" />
            <MobileCardContent>
              The agent qualifies, schedules, or routes every caller. CRM notes and recordings sync back automatically.
            </MobileCardContent>
          </MobileCard>
          <MobileCard>
            <MobileCardHeader title="3. Review from anywhere" subtitle="Dashboards tuned for mobile" />
            <MobileCardContent>
              Track performance, adjust messaging, and share key calls in seconds—no laptop required.
            </MobileCardContent>
          </MobileCard>
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="text-xl font-semibold">Run your receptionist from your phone</h2>
        <p className="text-sm text-white/60">
          Your mobile workspace mirrors the desktop dashboard so you never lose context between devices.
        </p>
        <div className="grid gap-4">
          {mobileWorkspace.map((item) => (
            <MobileCard key={item.title}>
              <MobileCardHeader title={item.title} />
              <MobileCardContent>
                <p className="text-white/70">{item.body}</p>
              </MobileCardContent>
            </MobileCard>
          ))}
        </div>
      </section>

      <section id="integrations" className="space-y-4">
        <h2 className="text-xl font-semibold">Plays nicely with your stack</h2>
        <p className="text-sm text-white/60">
          EarlyBird syncs routing, transcripts, and analytics into the tools your team already checks every day.
        </p>
        <div className="flex flex-wrap items-center gap-2 text-sm text-white/70">
          {integrations.map((integration) => (
            <span
              key={integration}
              className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1"
            >
              {integration}
            </span>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="text-xl font-semibold">What teams are saying</h2>
        <div className="grid gap-4">
          {testimonials.map((item) => (
            <MobileCard key={item.name}>
              <MobileCardContent>
                <p className="text-base text-white/85">“{item.quote}”</p>
                <div className="mt-4 text-sm text-white/60">
                  <div className="font-medium text-white/80">{item.name}</div>
                  <div>{item.role}</div>
                </div>
              </MobileCardContent>
            </MobileCard>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-center">Plans for every team</h2>
        <p className="text-sm text-white/60 text-center">
          One catalog across desktop and mobile. Start a trial or upgrade from either surface—everything stays in sync.
        </p>
        <div className="grid gap-4">
          {PLAN_DEFINITIONS.map((plan) => (
            <MobileCard key={plan.slug}>
              <MobileCardHeader
                title={
                  <div className="flex items-center justify-between gap-3">
                    <span>{plan.name}</span>
                    {plan.tag ? (
                      <span className="rounded-full border border-white/15 px-2 py-0.5 text-xs text-white/70">{plan.tag}</span>
                    ) : null}
                  </div>
                }
                subtitle={`${getPlanPriceLabel(plan)} • ${plan.includedMinutes.toLocaleString()} minutes`}
              />
              <MobileCardContent>
                {plan.blurb ? <p className="text-white/70">{plan.blurb}</p> : null}
                <ul className="mt-3 space-y-1 text-sm text-white/70">
                  {plan.features.slice(0, 3).map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-white/40" aria-hidden />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                {plan.trialAvailable ? (
                  <span className="mt-3 inline-flex items-center rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                    {getPlanTrialBadge(plan)}
                  </span>
                ) : null}
                <Link
                  href="/m/pricing"
                  className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-full border border-white/20 text-sm font-semibold text-white/80 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                >
                  Compare plans
                </Link>
              </MobileCardContent>
            </MobileCard>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center">
        <h2 className="text-2xl font-semibold">Ready to hear your own AI receptionist?</h2>
        <p className="mt-2 text-sm text-white/70">
          Spin up a trial in minutes, connect your number, and make a live test call from your phone.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <AuthModalTriggerButton
            mode="signup"
            className="inline-flex h-12 w-full max-w-xs items-center justify-center rounded-full bg-white px-6 text-base font-semibold text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
          >
            Start free trial
          </AuthModalTriggerButton>
          <Link
            href="/support"
            className="inline-flex h-12 w-full max-w-xs items-center justify-center rounded-full border border-white/20 px-6 text-base font-semibold text-white/80 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            Talk to support
          </Link>
        </div>
      </section>
    </div>
  );
}

