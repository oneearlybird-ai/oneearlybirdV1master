import Link from "next/link";
import { PLAN_DEFINITIONS, getPlanPriceLabel, getPlanTrialBadge } from "@/lib/plans";
import { MobileCard, MobileCardContent, MobileCardHeader } from "@/components/mobile/Card";

export default function MobileLandingPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-8 text-white">
      <section className="space-y-5 text-center">
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          AI receptionist that feels personal, designed for your business.
        </h1>
        <p className="text-base text-white/70">
          EarlyBird answers calls, books meetings, and routes conversations to your team—while staying on-brand. Track every interaction, listen to
          recordings, and manage billing wherever you are.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/m/pricing"
            className="inline-flex h-12 w-full max-w-sm items-center justify-center rounded-full bg-white px-6 text-base font-semibold text-black shadow-lg shadow-black/20 transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40"
          >
            View pricing
          </Link>
          <Link
            href="/m#how-it-works"
            className="inline-flex h-12 w-full max-w-sm items-center justify-center rounded-full border border-white/20 px-6 text-base font-semibold text-white/80 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            How it works
          </Link>
        </div>
      </section>

      <section id="how-it-works" className="space-y-4">
        <h2 className="text-xl font-semibold text-center">How it works</h2>
        <div className="grid gap-4">
          <MobileCard>
            <MobileCardHeader title="1. Connect your number" subtitle="Port or forward your business line" />
            <MobileCardContent>
              Link Google or Microsoft calendars, set routing rules, and choose whether calls stay with EarlyBird or reach your team.
            </MobileCardContent>
          </MobileCard>
          <MobileCard>
            <MobileCardHeader title="2. EarlyBird answers 24/7" subtitle="Natural voice, on-brand scripts" />
            <MobileCardContent>
              Every caller gets qualified, scheduled, or routed instantly. FAQs, CRM notes, and transcripts sync back to your workspace.
            </MobileCardContent>
          </MobileCard>
          <MobileCard>
            <MobileCardHeader title="3. Review from anywhere" subtitle="Dashboards built for mobile" />
            <MobileCardContent>
              Monitor calls, listen to recordings, manage billing, and update routing controls right from your phone.
            </MobileCardContent>
          </MobileCard>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-center">Plans for every team</h2>
        <p className="text-sm text-white/60 text-center">
          One catalog across desktop and mobile. Start a trial or upgrade from either surface—everything stays in sync.
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
                  href="/m/pricing"
                  className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-full border border-white/20 text-sm font-semibold text-white/80 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                >
                  Compare plans
                </Link>
              </MobileCardContent>
            </MobileCard>
          ))}
        </div>
      </section>
    </div>
  );
}
