export const dynamic = "force-static";

const STATUS_GROUPS = [
  {
    title: "Website & onboarding",
    status: "Operational",
    description: "Marketing pages, login, and signup are responding normally.",
  },
  {
    title: "Voice agents",
    status: "Operational",
    description: "Inbound and outbound calls are connecting with normal latency.",
  },
  {
    title: "Integrations",
    status: "Monitoring",
    description: "Salesforce sandbox rate limits are being monitored after their maintenance window.",
  },
  {
    title: "Analytics & exports",
    status: "Operational",
    description: "Dashboards and CSV exports refreshed a few minutes ago.",
  },
];

const STATUS_COLORS: Record<string, string> = {
  Operational: "border-emerald-400/30 bg-emerald-400/15 text-emerald-100",
  Monitoring: "border-amber-400/30 bg-amber-400/15 text-amber-50",
};

const SUPPORT_BLURBS = [
  "Email incidents@earlybird.ai for urgent issues—on-call engineering responds within 15 minutes, 24/7.",
  "Need forwarding help? Open the dashboard support drawer and choose “Forwarding session”.",
  "Subscribe to changelog emails from your profile menu for release announcements.",
];

function Pill({ status }: { status: string }) {
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
    <div className="flex flex-col">
      <section className="relative overflow-hidden px-5 pt-20 pb-12 sm:px-6 md:pt-28">
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.28),_transparent_70%)]" />
        </div>
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
            System status
          </span>
          <h1 className="mt-6 text-4xl font-semibold text-white">All systems operational</h1>
          <p className="mt-6 text-base text-white/70">
            Voice, integrations, analytics, and web surfaces are healthy. We publish any incident updates here and on the dashboard home.
          </p>
          <div className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
            <span>Last update {lastUpdated}</span>
            <span>incidents@earlybird.ai</span>
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-6 md:pb-24">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          {STATUS_GROUPS.map((group) => (
            <article key={group.title} className="rounded-3xl border border-white/12 bg-white/5 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-white">{group.title}</h2>
                  <p className="mt-2 text-sm text-white/70">{group.description}</p>
                </div>
                <Pill status={group.status} />
              </div>
            </article>
          ))}

          <article className="rounded-3xl border border-white/12 bg-white/5 p-5 text-sm text-white/70">
            <h2 className="text-base font-semibold text-white">Need help?</h2>
            <ul className="mt-3 space-y-2 text-left">
              {SUPPORT_BLURBS.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-purple-400/70" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>
    </div>
  );
}
