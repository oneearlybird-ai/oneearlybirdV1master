export default function ROIPage() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">ROI Calculator</h1>
        <p className="mt-3 text-white/70">
          A quick back-of-the-napkin view of savings from answering every call,
          booking faster, and deflecting routine questions.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-3xl font-semibold">99.9%</div>
            <div className="mt-1 text-white/70">answer rate</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-3xl font-semibold">~35s</div>
            <div className="mt-1 text-white/70">to book</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-3xl font-semibold">60–85%</div>
            <div className="mt-1 text-white/70">self-serve deflection</div>
          </div>
        </div>

        <form className="mt-10 grid gap-6">
          <div>
            <label className="text-sm text-white/70">Monthly inbound calls</label>
            <input type="number" placeholder="e.g. 1200"
              className="mt-2 w-full rounded-md border border-white/20 bg-neutral-900 px-3 py-2 text-white" />
          </div>
          <div>
            <label className="text-sm text-white/70">Close rate from answered calls</label>
            <input type="number" placeholder="e.g. 25"
              className="mt-2 w-full rounded-md border border-white/20 bg-neutral-900 px-3 py-2 text-white" />
          </div>
          <div>
            <label className="text-sm text-white/70">Avg. revenue per booking ($)</label>
            <input type="number" placeholder="e.g. 90"
              className="mt-2 w-full rounded-md border border-white/20 bg-neutral-900 px-3 py-2 text-white" />
          </div>

          <button
            type="button"
            className="rounded-md bg-white px-5 py-3 font-medium text-black hover:bg-white/90"
            onClick={() => alert('This is a static demo. The interactive calculator will wire up later.')}
          >
            Calculate
          </button>
        </form>

        <p className="mt-8 text-sm text-white/60">
          Numbers above are illustrative and depend on your industry and call mix.
        </p>
      </div>
    </main>
  );
}
