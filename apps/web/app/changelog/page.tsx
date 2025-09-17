export const dynamic = 'force-static';

export default function Changelog() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white px-6 py-16">
      <section className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Changelog</h1>
        <div className="mt-2 text-sm text-white/70">
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5">What’s new</span>
        </div>
        <p className="mt-4 text-white/70">
          Shipping notes and improvements to EarlyBird.
        </p>

        <div className="mt-10 space-y-10">
          <article>
            <h2 className="text-xl font-medium">v0.1.4 — Landing & Legal <span className="ml-2 align-middle text-xs rounded-full border border-white/15 bg-white/10 px-1.5 py-0.5 text-white/70">Latest</span></h2>
            <div className="mt-1 text-xs text-white/50">2025-09-16</div>
            <ul className="mt-3 list-disc pl-5 text-white/80 space-y-1">
              <li>Added Privacy and Terms pages (static, server-safe).</li>
              <li>Docs, Support, ROI content pages.</li>
              <li>Unified header/footer via root layout.</li>
              <li>Removed client handlers from server components.</li>
            </ul>
          </article>

          <article>
            <h2 className="text-xl font-medium">v0.1.3 — Navigation polish</h2>
            <div className="mt-1 text-xs text-white/50">2025-09-13</div>
            <ul className="mt-3 list-disc pl-5 text-white/80 space-y-1">
              <li>Consistent nav links (How it works, Integrations, Pricing, Docs, Support).</li>
              <li>Sticky top nav and single footer baseline.</li>
            </ul>
          </article>

          <article>
            <h2 className="text-xl font-medium">v0.1.2 — Initial scaffold</h2>
            <div className="mt-1 text-xs text-white/50">2025-09-10</div>
            <ul className="mt-3 list-disc pl-5 text-white/80 space-y-1">
              <li>Home page hero, stats, sections (static).</li>
              <li>Project structure under <code>apps/web/app</code>.</li>
            </ul>
          </article>
        </div>
      </section>
    </main>
  );
}
