export const dynamic = "force-dynamic";
export default function KnowledgePage() {
  return (
    <section className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold tracking-tight text-white">Knowledge Base</h1>
      <p className="mt-2 text-sm text-white/70">FAQ entries the agent uses (CRUD with version notes). Placeholder grid below.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-[0_20px_60px_rgba(5,8,20,0.35)] backdrop-blur"
          >
            <div className="text-sm font-semibold text-white">FAQ {i}</div>
            <div className="mt-2 text-xs text-white/60">Short answer preview…</div>
            <button
              type="button"
              className="mt-3 inline-flex rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:text-white"
            >
              View entry
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
