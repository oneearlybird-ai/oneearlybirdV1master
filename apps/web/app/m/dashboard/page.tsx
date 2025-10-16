"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PlanActionButtons from "@/components/PlanActionButtons";
import { derivePlanDisplay, findPlanDefinition, formatIsoDate } from "@/lib/billing";
import { dashboardFetch } from "@/lib/dashboardFetch";
import { formatCallDuration, formatCallTimestamp, outcomeLabel } from "@/lib/call-format";
import { MobileCard, MobileCardContent, MobileCardHeader, MobileCardFooter } from "@/components/mobile/Card";
import BusinessSetupWizard from "@/components/business/BusinessSetupWizard";
import type { CallItem } from "@/components/RecentCallsPreview";
import { fallbackNameFromEmail, maskAccountNumber } from "@/lib/format";
import { toast } from "@/components/Toasts";

type TenantProfile = {
  planKey?: string | null;
  planPriceId?: string | null;
  minutesCap?: number | null;
  concurrencyCap?: number | null;
  did?: string | null;
  accountNumber?: string | null;
  firstName?: string | null;
  displayName?: string | null;
  contactEmail?: string | null;
  email?: string | null;
  businessName?: string | null;
  businessPhone?: string | null;
  timezone?: string | null;
  addressNormalized?: {
    line1: string;
    line2?: string | null;
    city: string;
    region: string;
    postal: string;
    country: string;
    lat?: number | null;
    lng?: number | null;
  } | null;
  hours?: Array<{ day: string; open: string; close: string }> | null;
  industry?: string | null;
  crm?: string | null;
  locations?: number | null;
  website?: string | null;
  businessProfileComplete?: boolean | null;
};

type BillingSummary = {
  status: "none" | "trial-active" | "trial-cancelled" | "active";
  planKey: string | null;
  planPriceId: string | null;
  planMinutes: number | null;
  minutesCap: number | null;
  concurrencyCap: number | null;
  trialEnd: string | null;
  currentPeriodEnd: string | null;
  hasPaymentMethod: boolean;
  trialEligible: boolean;
};

type UsagePeriod = {
  ts: string;
  answered?: number;
  booked?: number;
  deflected?: number;
};

type UsageSummary = {
  usedMinutes: number;
  minutesCap?: number | null;
  periods: UsagePeriod[];
};

type FetchState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

const initialState = <T,>(): FetchState<T> => ({
  data: null,
  loading: false,
  error: null,
});

function computeAnsweredPercentage(periods: UsagePeriod[]) {
  const totals = periods.reduce(
    (acc, period) => {
      acc.answered += Number(period.answered ?? 0);
      acc.booked += Number(period.booked ?? 0);
      return acc;
    },
    { answered: 0, booked: 0 },
  );
  const totalCalls = totals.answered + totals.booked;
  if (totalCalls === 0) return { answeredPct: 0, booked: 0 };
  return { answeredPct: Math.round((totals.answered / totalCalls) * 100), booked: totals.booked };
}

