export const dynamic = 'force-dynamic';

import { LiveStatusBadge, RecentCallsPreview } from '@/components/RecentCallsPreview';

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

// reserved: simple stat tile
function _StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 p-3">
      <div className="text-xs text-white/60">{title}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

async function getDemo() {
  try {
    const res = await fetch('/api/usage/demo', { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as {
      plan: string; renewal: string;
      calls: number; minutes: number; quota: { calls: number; minutes: number };
      week: { answered: number; booked: number; deflected: number; avgDuration: string };
    };
  } catch {
    return null;
  }
}

export default async function DashboardPreview() {
  const demo = await getDemo();
  const plan = demo?.plan ?? 'Pro';
  const renewal = demo?.renewal ?? '—';
  const calls = demo?.calls ?? 125;
  const callsQuota = demo?.quota?.calls ?? 500;
  const minutes = demo?.minutes ?? 600;
  const minutesQuota = demo?.quota?.minutes ?? 1000;
  const week = demo?.week ?? { answered: 58, booked: 12, deflected: 9, avgDuration: '3m 12s' };

  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Welcome to EarlyBird AI, Alex</h1>
      <p className="mt-2 text-white/70">Your AI receptionist is <span className="text-emerald-400">Active</span> and handling calls. <span className="ml-2"><LiveStatusBadge /></span></p>
      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          <div>
            <div className="font-medium">AI Receptionist is live</div>
            <div className="text-sm text-white/60">Answering, booking, and logging into your CRM</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href="/dashboard-preview/calls" className="btn btn-primary">View Calls</a>
          <a href="/dashboard-preview/integrations" className="btn btn-outline">Integrations</a>
        </div>
      </div>

      {/* Plan & Usage */}
      <div className="mt-6 grid gap-4 grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
        <Kpi label="Current plan" value={plan} hint={`Renews ${renewal}`} />
        <Kpi label="Calls this month" value={`${calls} / ${callsQuota}`} />
        <Kpi label="Minutes used" value={`${minutes} / ${minutesQuota}`} />
        <Kpi label="After‑hours coverage" value="24/7" />
      </div>
      <div className="mt-3">
        <a href="/dashboard/billing" className="inline-flex items-center rounded-xl border border-white/20 px-4 py-2 text-sm text-white/80 hover:text-white">Upgrade plan</a>
      </div>

      <ThisWeekPanel week={week} />

      {/* Recent calls */}
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5">
        <div className="flex items-center justify-between p-4">
          <h2 className="font-medium">Recent calls</h2>
          <a className="text-sm text-white/80 hover:text-white" href="/dashboard/calls">View all</a>
        </div>
        <RecentCallsPreview />
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

function ThisWeekPanel({ week }: { week: { answered: number; booked: number; deflected: number; avgDuration: string } }) {
  const series = [8, 12, 9, 14, 10, 16, 11]; // preview-only sparkline data
  const max = Math.max(...series, 1);
  const points = series.map((v, i) => {
    const x = (i / (series.length - 1)) * 100;
    const y = 100 - (v / max) * 100;
    return `${x},${y}`;
  }).join(' ');
  return (
    <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-medium">This week</h2>
        <span className="text-sm text-white/60">Live snapshot</span>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-white/10 p-3">
          <div className="text-xs text-white/60">Answered (sparkline)</div>
          <svg viewBox="0 0 100 30" className="mt-1 h-12 w-full">
            <polyline points={points} fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5"/>
          </svg>
        </div>
        <div className="rounded-lg border border-white/10 p-3">
          <div className="text-xs text-white/60">Booked appts</div>
          <div className="text-lg font-semibold">{String(week.booked)}</div>
        </div>
        <div className="rounded-lg border border-white/10 p-3">
          <div className="text-xs text-white/60">Voicemail deflected</div>
          <div className="text-lg font-semibold">{String(week.deflected)}</div>
        </div>
        <div className="rounded-lg border border-white/10 p-3">
          <div className="text-xs text-white/60">Avg duration</div>
          <div className="text-lg font-semibold">{week.avgDuration}</div>
        </div>
      </div>
      <div className="mt-3 text-xs text-white/60">Last updated just now</div>
    </div>
  );
}
