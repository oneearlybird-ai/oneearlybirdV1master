export const dynamic = 'force-dynamic';

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs text-white/60">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {hint ? <div className="mt-1 text-xs text-white/50">{hint}</div> : null}
      <div className="mt-3 h-2 w-full overflow-hidden rounded bg-white/5" aria-hidden>
        <div className="h-full w-2/3 bg-white/10" />
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 p-3">
      <div className="text-xs text-white/60">{title}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

function Row({ time, caller, duration, outcome }: { time: string; caller: string; duration: string; outcome: string }) {
  return (
    <div className="grid grid-cols-4 items-center gap-3 py-3">
      <div className="text-sm text-white/80">{time}</div>
      <div className="text-sm text-white/80">{caller}</div>
      <div className="text-sm text-white/60">{duration}</div>
      <div className="text-sm">
        <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-white/80">{outcome}</span>
      </div>
    </div>
  );
}

export default function DashboardPreview() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Welcome to EarlyBird AI, Alex</h1>
      <p className="mt-2 text-white/70">Your AI receptionist is <span className="text-emerald-400">Active</span> and handling calls.</p>

      {/* Plan & Usage */}
      <div className="mt-6 grid gap-4 grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
        <Kpi label="Current plan" value="Pro" hint="Renews Oct 12" />
        <Kpi label="Calls this month" value="125 / 500" />
        <Kpi label="Minutes used" value="600 / 1000" />
        <Kpi label="After‑hours coverage" value="24/7" />
      </div>
      <div className="mt-3">
        <a href="/dashboard/billing" className="inline-flex items-center rounded-xl border border-white/20 px-4 py-2 text-sm text-white/80 hover:text-white">Upgrade plan</a>
      </div>

      {/* Quick stats */}
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">This week</h2>
          <span className="text-sm text-white/60">Live snapshot</span>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          <StatCard title="Answered" value="58" />
          <StatCard title="Booked appts" value="12" />
          <StatCard title="Voicemail deflected" value="9" />
          <StatCard title="Avg duration" value="3m 12s" />
        </div>
      </div>

      {/* Recent calls */}
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5">
        <div className="flex items-center justify-between p-4">
          <h2 className="font-medium">Recent calls</h2>
          <a className="text-sm text-white/80 hover:text-white" href="/dashboard/calls">View all</a>
        </div>
        <div className="px-4 pb-4">
          <div className="grid grid-cols-4 gap-3 text-xs text-white/60 border-b border-white/10 pb-2">
            <div>Time</div>
            <div>Caller</div>
            <div>Duration</div>
            <div>Outcome</div>
          </div>
          <Row time="Today 10:14" caller="(415) 555‑0198" duration="02:45" outcome="Appointment booked" />
          <Row time="Today 09:05" caller="(347) 555‑0101" duration="01:12" outcome="Info provided" />
          <Row time="Yesterday 18:21" caller="(206) 555‑0112" duration="00:48" outcome="Voicemail deflected" />
        </div>
      </div>

      {/* Onboarding checklist */}
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
        <h2 className="font-medium">Get set up</h2>
        <ul className="mt-2 space-y-2 text-sm text-white/80">
          <li>✅ Connect phone number</li>
          <li>✅ Connect Google Calendar</li>
          <li>⬜ Connect CRM (HubSpot/Salesforce)</li>
          <li>⬜ Customize greeting & FAQs</li>
          <li>⬜ Make a test call</li>
        </ul>
        <div className="mt-3 flex gap-3">
          <a href="/dashboard/integrations" className="rounded-xl bg-white px-4 py-2 text-black text-sm font-medium hover:bg-white/90">Open Integrations</a>
          <a href="/dashboard/kb" className="rounded-xl border border-white/20 px-4 py-2 text-sm text-white/80 hover:text-white">Edit Greeting</a>
        </div>
      </div>
    </section>
  );
}

