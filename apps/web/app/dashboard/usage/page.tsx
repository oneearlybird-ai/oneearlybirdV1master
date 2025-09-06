export const dynamic = "force-dynamic";
async function getSummary() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/usage/summary`, { cache: "no-store" });
  try { return await res.json(); } catch { return { ok:false }; }
}
export default async function UsagePage() {
  const data = await getSummary();
  return (
    <section>
      <h2>Usage</h2>
      <p>This surface shows non-PHI usage summaries. Detailed PHI metrics will live in the protected zone.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16 }}>
        <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Calls</div>
          <div style={{ fontSize: 24, fontWeight: 600 }}>{data?.calls ?? "—"}</div>
        </div>
        <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Minutes</div>
          <div style={{ fontSize: 24, fontWeight: 600 }}>{data?.minutes ?? "—"}</div>
        </div>
        <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Qualified Leads</div>
          <div style={{ fontSize: 24, fontWeight: 600 }}>{data?.qualified ?? "—"}</div>
        </div>
      </div>
    </section>
  );
}
