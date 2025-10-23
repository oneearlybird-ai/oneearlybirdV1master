export const dynamic = "force-static";

import Link from "next/link";

const STEPS = [
  {
    step: "01",
    title: "Sign up & create your workspace",
    description: "Use your work email, invite your team, and land on the dashboard home.",
  },
  {
    step: "02",
    title: "Activate billing",
    description: "Choose a plan that matches your volume. Billing unlocks the EarlyBird connect number.",
  },
  {
    step: "03",
    title: "Verify the connect number",
    description: "Dashboard → Numbers → Forwarding. Place the short verification call so we know the destination is live.",
  },
  {
    step: "04",
    title: "Enable forwarding at your carrier",
    description: "Update your portal or dial *72 to forward calls to the verified connect number.",
  },
  {
    step: "05",
    title: "Flip EarlyBird live",
    description: "Test a call, then toggle EarlyBird as the receptionist. Analytics and transcripts start instantly.",
  },
];

const CHECKLIST = [
  "Existing business number(s) your customers already call.",
  "Carrier portal login or forwarding codes (*72 / *73).",
  "The connect number surfaced after verification.",
  "A few minutes to place the verification and test calls.",
];

const PROVIDER_GROUPS = [
  {
    title: "Wireless & VoIP",
    items: [
      "AT&T, Verizon, T-Mobile, Spectrum: Features → Call Forwarding → add the connect number → save.",
      "RingCentral, Zoom Phone, Grasshopper: edit the main call handling rule and route to EarlyBird.",
      "Teams Phone, Dialpad, 8x8: update the auto-attendant or hunt group to forward to EarlyBird.",
    ],
  },
  {
    title: "PBX / on-prem",
    items: [
      "Desk phones: dial *72 + connect number to enable; *73 to disable.",
      "Legacy PBX: add a permanent forward or ask your carrier to apply it for you.",
      "Need SIP help? Open a support ticket from the dashboard and we’ll hop on a call.",
    ],
  },
];

const POST_FORWARDING = [
  "Keep your carrier account active — forwarding doesn’t move billing.",
  "Analytics, recordings, and transcripts appear in EarlyBird immediately.",
  "Add more connect numbers anytime for departments or after-hours routing.",
];

export default function ForwardingPage() {
  return (
    <div className="relative flex flex-col">
      <section className="relative overflow-hidden px-5 pb-12 pt-20 sm:px-6 md:pt-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.22),_transparent_60%)]" aria-hidden="true" />
        <div className="mx-auto flex max-w-5xl flex-col gap-10 text-center md:gap-16">
          <div>
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Number forwarding</span>
            <h1 className="mt-6 text-4xl font-semibold leading-tight text-white md:text-5xl">
              Keep your numbers. Route every caller to EarlyBird.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base text-white/70 md:text-lg">
              Forwarding keeps your carrier in place. Once your workspace is active you can point calls at EarlyBird in minutes with no downtime.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a href="/signup" className="inline-flex items-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90">
                Create your account
              </a>
              <Link
                href="/login?tab=signin"
                className="inline-flex items-center rounded-2xl border border-white/20 px-5 py-3 text-sm font-semibold text-white/80 transition hover:text-white"
              >
                Sign in to dashboard
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:gap-6">
            {STEPS.map((step) => (
              <article
                key={step.title}
                className="group relative overflow-hidden rounded-3xl border border-white/12 bg-white/5 p-6 shadow-[0_24px_70px_rgba(9,9,22,0.35)] transition hover:border-white/20 hover:bg-white/8"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-sm font-semibold text-white/80">
                    {step.step}
                  </span>
                  <h2 className="text-lg font-semibold text-white">{step.title}</h2>
                </div>
                <p className="mt-3 text-sm text-white/75">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-6 md:pb-24">
        <div className="mx-auto flex max-w-5xl flex-col gap-12">
          <div className="grid gap-6 md:grid-cols-[minmax(0,1.2fr),minmax(0,1fr)]">
            <article className="rounded-3xl border border-white/12 bg-white/5 p-6 md:p-8">
              <h3 className="text-xl font-semibold text-white">Forwarding checklist</h3>
              <ul className="mt-4 space-y-2 text-sm text-white/80">
                {CHECKLIST.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-purple-400/70" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-3xl border border-white/12 bg-white/5 p-6 md:p-8">
              <h3 className="text-xl font-semibold text-white">Provider quick reference</h3>
              <div className="mt-4 space-y-5">
                {PROVIDER_GROUPS.map((group) => (
                  <div key={group.title}>
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-white/60">{group.title}</h4>
                    <ul className="mt-2 space-y-2 text-sm text-white/80">
                      {group.items.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-1 h-2 w-2 rounded-full bg-purple-400/70" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <article className="rounded-3xl border border-white/12 bg-white/5 p-6 md:p-8">
            <h3 className="text-xl font-semibold text-white">After forwarding</h3>
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              {POST_FORWARDING.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-purple-400/70" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/docs#forwarding"
                className="inline-flex items-center rounded-2xl border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/35 hover:text-white"
              >
                Read the forwarding guide
              </Link>
              <a
                href="mailto:support@earlybird.ai"
                className="inline-flex items-center rounded-2xl border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/35 hover:text-white"
              >
                Email support
              </a>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
