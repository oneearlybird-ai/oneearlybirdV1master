export const metadata = {
  title: "About - EarlyBird AI",
  description: "Get to know EarlyBird AI — the always-on receptionist that captures every conversation and keeps your team informed.",
};

const stats = [
  { label: "Inbound calls answered", value: "98%" },
  { label: "Bookings completed", value: "24/7" },
  { label: "Live in", value: "< 1 day" },
];

const pillars = [
  {
    title: "Reception that never sleeps",
    body: "EarlyBird greets every caller immediately, routes urgent issues to humans, and keeps prospects engaged until they’re booked.",
    bullets: [
      "Scripted greetings per phone line",
      "Intent detection with smart escalation",
      "Live transfer or SMS follow-up built in",
    ],
  },
  {
    title: "Booking fully handled",
    body: "We sit inside your calendars, CRMs, and field ops tools so appointments stay accurate and your team never double-books.",
    bullets: [
      "Two-way sync with HubSpot, Salesforce, ServiceTitan",
      "Reschedules, reminders, and cancellations",
      "Dashboards that show revenue captured",
    ],
  },
  {
    title: "Evidence for every call",
    body: "Transcripts, audio, and summaries drop into one workspace — searchable, shareable, and exportable whenever you need proof.",
    bullets: [
      "Instant transcript playback",
      "Auto-tagged conversations and QA notes",
      "Secure, tenant-isolated storage",
    ],
  },
];

const values = [
  {
    title: "Operator-first",
    body: "EarlyBird exists to support busy front-line teams. We obsess over workflows that save time, generate revenue, and reduce burnout.",
  },
  {
    title: "Reliability by default",
    body: "High availability infrastructure, health and latency monitoring, and human backup plans mean your phones stay answered.",
  },
  {
    title: "Transparency always",
    body: "Own every recording, transcript, and configuration. Export anytime and audit every touch with detailed access logs.",
  },
];

export default function AboutPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(148,163,253,0.18),_rgba(15,23,42,0.92))]" aria-hidden />

      {/* Hero */}
      <section className="px-5 pt-24 pb-12 sm:px-6 md:pt-32 md:pb-16">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.35em] text-purple-300/80">About EarlyBird AI</p>
          <h1 className="mt-5 text-4xl font-semibold text-white md:text-5xl">
            We build reception that keeps service businesses open, responsive, and growing.
          </h1>
          <p className="mt-6 text-base text-white/70 md:text-lg">
            Missed calls cost revenue and trust. EarlyBird answers every conversation, books qualified work, and captures proof for your team — all without adding headcount.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-white">
                <div className="text-3xl font-semibold">{stat.value}</div>
                <div className="mt-2 text-xs font-medium uppercase tracking-wide text-white/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="px-5 pb-20 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <span className="text-sm font-medium uppercase tracking-[0.28em] text-purple-200/80">Why we exist</span>
            <h2 className="mt-4 text-3xl font-semibold text-white md:text-4xl">Phones are still the main door — we keep it open for you.</h2>
            <p className="mt-4 text-sm text-white/65 md:text-base">
              We started EarlyBird after watching high-value leads bounce to competitors because no one could answer quickly enough. The result: an AI receptionist trained to sound like your best operator, available instantly, and wired into the tools you already trust.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h3 className="text-base font-semibold text-white">What you get on day one</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              <li className="flex gap-2"><span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-purple-400" />Fully configured phone numbers or port your own.</li>
              <li className="flex gap-2"><span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-purple-400" />Custom call flows, knowledge base, and integrations.</li>
              <li className="flex gap-2"><span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-purple-400" />Live dashboards with transcripts, bookings, and revenue impact.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="px-5 pb-20 sm:px-6">
        <div className="mx-auto max-w-6xl space-y-10">
          <h2 className="text-3xl font-semibold text-white md:text-4xl">What EarlyBird handles for you</h2>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {pillars.map((pillar) => (
              <article key={pillar.title} className="group flex h-full flex-col rounded-3xl border border-white/10 bg-white/[0.05] p-6 transition-transform duration-200 ease-out hover:-translate-y-1 hover:border-white/20">
                <h3 className="text-lg font-semibold text-white">{pillar.title}</h3>
                <p className="mt-3 text-sm text-white/70">{pillar.body}</p>
                <ul className="mt-4 space-y-2 text-xs text-white/60">
                  {pillar.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-300" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="px-5 pb-24 sm:px-6">
        <div className="mx-auto max-w-6xl rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8 md:p-12">
          <div className="max-w-3xl">
            <span className="text-sm font-medium uppercase tracking-[0.28em] text-purple-200/80">How we work</span>
            <h2 className="mt-4 text-3xl font-semibold text-white md:text-4xl">Built like critical infrastructure, delivered like SaaS.</h2>
            <p className="mt-4 text-sm text-white/65 md:text-base">
              EarlyBird runs inside secure, multi-region environments with real-time monitoring, human oversight, and audit trails for every interaction. We ship improvements weekly, add integrations as you grow, and ground everything in transparent SLAs.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {values.map((value) => (
              <div key={value.title} className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
                <h3 className="text-sm font-semibold text-white">{value.title}</h3>
                <p className="mt-2 text-xs text-white/60 md:text-sm">{value.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