export default function MobileDashboardPage() {
  const [profile, setProfile] = useState<FetchState<TenantProfile>>(() => initialState<TenantProfile>());
  const [summary, setSummary] = useState<FetchState<BillingSummary>>(() => initialState<BillingSummary>());
  const [usage, setUsage] = useState<FetchState<UsageSummary>>(() => initialState<UsageSummary>());
  const [calls, setCalls] = useState<FetchState<CallItem[]>>(() => initialState<CallItem[]>());
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardDismissed, setWizardDismissed] = useState(false);

  const loadData = useCallback(async () => {
    setProfile((prev) => ({ ...prev, loading: true, error: null }));
    setSummary((prev) => ({ ...prev, loading: true, error: null }));
    setUsage((prev) => ({ ...prev, loading: true, error: null }));
    setCalls((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const [profileRes, summaryRes, usageRes, callsRes] = await Promise.all([
        dashboardFetch("/tenants/profile", { cache: "no-store" }),
        dashboardFetch("/billing/summary", { cache: "no-store" }),
        dashboardFetch("/usage/summary?window=week", { cache: "no-store" }),
        dashboardFetch("/calls/list", {
          method: "POST",
          cache: "no-store",
          body: JSON.stringify({ limit: 3 }),
        }),
      ]);

      if (profileRes.ok) {
        setProfile({ data: (await profileRes.json()) as TenantProfile, loading: false, error: null });
      } else {
        setProfile({ data: null, loading: false, error: `profile_${profileRes.status}` });
      }

      if (summaryRes.ok) {
        setSummary({ data: (await summaryRes.json()) as BillingSummary, loading: false, error: null });
      } else {
        setSummary({ data: null, loading: false, error: `summary_${summaryRes.status}` });
      }

      if (usageRes.ok) {
        setUsage({ data: (await usageRes.json()) as UsageSummary, loading: false, error: null });
      } else {
        setUsage({ data: null, loading: false, error: `usage_${usageRes.status}` });
      }

      if (callsRes.ok) {
        const json = (await callsRes.json()) as { items?: CallItem[] };
        setCalls({
          data: Array.isArray(json.items) ? json.items : [],
          loading: false,
          error: null,
        });
      } else {
        setCalls({ data: [], loading: false, error: `calls_${callsRes.status}` });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "fetch_failed";
      setProfile({ data: null, loading: false, error: message });
      setSummary({ data: null, loading: false, error: message });
      setUsage({ data: null, loading: false, error: message });
      setCalls({ data: [], loading: false, error: message });
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const needsBusinessSetup = useMemo(() => {
    if (profile.loading) return false;
    const data = profile.data;
    if (!data) return false;
    if (data.businessProfileComplete === true) return false;
    if (data.businessProfileComplete === false) return true;
    return !data.businessName || !data.addressNormalized;
  }, [profile.data, profile.loading]);

  useEffect(() => {
    if (needsBusinessSetup && !wizardDismissed) {
      setWizardOpen(true);
    }
  }, [needsBusinessSetup, wizardDismissed]);

  useEffect(() => {
    if (!needsBusinessSetup) {
      setWizardOpen(false);
    }
  }, [needsBusinessSetup]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const openWizard = () => {
      setWizardDismissed(false);
      if (needsBusinessSetup) {
        setWizardOpen(true);
      }
    };
    window.addEventListener("ob:billing:checkout:success", openWizard);
    window.addEventListener("ob:billing:trial:success", openWizard);
    return () => {
      window.removeEventListener("ob:billing:checkout:success", openWizard);
      window.removeEventListener("ob:billing:trial:success", openWizard);
    };
  }, [needsBusinessSetup]);

  const businessSeed = useMemo(() => {
    const data = profile.data;
    if (!data) return null;
    return {
      businessName: data.businessName ?? undefined,
      phoneE164: data.businessPhone ?? undefined,
      timezone: data.timezone ?? undefined,
      addressNormalized: data.addressNormalized ?? undefined,
      hours: data.hours ?? undefined,
      industry: data.industry ?? undefined,
      crm: data.crm ?? undefined,
      locations: data.locations ?? undefined,
      website: data.website ?? undefined,
    };
  }, [profile.data]);

  const handleWizardClose = useCallback((_completed: boolean) => {
    setWizardOpen(false);
    setWizardDismissed(true);
  }, []);

  const planLoaded = !profile.loading && !summary.loading;
  const planDisplay = planLoaded ? derivePlanDisplay(summary.data, profile.data) : null;
  const planStatus = summary.data?.status ?? "none";
  const trialEndLabel = planStatus === "trial-cancelled" ? formatIsoDate(summary.data?.trialEnd ?? null) : null;

  const answeredStats = useMemo(() => {
    if (!usage.data) return { answeredPct: 0, booked: 0 };
    return computeAnsweredPercentage(usage.data.periods ?? []);
  }, [usage.data]);

  const minutesUsed = usage.data?.usedMinutes ?? 0;
  const minutesCap = profile.data?.minutesCap ?? null;
  const planDefinition = useMemo(() => {
    return findPlanDefinition(summary.data?.planKey ?? profile.data?.planKey ?? null, summary.data?.planPriceId ?? profile.data?.planPriceId ?? null);
  }, [profile.data, summary.data]);
  const planError = profile.error || summary.error;
  const usageHasData = useMemo(() => {
    const minutes = Number(usage.data?.usedMinutes ?? usage.data?.minutesCap ?? 0);
    if (minutes > 0) return true;
    return (usage.data?.periods ?? []).some((period) => {
      const answered = Number(period.answered ?? 0);
      const booked = Number(period.booked ?? 0);
      const deflected = Number(period.deflected ?? 0);
      return answered > 0 || booked > 0 || deflected > 0;
    });
  }, [usage.data]);

  const maskedDid = profile.data?.did ? profile.data.did.replace(/^\+?(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,4})$/, (_, c1, c2, c3, c4) => {
    if (!c4) return profile.data?.did ?? "";
    return `+${c1 || ""}•••-${c3 || "•••"}-${c4}`;
  }) : "—";

  const greetingName = useMemo(() => {
    const data = profile.data;
    if (!data) return "there";
    const first = (data.firstName ?? "").toString().trim();
    if (first.length > 0) return first;
    const display = (data.displayName ?? "").toString().trim();
    if (display.length > 0) return display;
    const email = (data.contactEmail ?? data.email ?? "").toString();
    return fallbackNameFromEmail(email);
  }, [profile.data]);

  const accountNumberMask = useMemo(() => maskAccountNumber(profile.data?.accountNumber ?? null), [profile.data?.accountNumber]);

  const handleCopyAccount = useCallback(async () => {
    const value = profile.data?.accountNumber;
    if (!value) return;
    try {
      if (!navigator?.clipboard?.writeText) {
        throw new Error("clipboard_unavailable");
      }
      await navigator.clipboard.writeText(value);
      toast("Account number copied", "success");
    } catch (err) {
      console.error("account_copy_failed", err);
      toast("Couldn’t copy account number", "error");
    }
  }, [profile.data?.accountNumber]);

  return (
    <>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6 text-white">
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-white/50">Mobile dashboard</span>
          <h1 className="text-2xl font-semibold">Welcome back, {greetingName}</h1>
          <p className="text-sm text-white/60">Manage plan, calls, and routing without leaving your phone.</p>
          {accountNumberMask ? (
            <button
              type="button"
              onClick={handleCopyAccount}
              className="mt-2 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              aria-label="Copy account number"
            >
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span className="font-medium">{accountNumberMask}</span>
            </button>
          ) : null}
        </div>

      {!usageHasData ? (
        <MobileCard>
          <MobileCardContent>
            <p className="text-sm text-white/60">
              No usage yet. Your insights will appear here after the first calls.
            </p>
          </MobileCardContent>
        </MobileCard>
      ) : null}

      {planLoaded && planDisplay ? (
        <MobileCard>
          <MobileCardHeader title={planDisplay.value} subtitle={planDisplay.hint ?? "Current subscription status"} />
          <MobileCardContent>
            <div className="flex flex-wrap gap-2 text-xs text-white/60">
              <span className="rounded-full border border-white/10 px-2 py-1">
                {planStatus === "trial-active"
                  ? "Trial active"
                  : planStatus === "trial-cancelled"
                    ? trialEndLabel ? `Trial ends ${trialEndLabel}` : "Trial cancelled"
                    : planStatus === "active"
                      ? "Active plan"
                      : "No current plan"}
              </span>
              {planDefinition ? (
                <span className="rounded-full border border-white/10 px-2 py-1">
                  {planDefinition.includedMinutes.toLocaleString()} min included
                </span>
              ) : null}
              <span className="rounded-full border border-white/10 px-2 py-1">DID: {maskedDid}</span>
            </div>
          </MobileCardContent>
          <MobileCardFooter>
            <div className="flex w-full flex-col gap-2">
              <PlanActionButtons summary={summary.data} profile={profile.data} onRefresh={loadData} align="start" />
              {planStatus === "none" ? (
                <p className="text-xs text-white/60">
                  No current plan. Purchase a plan to keep EarlyBird active.
                </p>
              ) : null}
              {planStatus === "trial-cancelled" ? (
                <p className="text-xs text-white/60">
                  Trial ended{trialEndLabel ? ` ${trialEndLabel}` : ""}. Choose a plan to continue uninterrupted service.
                </p>
              ) : null}
            </div>
          </MobileCardFooter>
        </MobileCard>
      ) : planError ? (
        <MobileCard>
          <MobileCardContent>
            <p className="text-sm text-rose-200">
              We couldn’t load your plan details. Pull to refresh or try again soon.
            </p>
          </MobileCardContent>
        </MobileCard>
      ) : (
        <MobileCard>
          <MobileCardContent>
            <div className="h-6 w-32 rounded bg-white/10 animate-pulse" aria-hidden />
            <div className="mt-3 flex gap-2">
              <span className="h-5 w-20 rounded-full bg-white/10 animate-pulse" aria-hidden />
              <span className="h-5 w-24 rounded-full bg-white/10 animate-pulse" aria-hidden />
            </div>
          </MobileCardContent>
          <MobileCardFooter>
            <div className="h-10 rounded-xl border border-white/10 bg-white/5 animate-pulse" aria-hidden />
          </MobileCardFooter>
        </MobileCard>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {usage.loading ? (
          <MobileCard className="sm:col-span-1">
            <MobileCardContent>
              <div className="h-6 w-20 rounded bg-white/10 animate-pulse" aria-hidden />
              <div className="mt-2 h-4 w-16 rounded bg-white/10 animate-pulse" aria-hidden />
            </MobileCardContent>
          </MobileCard>
        ) : usage.error ? (
          <MobileCard className="sm:col-span-1">
            <MobileCardContent>
              <p className="text-sm text-rose-200">Usage data unavailable. Pull to refresh.</p>
            </MobileCardContent>
          </MobileCard>
        ) : (
          <MobileCard className="sm:col-span-1">
            <MobileCardHeader title="Answered rate" subtitle="Past 7 days" />
            <MobileCardContent>
              <div className="text-3xl font-semibold">{answeredStats.answeredPct}%</div>
              <p className="mt-1 text-sm text-white/60">Booked {answeredStats.booked} meetings</p>
            </MobileCardContent>
          </MobileCard>
        )}
        {usage.loading ? (
          <MobileCard className="sm:col-span-1">
            <MobileCardContent>
              <div className="h-6 w-24 rounded bg-white/10 animate-pulse" aria-hidden />
              <div className="mt-2 h-5 w-16 rounded bg-white/10 animate-pulse" aria-hidden />
            </MobileCardContent>
          </MobileCard>
        ) : usage.error ? (
          <MobileCard className="sm:col-span-1">
            <MobileCardContent>
              <p className="text-sm text-rose-200">Minutes used will return once data reloads.</p>
            </MobileCardContent>
          </MobileCard>
        ) : (
          <MobileCard className="sm:col-span-1">
            <MobileCardHeader
              title="Minutes used"
              subtitle={
                planDefinition
                  ? `${planDefinition.includedMinutes.toLocaleString()} included minutes`
                  : minutesCap
                    ? `${minutesCap.toLocaleString()} plan minutes`
                    : "No cap"
              }
            />
            <MobileCardContent>
              <div className="text-3xl font-semibold">{Math.round(minutesUsed)}</div>
              {planDefinition && planDefinition.includedMinutes > 0 ? (
                <p className="mt-1 text-sm text-white/60">
                  {Math.min(100, Math.round((minutesUsed / Math.max(1, planDefinition.includedMinutes)) * 100))}% of plan
                </p>
              ) : null}
            </MobileCardContent>
          </MobileCard>
        )}
        {profile.loading ? (
          <MobileCard className="sm:col-span-1">
            <MobileCardContent>
              <div className="h-6 w-16 rounded bg-white/10 animate-pulse" aria-hidden />
              <div className="mt-2 h-4 w-24 rounded bg-white/10 animate-pulse" aria-hidden />
            </MobileCardContent>
          </MobileCard>
        ) : profile.error ? (
          <MobileCard className="sm:col-span-1">
            <MobileCardContent>
              <p className="text-sm text-rose-200">Concurrency information unavailable.</p>
            </MobileCardContent>
          </MobileCard>
        ) : (
          <MobileCard className="sm:col-span-1">
            <MobileCardHeader title="Concurrency" subtitle="Agent + passthrough" />
            <MobileCardContent>
              <div className="text-3xl font-semibold">
                {profile.data?.concurrencyCap ?? "—"}
              </div>
              <p className="mt-1 text-sm text-white/60">Simultaneous calls supported</p>
            </MobileCardContent>
          </MobileCard>
        )}
      </div>

      <MobileCard>
        <MobileCardHeader
          title="Recent calls"
          subtitle={
            <Link href="/m/dashboard/calls" className="text-xs font-medium text-emerald-200 underline">
              View all
            </Link>
          }
        />
        <MobileCardContent>
          {calls.loading && !calls.data?.length ? (
            <div className="space-y-3" aria-hidden>
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="rounded-xl border border-white/10 p-3">
                  <div className="skeleton skeleton-line w-32" />
                  <div className="mt-2 skeleton skeleton-line w-24" />
                </div>
              ))}
            </div>
          ) : calls.error ? (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
              Failed to load calls. {calls.error.replace(/_/g, " ")}
            </div>
          ) : (calls.data?.length ?? 0) === 0 ? (
            <p className="text-sm text-white/60">No calls yet. Once calls arrive they’ll show here.</p>
          ) : (
            <div className="space-y-3">
              {calls.data?.map((call) => (
                <div key={call.id} className="rounded-xl border border-white/10 p-3">
                  <div className="flex items-center justify-between text-sm text-white/70">
                    <span>{formatCallTimestamp(call.ts)}</span>
                    <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-white/60">
                      {outcomeLabel(call.outcome)}
                    </span>
                  </div>
                  <div className="mt-2 text-lg font-semibold text-white">
                    {call.from ? call.from.replace(/^\+?1?/, "+1 ") : "Unknown caller"}
                  </div>
                  <div className="mt-1 text-xs text-white/50">Duration {formatCallDuration(call.durationSec)}</div>
                  <div className="mt-3 flex gap-2">
                    <Link
                      href={`/m/dashboard/calls?call=${call.id}`}
                      className="inline-flex flex-1 items-center justify-center rounded-full border border-white/20 px-3 py-2 text-sm text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                    >
                      Details
                    </Link>
                    <Link
                      href={`/m/dashboard/calls?call=${call.id}&tab=recording`}
                      className="inline-flex flex-1 items-center justify-center rounded-full border border-white/20 px-3 py-2 text-sm text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                    >
                      Play
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </MobileCardContent>
      </MobileCard>

      <button
        type="button"
        onClick={() => void loadData()}
        className="mt-2 inline-flex h-12 items-center justify-center rounded-full border border-white/20 px-6 text-sm font-semibold text-white/80 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
      >
        Refresh data
      </button>
      </div>
      <BusinessSetupWizard
        open={wizardOpen}
        onClose={handleWizardClose}
        onCompleted={() => {
          void loadData();
        }}
        seed={businessSeed}
        variant="sheet"
      />
    </>
  );
}
