const highlights = [
  {
    title: 'Trusted coverage',
    body: 'Route every caller through configurable schedules, greetings, and escalation rules so your phones are covered 24/7 or exactly when you choose.',
  },
  {
    title: 'Human-level context',
    body: 'Sync calendars, CRMs, and field ops data so the receptionist knows availability, pricing, and playbooks before every conversation.',
  },
  {
    title: 'Proof for every call',
    body: 'Transcripts, summaries, and recordings flow into dashboards and alerts so ops, sales, and support teams always see what happened.',
  },
  {
    title: 'Launches in days',
    body: 'We configure numbers, integrations, and knowledge bases with you — then hand over controls so you can self-serve updates.',
  },
];

const stats = [
  { value: '120K+', label: 'Calls handled monthly' },
  { value: '55%', label: 'Avg. faster first response' },
  { value: '40%', label: 'More bookings captured' },
];

export default function Team() {
  return (
    <section className="relative">
      {/* Radial gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden="true">
        <div className="absolute flex items-center justify-center top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 w-1/3 aspect-square">
          <div className="absolute inset-0 translate-z-0 bg-purple-500 rounded-full blur-[120px] opacity-40"></div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="py-12 md:py-20">
          {/* Content */}
          <div className="max-w-3xl mx-auto text-center pb-12 md:pb-20">
            <h2 className="h2 bg-clip-text text-transparent bg-linear-to-r from-slate-200/60 via-slate-200 to-slate-200/60 pb-4">
              How we keep the lights on for your phones
            </h2>
            <p className="text-lg text-slate-400">
              EarlyBird AI is more than an answering service — it’s an always-on operations layer built with the reliability, transparency, and configurability modern service brands need.
            </p>
          </div>
          {/* Stats */}
          <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-6 text-center">
                <div className="text-3xl font-semibold text-white">{stat.value}</div>
                <div className="mt-2 text-xs font-medium uppercase tracking-wide text-white/60">{stat.label}</div>
              </div>
            ))}
          </div>
          {/* Highlights */}
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.05] p-5 transition-transform duration-200 ease-out hover:-translate-y-1 hover:border-white/20"
              >
                <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-xs text-white/65 md:text-sm">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
