export const dynamic = 'force-dynamic';

export default function Support() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Support
        </h1>
        <p className="mt-4 text-white/70">
          Need a hand? Tell us what’s going on and we’ll get back within one business day.
        </p>

        <form className="mt-10 grid gap-6">
          <div>
            <label className="text-sm text-white/70">Your email</label>
            <input
              type="email"
              required
              placeholder="you@company.com"
              className="mt-2 w-full rounded-md border border-white/20 bg-neutral-900 px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="text-sm text-white/70">Subject</label>
            <input
              type="text"
              required
              placeholder="Brief summary"
              className="mt-2 w-full rounded-md border border-white/20 bg-neutral-900 px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="text-sm text-white/70">Details</label>
            <textarea
              rows={6}
              required
              placeholder="Describe the issue or question…"
              className="mt-2 w-full rounded-md border border-white/20 bg-neutral-900 px-3 py-2 text-white"
            />
          </div>

          <button
            type="button"
            className="rounded-md bg-white px-5 py-3 font-medium text-black hover:bg-white/90"
            onClick={() => alert('Thanks! In production this will send your ticket.')}
          >
            Submit
          </button>
        </form>

        <p className="mt-8 text-sm text-white/60">
          Or email us directly: <a href="mailto:support@earlybird.ai" className="underline">support@earlybird.ai</a>
        </p>
      </div>
    </main>
  );
}
