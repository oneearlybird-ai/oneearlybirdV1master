import { dashboardFetch } from "@/lib/dashboardFetch";
export const dynamic = "force-dynamic";

async function getSummary() {
  try {
    const res = await dashboardFetch('/usage/summary', { cache: 'no-store' });
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
    <section className="mx-auto max-w-5xl">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight text-white">Usage</h1>
      <p className="mb-6 text-sm text-white/70">
        Non-PHI usage summaries. Detailed PHI metrics will live in the protected zone.
      </p>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-[0_24px_70px_rgba(5,8,20,0.45)] backdrop-blur">
          <div className="text-xs uppercase tracking-wide text-white/60">Calls</div>
          <div className="mt-2 text-3xl font-semibold text-white">{calls}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-[0_24px_70px_rgba(5,8,20,0.45)] backdrop-blur">
          <div className="text-xs uppercase tracking-wide text-white/60">Minutes</div>
          <div className="mt-2 text-3xl font-semibold text-white">{minutes}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-[0_24px_70px_rgba(5,8,20,0.45)] backdrop-blur">
          <div className="text-xs uppercase tracking-wide text-white/60">Qualified Leads</div>
          <div className="mt-2 text-3xl font-semibold text-white">{qualified}</div>
        </div>
      </div>
    </section>
  );
}
