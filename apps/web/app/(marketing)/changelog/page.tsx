export const dynamic = "force-static";

import CopyLinkButton from "@/components/CopyLinkButton";
import Section from "@/components/stellar/Section";

const releases = [
  {
    id: "v0-9-0",
    version: "v0.9.0",
    date: "2025-10-15",
    tag: "Latest",
    summary: "Stellar marketing + auth refresh",
    notes: [
      "Migrated landing, pricing, and preview flows to the Stellar layout with live session-aware header states.",
      "Inline login/signup tabs with Google OAuth popup + fallback; cookie-auth contract unchanged.",
      "Tailwind v4 + Next 15.1 upgrade with MDX-ready pipeline, compatibility shim for existing eb-* utilities.",
    ],
  },
  {
    id: "v0-8-2",
    version: "v0.8.2",
    date: "2025-09-16",
    summary: "Legal & docs refresh",
    notes: [
      "Added dedicated Privacy, Terms, and Support pages with consistent styling.",
      "Documentation now covers porting, authentication guardrails, and signed webhook setup.",
      "Navigation links consolidated across desktop, mobile, and dashboard shells.",
    ],
  },
  {
    id: "v0-8-0",
    version: "v0.8.0",
    date: "2025-09-10",
    summary: "Initial public launch",
    notes: [
      "Published EarlyBird marketing site with hero, feature tour, and ROI highlights.",
      "Introduced pricing tiers with checkout CTAs connected to live Stripe plans.",
      "Baseline accessibility pass (focus outlines, reduced-motion toggles, skip link).",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="flex flex-col">
      <section className="px-5 pt-20 pb-10 sm:px-6 md:pt-28">
        <div className="mx-auto max-w-3xl">
          <span className="stellar-pill">Changelog</span>
          <h1 className="mt-6 text-4xl font-semibold text-white md:text-5xl">What’s new in EarlyBird.</h1>
          <p className="mt-6 text-base text-white/70 md:text-lg">
            Release notes for marketing, auth, and dashboard surfaces. Every entry includes the guardrails we verified before rollout.
          </p>
        </div>
      </section>

      <Section>
        <div className="mx-auto flex max-w-3xl flex-col gap-10">
          {releases.map((release) => (
            <article key={release.id} id={release.id} className="rounded-3xl border border-white/12 bg-white/5 p-6 md:p-8">
              <header className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-white">
                    {release.version} — {release.summary}
                  </h2>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/50">{release.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  {release.tag ? (
                    <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/70">
                      {release.tag}
                    </span>
                  ) : null}
                  <CopyLinkButton anchorId={release.id} />
                </div>
              </header>
              <ul className="mt-5 list-disc space-y-3 pl-5 text-sm text-white/80">
                {release.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Need more detail?"
        title="Join the rollout mailing list or request a deep dive."
        description="We share CSP reports, Lighthouse results, and regression notes for every significant change. Hit reply to any changelog email and it goes straight to the engineering team."
      >
        <div className="stellar-grid-card bg-white/5">
          <p className="text-sm text-white/75">Email</p>
          <a
            href="mailto:updates@oneearlybird.ai"
            className="mt-2 inline-flex items-center rounded-2xl border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/35 hover:text-white"
          >
            updates@oneearlybird.ai
          </a>
        </div>
      </Section>
    </div>
  );
}
