import Link from "next/link";

export const dynamic = 'force-static';

export default function Support() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white">
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Support</h1>
        <p className="mt-4 max-w-2xl text-white/70">
          We’re here to help. For urgent production issues, include your project ID and recent call IDs.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {/* Contact card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-medium">Contact</h2>
            <p className="mt-2 text-white/70">Email or submit a ticket and we’ll respond ASAP.</p>
            <div className="mt-6 flex gap-3">
              <a
                href="mailto:support@earlybird.example"
                className="rounded-xl bg-white px-5 py-3 font-medium text-black"
              >
                Email Support
              </a>
              <Link
                href="/docs"
                className="rounded-xl border border-white/20 px-5 py-3 font-medium text-white/80 hover:text-white"
              >
                Read Docs
              </Link>
            </div>
          </div>

          {/* Simple static form (no JS handlers) */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-medium">Submit a ticket</h2>
            <p className="mt-2 text-white/70">This static demo does not send; use Email Support for now.</p>
            <form action="#" method="get" className="mt-4 space-y-4">
              <div>
                <label className="text-sm text-white/70">Email</label>
                <input
                  type="email"
                  required
                  className="mt-2 w-full rounded-md border border-white/20 bg-neutral-900 px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-white/70">Subject</label>
                <input
                  type="text"
                  required
                  className="mt-2 w-full rounded-md border border-white/20 bg-neutral-900 px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-white/70">Details</label>
                <textarea
                  rows={4}
                  required
                  className="mt-2 w-full rounded-md border border-white/20 bg-neutral-900 px-3 py-2 text-white"
                ></textarea>
              </div>
              {/* Regular submit, no onClick */}
              <button
                type="submit"
                className="w-full rounded-md bg-white text-black py-2 font-medium hover:bg-white/90"
                title="Static preview"
              >
                Submit
              </button>
            </form>
          </div>
        </div>

        <p className="mt-6 text-sm text-white/60">
          For status updates and maintenance windows, see <Link href="/changelog" className="underline">Changelog</Link>.
        </p>
      </section>
    </main>
  );
}
