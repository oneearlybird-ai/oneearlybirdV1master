export const dynamic = "force-static";

const STATUS_GROUPS = [
  {
    title: "Website & onboarding",
    status: "Operational",
    description: "Marketing pages, signup, and auth are responding normally with sub-200ms median latency.",
    actions: ["95th percentile landing page load: 1.82s", "Latest deploy: < 1 hour ago"],
  },
  {
    title: "Voice agents",
    status: "Operational",
    description: "Inbound and outbound calls are completing as expected. Carrier health monitors show no degradation across US regions.",
    actions: ["Live transcription streaming under 240ms", "Fallback numbers verified every 5 minutes"],
  },
  {
    title: "Integrations",
    status: "Monitoring",
    description: "HubSpot, Salesforce, ServiceTitan, and Slack are syncing normally. We are monitoring Salesforce sandbox API rate limits after their maintenance window.",
    actions: ["0 sync retries in the last hour", "Salesforce sandbox rate limit reset ETA 01:00 ET"],
  },
  {
    title: "Analytics & exports",
    status: "Operational",
    description: "Dashboards, transcript search, and CSV exports are available. Nightly warehouse sync completed on schedule.",
    actions: ["Call analytics refreshed 2 minutes ago", "Warehouse sync finished 04:12 ET"],
  },
];

const STATUS_COLORS: Record<string, string> = {
  Operational: "border-emerald-400/30 bg-emerald-400/15 text-emerald-100",
  Monitoring: "border-amber-400/30 bg-amber-400/15 text-amber-50",
  Incident: "border-rose-400/40 bg-rose-400/15 text-rose-100",
};

const SUPPORT_CHANNELS = [
  {
    title: "Incident response",
    copy: "If you notice an issue before we do, email incidents@earlybird.ai. On-call engineering responds within 15 minutes, 24/7.",
  },
  {
    title: "Forwarding help",
    copy: "Need a carrier walk-through? Open the support drawer in the dashboard and choose 'Forwarding session'. We schedule same-day.",
  },
  {
    title: "Release notes",
    copy: "Follow @earlybirdupdates on X or subscribe to changelog emails from the dashboard profile menu.",
  },
];

function StatusBadge({ status }: { status: string }) {
  const classes = STATUS_COLORS[status] ?? "border-white/20 bg-white/10 text-white";
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${classes}`}>
      <span className="h-2 w-2 rounded-full bg-current opacity-80" aria-hidden />
      {status}
    </span>
  );
}

export default function StatusPage() {
  const lastUpdated = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZoneName: "short",
  }).format(new Date());

  return (
    <div className="relative flex flex-col">
      <section className="relative overflow-hidden px-5 pb-12 pt-20 sm:px-6 md:pt-28">
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.28),_transparent_70%)]" />
          <div className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.08),_transparent_60%)] blur-3xl" />
        </div>
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
            System status
          </span>
          <h1 className="mt-6 text-4xl font-semibold text-white md:text-5xl">All systems operational</h1>
          <p className="mt-6 max-w-2xl text-base text-white/70 md:text-lg">
            We monitor voice, integrations, analytics, and web surfaces around the clock. This page summarizes the latest health checks—no raw secrets required.
          </p>
          <div className="mt-6 inline-flex items-center gap-4 rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
            <span>Last update {lastUpdated}</span>
            <span>Pager: incidents@earlybird.ai</span>
          </div>
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-6xl px-5 pb-20 sm:px-6">
        <div className="relative overflow-hidden rounded-[40px] border border-white/12 bg-white/5 px-6 py-12 md:px-12">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_72%)]" />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {STATUS_GROUPS.map((group) => (
              <article key={group.title} className="rounded-3xl border border-white/12 bg-white/5 p-6">
                <header className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-white">{group.title}</h2>
                    <p className="mt-2 text-sm text-white/70">{group.description}</p>
                  </div>
                  <StatusBadge status={group.status} />
                </header>
                <ul className="mt-4 space-y-1 text-xs uppercase tracking-[0.25em] text-white/50">
                  {group.actions.map((item) => (
                    <li key={item} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1 text-left text-[0.65rem] text-white/60">
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-6xl px-5 pb-24 sm:px-6">
        <div className="relative overflow-hidden rounded-[40px] border border-white/12 bg-white/5 px-6 py-12 md:px-12">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_72%)]" />
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {SUPPORT_CHANNELS.map((channel) => (
              <article key={channel.title} className="rounded-3xl border border-white/12 bg-white/5 p-6 text-sm text-white/70">
                <h3 className="text-base font-semibold text-white">{channel.title}</h3>
                <p className="mt-2">{channel.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
