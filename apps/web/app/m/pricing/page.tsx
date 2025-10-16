import Link from "next/link";
import type { Metadata } from "next";
import { PLAN_DEFINITIONS, getPlanPriceLabel, getPlanTrialBadge } from "@/lib/plans";
import { MobileCard, MobileCardContent, MobileCardHeader } from "@/components/mobile/Card";

export const metadata: Metadata = {
  title: "Mobile Pricing",
  description: "Plans and pricing for EarlyBird on the mobile experience.",
};

export default function MobilePricingPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 text-white">
      <header className="space-y-3 text-center">
        <h1 className="text-3xl font-semibold leading-tight">Simple pricing, same catalog</h1>
        <p className="text-sm text-white/60">
          The same plans power desktop and mobile. Start a trial or upgrade here and pick up where you left off on any device.
        </p>
      </header>
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
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-white/40" aria-hidden />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              {plan.trialAvailable ? (
                <span className="mt-3 inline-flex items-center rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                  {getPlanTrialBadge(plan)}
                </span>
              ) : null}
              <Link
                href="/m/dashboard/billing"
                className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-full bg-white text-sm font-semibold text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
              >
                Manage plan
              </Link>
            </MobileCardContent>
          </MobileCard>
        ))}
      </div>
    </div>
  );
}
