export default function LoadingCallDetail() {
  return (
    <section>
      <div className="flex items-center justify-between">
        <div className="h-6 w-48 rounded bg-white/10" />
        <div className="h-8 w-20 rounded border border-white/15" />
      </div>
      <div className="mt-6 grid gap-4 grid-cols-1 lg:grid-cols-3 animate-pulse">
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 h-64" />
        <div className="rounded-2xl border border-white/10 bg-white/5 h-64" />
      </div>
    </section>
  );
}

