export const dynamic = 'force-static';

export default function Changelog() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white px-6 py-16">
      <section className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Changelog</h1>
        <p className="mt-4 text-white/70">
          Shipping notes and improvements to EarlyBird.
        </p>

        <div className="mt-10 space-y-10">
          <article>
            <h2 className="text-xl font-medium">v0.1.4 — Landing & Legal</h2>
            <ul className="mt-3 list-disc pl-5 text-white/80 space-y-1">
              <li>Added Privacy and Terms pages (static, server-safe).</li>
              <li>Docs, Support, ROI content pages.</li>
              <li>Unified header/footer via root layout.</li>
              <li>Removed client handlers from server components.</li>
            </ul>
          </article>

          <article>
            <h2 className="text-xl font-medium">v0.1.3 — Navigation polish</h2>
            <ul className="mt-3 list-disc pl-5 text-white/80 space-y-1">
              <li>Consistent nav links (How it works, Integrations, Pricing, Docs, Support).</li>
              <li>Sticky top nav and single footer baseline.</li>
            </ul>
          </article>

          <article>
            <h2 className="text-xl font-medium">v0.1.2 — Initial scaffold</h2>
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
