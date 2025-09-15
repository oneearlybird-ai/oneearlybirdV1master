export const dynamic = 'force-dynamic';

async function getDemo() {
  try {
    const r = await fetch('/api/usage/demo', { cache: 'no-store' });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

function Bar({ used, total }: { used: number; total: number }) {
  const pct = Math.min(100, Math.round((used / total) * 100));
  return (
    <div className="h-2 w-full rounded bg-white/10 overflow-hidden">
      <div className="h-full bg-white/80" style={{ width: `${pct}%` }} />
    </div>
  );
}

export default async function BillingPage() {
  const demo = await getDemo();
  const plan = demo?.plan ?? 'Pro';
  const renewal = demo?.renewal ?? '—';
  const calls = demo?.calls ?? 0;
  const cQuota = demo?.quota?.calls ?? 1;
  const mins = demo?.minutes ?? 0;
  const mQuota = demo?.quota?.minutes ?? 1;
  return (
    <section>
      <h1 className="text-xl font-semibold tracking-tight">Billing & plan</h1>
      <div className="mt-6 grid gap-4 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm text-white/60">Current plan</div>
          <div className="mt-1 text-2xl font-semibold">{plan}</div>
          <div className="mt-1 text-sm text-white/60">Renews {renewal}</div>
          <div className="mt-4 text-sm">Calls: {calls} / {cQuota}</div>
          <Bar used={calls} total={cQuota} />
          <div className="mt-3 text-sm">Minutes: {mins} / {mQuota}</div>
          <Bar used={mins} total={mQuota} />
          <div className="mt-4 flex gap-3">
            <button className="rounded-md bg-white text-black px-3 py-1.5 text-sm font-medium hover:bg-white/90">Upgrade</button>
            <button className="rounded-md border border-white/20 px-3 py-1.5 text-sm text-white/80 hover:text-white">Change plan</button>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="font-medium">Plans</div>
          <ul className="mt-3 text-sm text-white/80 space-y-2">
            <li>Basic — for getting started</li>
            <li>Pro — for growing teams</li>
            <li>Elite — high volume/multi-location</li>
            <li>Enterprise — custom, contact us</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="font-medium">Billing history</div>
          <table className="mt-3 w-full text-sm text-white/80">
            <thead className="text-white/60">
              <tr><th className="text-left font-normal">Date</th><th className="text-left font-normal">Amount</th><th className="text-left font-normal">Status</th></tr>
            </thead>
            <tbody>
              <tr><td>2025-08-12</td><td>$199.00</td><td>Paid</td></tr>
              <tr><td>2025-07-12</td><td>$199.00</td><td>Paid</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

