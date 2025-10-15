import Link from "next/link";
import { PLAN_DEFINITIONS, getPlanPriceLabel, getPlanTrialBadge } from "@/lib/plans";
import { MobileCard, MobileCardContent, MobileCardHeader } from "@/components/mobile/Card";

export default function MobileLandingPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8 text-white">
      <section className="space-y-4 text-center">
        <span className="inline-flex items-center justify-center rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-wide text-white/60">
          Mobile preview
        </span>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          AI reception that feels personal—designed for your phone.
        </h1>
        <p className="text-base text-white/70">
          EarlyBird answers calls, books meetings, and syncs with your tools. Manage everything on the go with our mobile-first dashboard.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/m/dashboard"
            className="inline-flex h-12 w-full max-w-sm items-center justify-center rounded-full bg-white px-6 text-base font-semibold text-black shadow-lg shadow-black/20 transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40"
          >
            Go to mobile dashboard
          </Link>
          <Link
            href="/pricing"
            className="inline-flex h-12 w-full max-w-sm items-center justify-center rounded-full border border-white/20 px-6 text-base font-semibold text-white/80 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            View desktop site
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Plans for every team</h2>
        <p className="text-sm text-white/60">
          Unified pricing across desktop and mobile. Pick your plan on either surface; it’s the same catalog and billing flow.
        </p>
        <div className="grid gap-4">
          {PLAN_DEFINITIONS.map((plan) => (
            <MobileCard key={plan.slug}>
              <MobileCardHeader
                title={
                  <div className="flex items-center justify-between gap-3">
                    <span>{plan.name}</span>
                    {plan.tag ? (
                      <span className="rounded-full border border-white/15 px-2 py-0.5 text-xs text-white/70">
                        {plan.tag}
                      </span>
                    ) : null}
                  </div>
                }
                subtitle={`${getPlanPriceLabel(plan)} • ${plan.includedMinutes.toLocaleString()} minutes`}
              />
              <MobileCardContent>
                {plan.blurb ? <p className="text-white/70">{plan.blurb}</p> : null}
                <ul className="mt-3 space-y-1 text-sm text-white/70">
                  {plan.features.slice(0, 4).map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-white/40" aria-hidden />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                {plan.trialAvailable ? (
                  <span className="mt-3 inline-flex items-center rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                    {getPlanTrialBadge(plan)}
                  </span>
                ) : null}
                <Link
                  href={`/m/dashboard/billing?plan=${plan.slug}`}
                  className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-full bg-white text-sm font-semibold text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
                >
                  Choose {plan.name}
                </Link>
              </MobileCardContent>
            </MobileCard>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Need the desktop app?</h2>
        <p className="text-sm text-white/60">
          Switch back any time. Append <code className="rounded bg-white/10 px-2 py-1 text-xs">?desktop=1</code> to stay on desktop from your phone.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex h-12 w-full items-center justify-center rounded-full border border-white/20 px-6 text-base font-semibold text-white/80 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        >
          Open desktop dashboard
        </Link>
      </section>
    </div>
  );
}
