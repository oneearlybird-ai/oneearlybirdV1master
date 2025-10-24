export const dynamic = "force-dynamic";
export default function KnowledgePage() {
  return (
    <section>
      <h2 className="text-xl font-semibold tracking-tight mb-4">Knowledge Base</h2>
      <p className="text-white/70">FAQ entries the agent uses (CRUD with version notes). Placeholder grid below.</p>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {[1,2,3].map((i)=> (
          <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-medium">FAQ {i}</div>
            <div className="mt-1 text-xs text-white/60">Short answer preview…</div>
          </div>
        ))}
      </div>
    </section>
  );
}

