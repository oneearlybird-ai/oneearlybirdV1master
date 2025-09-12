export const dynamic = "force-dynamic";

async function getSummary() {
  try {
    const res = await fetch("/api/usage/summary", { cache: "no-store" });
    if (!res.ok) return { ok: false };
    return await res.json();
  } catch {
    return { ok: false };
  }
}

export default async function UsagePage() {
  const data = await getSummary();
  const calls = typeof data?.calls === "number" ? data.calls : 0;
  const minutes = typeof data?.minutes === "number" ? data.minutes : 0;
  const qualified = typeof data?.qualified === "number" ? data.qualified : 0;

  return (
    <section>
      <h2 className="text-xl font-semibold tracking-tight mb-4">Usage</h2>
      <p className="text-white/70 mb-4">Non-PHI usage summaries. Detailed PHI metrics will live in the protected zone.</p>
      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-white/60">Calls</div>
          <div className="text-2xl font-semibold">{calls}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-white/60">Minutes</div>
          <div className="text-2xl font-semibold">{minutes}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-white/60">Qualified Leads</div>
          <div className="text-2xl font-semibold">{qualified}</div>
        </div>
      </div>
    </section>
  );
}
