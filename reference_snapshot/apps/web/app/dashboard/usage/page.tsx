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
      <h2>Usage</h2>
      <p>This surface shows non-PHI usage summaries. Detailed PHI metrics will live in the protected zone.</p>
      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
        <div className="p-3 border border-gray-200 rounded">
          <div className="text-xs opacity-70">Calls</div>
          <div className="text-2xl font-semibold">{calls}</div>
        </div>
        <div className="p-3 border border-gray-200 rounded">
          <div className="text-xs opacity-70">Minutes</div>
          <div className="text-2xl font-semibold">{minutes}</div>
        </div>
        <div className="p-3 border border-gray-200 rounded">
          <div className="text-xs opacity-70">Qualified Leads</div>
          <div className="text-2xl font-semibold">{qualified}</div>
        </div>
      </div>
    </section>
  );
}
