export const dynamic = "force-dynamic";

async function getSummary() {
  try {
    const res = await fetch("/api/usage/summary", { cache: "no-store" });
    if (!res.ok) return { ok: false } as const;
    return await res.json();
  } catch {
    return { ok: false } as const;
  }
}

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs text-white/60">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {hint ? <div className="mt-1 text-xs text-white/50">{hint}</div> : null}
      <div className="mt-3 h-6 w-full overflow-hidden rounded bg-white/5">
        <div className="h-full w-2/3 bg-white/10" aria-hidden />
      </div>
    </div>
  );
}

export default async function DashboardHome() {
  const data = await getSummary();
  const calls = typeof (data as any)?.calls === "number" ? (data as any).calls : 0;
  const minutes = typeof (data as any)?.minutes === "number" ? (data as any).minutes : 0;
  const qualified = typeof (data as any)?.qualified === "number" ? (data as any).qualified : 0;

  return (
    <section>
      <h2 className="text-xl font-semibold tracking-tight mb-4">Overview</h2>
      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
        <Kpi label="Calls (this month)" value={String(calls)} hint="Non-PHI aggregate" />
        <Kpi label="Minutes handled" value={String(minutes)} />
        <Kpi label="Qualified leads" value={String(qualified)} />
        <Kpi label="After-hours coverage" value="24/7" hint="Configured policy" />
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">This week</h3>
          <span className="text-sm text-white/60">Live snapshot</span>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-white/10 p-3">
            <div className="text-xs text-white/60">Answered</div>
            <div className="text-lg font-semibold">—</div>
          </div>
          <div className="rounded-lg border border-white/10 p-3">
            <div className="text-xs text-white/60">Booked appts</div>
            <div className="text-lg font-semibold">—</div>
          </div>
          <div className="rounded-lg border border-white/10 p-3">
            <div className="text-xs text-white/60">Missed saved</div>
            <div className="text-lg font-semibold">—</div>
          </div>
        </div>
      </div>
    </section>
  );
}
