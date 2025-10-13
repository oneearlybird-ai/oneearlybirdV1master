export const dynamic = 'force-dynamic';

async function getDemo() {
  try {
    const r = await fetch('/api/usage/demo', { cache: 'no-store' });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

function BarSvg({ used, total }: { used: number; total: number }) {
  const pct = Math.min(100, Math.round((used / total) * 100));
  const w = 100;
  const h = 8;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-1 w-full h-2" aria-label="usage">
      <rect x="0" y="0" width={w} height={h} rx="2" fill="rgba(255,255,255,0.1)" />
      <rect x="0" y="0" width={(pct/100)*w} height={h} rx="2" fill="rgba(255,255,255,0.8)" />
    </svg>
  );
}

function PlanTile({
  name,
  price,
  tag,
  features,
  current,
}: {
  name: string;
  price: string;
  tag?: string;
  features: string[];
  current?: boolean;
}) {
  return (
    <div className={`rounded-2xl border ${current ? 'border-white/30' : 'border-white/10'} bg-white/5 p-4`}> 
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">{name}</div>
        {tag ? <span className="rounded-full border border-white/20 px-2 py-0.5 text-xs text-white/80">{tag}</span> : null}
      </div>
      <div className="mt-1 text-white/90">{price}</div>
      <ul className="mt-3 text-sm text-white/80 space-y-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2"><span aria-hidden>•</span><span>{f}</span></li>
        ))}
      </ul>
      <div className="mt-4">
        {current ? (
          <span className="inline-flex items-center rounded-md border border-white/20 px-3 py-1.5 text-sm text-white/60">Current plan</span>
        ) : (
          <a href="/dashboard/billing" className="inline-flex items-center rounded-md bg-white text-black px-3 py-1.5 text-sm font-medium hover:bg-white/90">Select</a>
        )}
      </div>
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

      {/* Current plan & usage */}
      <div className="mt-6 grid gap-4 grid-cols-[repeat(auto-fit,minmax(280px,1fr))]">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm text-white/60">Current plan</div>
          <div className="mt-1 text-2xl font-semibold">{plan}</div>
          <div className="mt-1 text-sm text-white/60">Renews {renewal}</div>
          <div className="mt-4 text-sm">Calls: {calls} / {cQuota}</div>
          <BarSvg used={calls} total={cQuota} />
          <div className="mt-3 text-sm">Minutes: {mins} / {mQuota}</div>
          <BarSvg used={mins} total={mQuota} />
          <div className="mt-4 flex gap-3">
            <a href="/dashboard/billing" className="rounded-md bg-white text-black px-3 py-1.5 text-sm font-medium hover:bg-white/90">Upgrade</a>
            <a href="/dashboard/billing" className="rounded-md border border-white/20 px-3 py-1.5 text-sm text-white/80 hover:text-white">Change plan</a>
          </div>
        </div>

        {/* Compare plans */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:col-span-2">
          <div className="font-medium">Compare plans</div>
          <div className="mt-3 grid gap-4 grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
            <PlanTile name="Starter" price="$149/mo" features={["200 min included","Core routing","Email summaries"]} />
            <PlanTile name="Professional" price="$249/mo" tag="Most popular" features={["400 min included","CRM sync","Calendar booking"]} current={plan==='Pro'} />
            <PlanTile name="Growth" price="$399/mo" features={["800 min included","Team routing","Advanced analytics"]} />
            <PlanTile name="Enterprise" price="$899/mo" features={["2000 min included","SSO & compliance","Dedicated manager"]} />
          </div>
        </div>

        {/* Billing history */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="font-medium">Billing history</div>
          <table className="mt-3 w-full text-sm text-white/80">
            <thead className="text-white/60">
              <tr><th className="text-left font-normal">Date</th><th className="text-left font-normal">Amount</th><th className="text-left font-normal">Status</th></tr>
            </thead>
            <tbody>
              <tr><td>2025-08-12</td><td>$249.00</td><td>Paid</td></tr>
              <tr><td>2025-07-12</td><td>$249.00</td><td>Paid</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
