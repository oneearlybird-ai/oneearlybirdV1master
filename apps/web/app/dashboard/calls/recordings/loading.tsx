export default function LoadingRecordings() {
  return (
    <section>
      <h2 className="text-xl font-semibold tracking-tight mb-2">Recordings</h2>
      <div className="text-sm text-white/60">Loading…</div>
      <div className="mt-3 overflow-x-auto rounded-2xl border border-white/10 bg-white/5 animate-pulse">
        <div className="h-10 border-b border-white/10" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-12 border-t border-white/10" />
        ))}
      </div>
    </section>
  );
}

