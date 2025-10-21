"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { dashboardFetch } from "@/lib/dashboardFetch";
import { LiveStatusBadge, RecentCallsPreview } from "@/components/RecentCallsPreview";
import CopyDiagnostics from "@/components/CopyDiagnostics";
import CopyOrgIdButton from "@/components/CopyOrgIdButton";
import CopyPageLinkButton from "@/components/CopyPageLinkButton";
import { derivePlanDisplay, findPlanDefinition, formatIsoDate } from "@/lib/billing";
import PlanActionButtons from "@/components/PlanActionButtons";
import BusinessSetupWizard from "@/components/business/BusinessSetupWizard";
import TrialConfirmationModal from "@/components/billing/TrialConfirmationModal";
import PlanCheckoutButtons from "@/components/PlanCheckoutButtons";
import { getAccountSettingsPath } from "@/lib/authPaths";
import { redirectTo } from "@/lib/clientNavigation";
import { toast } from "@/components/Toasts";
import type { PlanDefinition } from "@/lib/plans";

const PortingBanner = dynamic(() => import("@/components/PortingBanner"), { ssr: false });

type TenantProfile = {
  authenticated: boolean;
  tenantId: string;
  planKey?: string | null;
  planPriceId?: string | null;
  status?: string | null;
  minutesCap?: number | null;
  concurrencyCap?: number | null;
  did?: string | null;
  conversionAt?: string | null;
  accountNumber?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  email?: string | null;
  businessName?: string | null;
  businessPhone?: string | null;
  timezone?: string | null;
  businessEmail?: string | null;
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
  aiConsent?: boolean | null;
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
  avgDuration?: number;
};

type UsageSummary = {
  tenantId: string;
  window: string;
  usedMinutes: number;
  monthlyMinutes: number;
  minutesCap?: number | null;
  concurrencyCap?: number | null;
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


function formatMinutes(value: number | null | undefined): string {
  if (!Number.isFinite(value as number)) return "—";
  return `${Math.round(Number(value))}`;
}

function formatMinutesWithCap(used: number | null | undefined, cap: number | null | undefined): { label: string; progress: number } {
  if (!Number.isFinite(used as number)) {
    return { label: "—", progress: 0 };
  }
  if (Number.isFinite(cap as number) && cap && cap > 0) {
    const progress = Math.min(1, Math.max(0, Number(used) / cap));
    return { label: `${Math.round(Number(used))} / ${Math.round(Number(cap))}`, progress };
  }
  return { label: `${Math.round(Number(used))}`, progress: 0 };
}

function secondsToDurationLabel(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "—";
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs.toString().padStart(2, "0")}s`;
}

function aggregatePeriods(periods: UsagePeriod[]) {
  const totals = periods.reduce(
    (acc, period) => {
      const answered = Number(period.answered ?? 0);
      const booked = Number(period.booked ?? 0);
      const deflected = Number(period.deflected ?? 0);
      const avg = Number(period.avgDuration ?? 0);
      acc.answered += answered;
      acc.booked += booked;
      acc.deflected += deflected;
      if (avg > 0) {
        const weight = answered > 0 ? answered : 1;
        acc.totalDuration += avg * weight;
        acc.durationWeight += weight;
      }
      return acc;
    },
    { answered: 0, booked: 0, deflected: 0, totalDuration: 0, durationWeight: 0 },
  );
  const avgDuration = totals.durationWeight > 0 ? totals.totalDuration / totals.durationWeight : 0;
  return { ...totals, avgDuration };
}

function computeSparklinePoints(series: number[]): string {
  if (!series.length) return "";
  const max = Math.max(...series, 1);
  return series
    .map((value, index) => {
      const x = (index / Math.max(1, series.length - 1)) * 100;
      const y = 100 - (Math.max(0, value) / max) * 100;
      return `${x},${y}`;
    })
    .join(" ");
}

function Kpi({
  label,
  value,
  hint,
  progress,
  thresholds = [],
  progressClassName,
  footer,
}: {
  label: string;
  value: string;
  hint?: string;
  progress?: number;
  thresholds?: number[];
  progressClassName?: string;
  footer?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs text-white/60">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {hint ? <div className="mt-1 text-xs text-white/50">{hint}</div> : null}
      {typeof progress === "number" && (progress > 0 || thresholds.length > 0) ? (
        <div className="relative mt-3 h-2 w-full overflow-hidden rounded bg-white/5" aria-hidden title={`${Math.round(progress * 100)}%`}>
          <div className={`h-full ${progressClassName ?? "bg-white/10"}`} style={{ width: `${Math.max(0, Math.min(100, progress * 100))}%` }} />
          {thresholds.map((threshold) => (
            <span
              key={threshold}
              className="pointer-events-none absolute inset-y-0 w-px bg-white/40"
              style={{ left: `${Math.max(0, Math.min(100, threshold * 100))}%` }}
            />
          ))}
        </div>
      ) : null}
      {footer ? <div className="mt-2 text-xs text-white/60">{footer}</div> : null}
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 animate-pulse" aria-hidden>
      <div className="h-3 w-20 rounded bg-white/10" />
      <div className="mt-3 h-7 w-24 rounded bg-white/10" />
      <div className="mt-2 h-3 w-16 rounded bg-white/5" />
    </div>
  );
}

function InlineErrorCard({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-200">
      {message}
    </div>
  );
}

export default function DashboardPage() {
  const mountedRef = useRef(true);
  const [profileState, setProfileState] = useState<FetchState<TenantProfile>>(() => initialState<TenantProfile>());
  const [usageState, setUsageState] = useState<FetchState<UsageSummary>>(() => initialState<UsageSummary>());
  const [summaryState, setSummaryState] = useState<FetchState<BillingSummary>>(() => initialState<BillingSummary>());
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardDismissed, setWizardDismissed] = useState(false);
  const [trialModalOpen, setTrialModalOpen] = useState(false);
  const [trialPlan, setTrialPlan] = useState<PlanDefinition | null>(null);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchAll = useCallback(async () => {
    setProfileState((prev) => ({ ...prev, loading: true, error: null }));
    setUsageState((prev) => ({ ...prev, loading: true, error: null }));
    setSummaryState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const [profileRes, usageRes, summaryRes] = await Promise.all([
        dashboardFetch("/tenants/profile", { cache: "no-store" }),
        dashboardFetch("/usage/summary?window=week", { cache: "no-store" }),
        dashboardFetch("/billing/summary", { cache: "no-store" }),
      ]);
      if (!mountedRef.current) return;

      if (profileRes.ok) {
        const json = (await profileRes.json()) as TenantProfile;
        setProfileState({ data: json, loading: false, error: null });
      } else {
        setProfileState({
          data: null,
          loading: false,
          error: `profile_${profileRes.status}`,
        });
      }

      if (usageRes.ok) {
        const json = (await usageRes.json()) as UsageSummary;
        setUsageState({ data: json, loading: false, error: null });
      } else {
        setUsageState({
          data: null,
          loading: false,
          error: `usage_${usageRes.status}`,
        });
      }

      if (summaryRes.ok) {
        const json = (await summaryRes.json()) as BillingSummary;
        setSummaryState({ data: json, loading: false, error: null });
      } else {
        setSummaryState({
          data: null,
          loading: false,
          error: `summary_${summaryRes.status}`,
        });
      }
    } catch (err) {
      if (!mountedRef.current) return;
      const message = err instanceof Error ? err.message : "fetch_failed";
      setProfileState({ data: null, loading: false, error: message });
      setUsageState({ data: null, loading: false, error: message });
      setSummaryState({ data: null, loading: false, error: message });
    }
  }, []);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const allowedOrigins = new Set([
      "https://oneearlybird.ai",
      "https://m.oneearlybird.ai",
      "https://www.oneearlybird.ai",
      "https://api.oneearlybird.ai",
    ]);
    const currentOrigin = typeof window !== "undefined" ? window.location.origin : "https://oneearlybird.ai";
    const allowedOrigin = allowedOrigins.has(currentOrigin) ? currentOrigin : "https://oneearlybird.ai";
    const refresh = () => {
      void fetchAll();
    };
    window.addEventListener("ob:auth:success", refresh);
    window.addEventListener("ob:billing:checkout:success", refresh);
    window.addEventListener("ob:billing:portal:returned", refresh);

    const search = new URLSearchParams(window.location.search);
    const sessionId = search.get("session_id");
    if (window.opener && sessionId) {
      window.opener.postMessage({ type: "billing:checkout:success", sessionId }, allowedOrigin);
      window.close();
    } else if (window.opener && window.name === "stripe-portal") {
      window.opener.postMessage({ type: "billing:portal:returned" }, allowedOrigin);
      window.close();
    } else if (window.opener && window.name === "oauth-google") {
      window.opener.postMessage(
        { type: "oauthResult", provider: "google", success: true },
        allowedOrigin,
      );
      window.opener.postMessage({ type: "auth-success" }, allowedOrigin);
      window.opener.postMessage({ type: "auth:success" }, allowedOrigin);
      window.opener.postMessage("auth-success", allowedOrigin);
      window.close();
    }
    if (sessionId) {
      search.delete("session_id");
      const next = `${window.location.pathname}${search.toString() ? `?${search.toString()}` : ""}${window.location.hash}`;
      window.history.replaceState(null, "", next);
    }

    return () => {
      window.removeEventListener("ob:auth:success", refresh);
      window.removeEventListener("ob:billing:checkout:success", refresh);
      window.removeEventListener("ob:billing:portal:returned", refresh);
    };
  }, [fetchAll]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handlePageShow = () => {
      void fetchAll();
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [fetchAll]);

  const profile = profileState.data;
  const needsBusinessSetup = useMemo(() => {
    if (profileState.loading) return false;
    if (!profile) return false;
    if (profile.businessProfileComplete === true) return false;
    if (profile.businessProfileComplete === false) return true;
    return !profile.businessName || !profile.addressNormalized;
  }, [profile, profileState.loading]);

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
    const handleCheckoutSuccess = () => {
      setWizardDismissed(false);
      redirectTo(getAccountSettingsPath("business"));
    };
    const handleTrialSuccess = () => {
      setWizardDismissed(false);
      toast("Starting trial…", "success");
      redirectTo(getAccountSettingsPath("business"));
      setTrialModalOpen(false);
      setTrialPlan(null);
      void fetchAll();
    };
    window.addEventListener("ob:billing:checkout:success", handleCheckoutSuccess);
    window.addEventListener("ob:billing:trial:success", handleTrialSuccess);
    return () => {
      window.removeEventListener("ob:billing:checkout:success", handleCheckoutSuccess);
      window.removeEventListener("ob:billing:trial:success", handleTrialSuccess);
    };
  }, [fetchAll]);

  const businessSeed = useMemo(() => {
    if (!profile) return null;
    return {
      businessName: profile.businessName ?? undefined,
      phoneE164: profile.businessPhone ?? undefined,
      timezone: profile.timezone ?? undefined,
      addressNormalized: profile.addressNormalized ?? undefined,
      hours: profile.hours ?? undefined,
      industry: profile.industry ?? undefined,
      crm: profile.crm ?? undefined,
      locations: profile.locations ?? undefined,
      website: profile.website ?? undefined,
      businessEmail: profile.businessEmail ?? profile.contactEmail ?? profile.email ?? undefined,
      contactEmail: profile.contactEmail ?? profile.email ?? undefined,
      contactPhone: profile.contactPhone ?? undefined,
      aiConsent: typeof profile.aiConsent === "boolean" ? profile.aiConsent : undefined,
    };
  }, [profile]);

  const usage = usageState.data;
  const summary = summaryState.data;

  const handleWizardClose = useCallback(
    (_completed: boolean) => {
      setWizardOpen(false);
      setWizardDismissed(true);
    },
    [],
  );

  const openTrialModal = useCallback((plan: PlanDefinition) => {
    setTrialPlan(plan);
    setTrialModalOpen(true);
  }, []);

  const closeTrialModal = useCallback(() => {
    setTrialModalOpen(false);
    setTrialPlan(null);
  }, []);

  const handleTrialTriggered = useCallback(() => {
    void fetchAll();
  }, [fetchAll]);

  const planDefinition = useMemo(
    () => findPlanDefinition(summary?.planKey ?? profile?.planKey ?? null, summary?.planPriceId ?? profile?.planPriceId ?? null),
    [profile, summary],
  );
  const activeTrialPlan = trialPlan ?? planDefinition ?? null;
  const planIncludedMinutes = planDefinition?.includedMinutes ?? null;
  const planLoaded = !profileState.loading && !summaryState.loading;
  const planDisplay = planLoaded ? derivePlanDisplay(summary ?? null, profile ?? null) : null;
  const planStatus = summary?.status ?? "none";
  const trialEndLabel = planStatus === "trial-cancelled" ? formatIsoDate(summary?.trialEnd ?? null) : null;

  const minutesCap = profile?.minutesCap ?? null;
  const concurrencyCap = profile?.concurrencyCap ?? null;

  const periodTotals = useMemo(() => aggregatePeriods(usage?.periods ?? []), [usage?.periods]);
  const sparklineSeries = useMemo(() => (usage?.periods ?? []).map((period) => Number(period.answered ?? 0)), [usage?.periods]);
  const sparklinePoints = useMemo(() => computeSparklinePoints(sparklineSeries), [sparklineSeries]);

  const planCapForUsage = planIncludedMinutes ?? minutesCap;
  const minutesLabel = usage
    ? formatMinutesWithCap(usage.monthlyMinutes ?? usage.usedMinutes ?? null, planCapForUsage ?? undefined)
    : { label: "—", progress: 0 };

  const minutesProgress = Math.max(0, Math.min(1, minutesLabel.progress));
  const hasMinutesCap = typeof planCapForUsage === "number" && Number.isFinite(planCapForUsage) && planCapForUsage > 0;
  const minutesThresholds = hasMinutesCap ? [0.5, 0.8, 0.95] : [];
  const minutesProgressClass = minutesProgress >= 0.95 ? "bg-rose-400" : minutesProgress >= 0.8 ? "bg-amber-400" : minutesProgress >= 0.5 ? "bg-amber-300" : "bg-emerald-400";

  const isSuspended = (profile?.status ?? "").toLowerCase() === "suspended";
  const showCardOnFileBanner = !isSuspended && planStatus === "trial-active" && summary?.hasPaymentMethod === true;
  const showAddCardBanner = !isSuspended && planStatus === "trial-active" && summary?.hasPaymentMethod === false;

  const avgDurationLabel = secondsToDurationLabel(periodTotals.avgDuration);
  const answeredLabel = String(periodTotals.answered || 0);
  const bookedLabel = String(periodTotals.booked || 0);
  const deflectedLabel = String(periodTotals.deflected || 0);
  const usageHasData = useMemo(() => {
    const minutes = Number(usage?.usedMinutes ?? usage?.monthlyMinutes ?? 0);
    if (minutes > 0) return true;
    return (usage?.periods ?? []).some((period) => {
      const answered = Number(period.answered ?? 0);
      const booked = Number(period.booked ?? 0);
      const deflected = Number(period.deflected ?? 0);
      return answered > 0 || booked > 0 || deflected > 0;
    });
  }, [usage?.monthlyMinutes, usage?.periods, usage?.usedMinutes]);

  const trialCountdownLabel = useMemo(() => {
    if (planStatus !== "trial-active") return null;
    const trialEndIso = summary?.trialEnd ?? profile?.conversionAt ?? null;
    if (!trialEndIso) return null;
    const endDate = new Date(trialEndIso);
    if (Number.isNaN(endDate.getTime())) return null;
    const nowUtc = new Date();
    const diffMs = endDate.getTime() - nowUtc.getTime();
    const diffDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    if (diffDays <= 0) return "Trial ending today";
    if (diffDays === 1) return "Trial ends in 1 day";
    return `Trial ends in ${diffDays} days`;
  }, [planStatus, profile?.conversionAt, summary?.trialEnd]);

  const planHint = useMemo(() => {
    const hints: string[] = [];
    if (planDisplay?.hint) hints.push(planDisplay.hint);
    if (trialCountdownLabel) hints.push(trialCountdownLabel);
    return hints.length > 0 ? hints.join(" • ") : undefined;
  }, [planDisplay?.hint, trialCountdownLabel]);

  return (
    <>
      <section className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Welcome back</h1>
      <p className="mt-2 text-white/70">
        Your AI receptionist is{" "}
        <span className="text-emerald-400">Active</span> and handling calls.{" "}
        <span className="ml-2">
          <LiveStatusBadge />
        </span>
      </p>
      <div className="mt-1 flex items-center gap-3 text-xs text-white/60">
        <span>
          What’s new:{" "}
          <a className="underline" href="/changelog">
            See latest updates
          </a>
        </span>
        <span className="hidden sm:inline">•</span>
        <span className="hidden sm:inline">
          <CopyPageLinkButton label="Copy dashboard link" />
        </span>
      </div>
      <PortingBanner />
      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          <div>
            <div className="font-medium">AI Receptionist is live</div>
            <div className="text-sm text-white/60">Answering, booking, and logging into your CRM</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href="/dashboard/calls" className="btn btn-primary">
            View Calls
          </a>
          <a href="/dashboard/integrations" className="btn btn-outline">
            Integrations
          </a>
        </div>
      </div>

      <div className="mt-6 grid gap-4 grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
        {planLoaded && planDisplay ? (
          <Kpi label="Current plan" value={planDisplay.value} hint={planHint} />
        ) : (profileState.error || summaryState.error) ? (
          <InlineErrorCard message="We couldn’t load your plan details. Please refresh." />
        ) : (
          <KpiSkeleton />
        )}
        {usageState.loading ? (
          <KpiSkeleton />
        ) : usageState.error ? (
          <InlineErrorCard message="Usage data is unavailable right now. Please try again." />
        ) : (
          <Kpi
            label="Minutes (month)"
            value={minutesLabel.label}
            hint={planCapForUsage ? `Plan cap ${formatMinutes(planCapForUsage)}` : undefined}
            progress={minutesProgress}
            thresholds={minutesThresholds}
            progressClassName={hasMinutesCap && minutesProgress > 0 ? minutesProgressClass : undefined}
            footer={trialCountdownLabel ? <span>{trialCountdownLabel}</span> : undefined}
          />
        )}
        {usageState.loading ? (
          <KpiSkeleton />
        ) : usageState.error ? (
          <InlineErrorCard message="We couldn’t load call metrics. Refresh to retry." />
        ) : (
          <Kpi
            label="Answered (7d)"
            value={answeredLabel}
            hint={concurrencyCap ? `Concurrency cap ${concurrencyCap}` : undefined}
          />
        )}
        {usageState.loading ? (
          <KpiSkeleton />
        ) : usageState.error ? (
          <InlineErrorCard message="Bookings will reappear once data reloads." />
        ) : (
          <Kpi label="Booked (7d)" value={bookedLabel} hint={`Voicemail deflected ${deflectedLabel}`} />
        )}
      </div>
      <div className="mt-3 space-y-3">
        {isSuspended ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-rose-500/50 bg-rose-500/10 px-4 py-4 text-sm text-rose-100 sm:flex-row sm:items-center sm:justify-between">
            <span>Trial limits reached. Add a card from Billing to continue — your agent and forwarding are paused.</span>
            {activeTrialPlan?.priceId ? (
              <PlanCheckoutButtons
                className="w-full sm:w-auto"
                priceId={activeTrialPlan.priceId}
                planName={activeTrialPlan.name}
                allowTrial={false}
                disableTrial
                purchaseLabel="Add card"
              />
            ) : null}
          </div>
        ) : null}
        {showCardOnFileBanner ? (
          <div className="rounded-2xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
            Card on file • Service will remain active at conversion.
          </div>
        ) : null}
        {showAddCardBanner && activeTrialPlan?.priceId ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-amber-400/50 bg-amber-400/10 px-4 py-4 text-sm text-amber-100 sm:flex-row sm:items-center sm:justify-between">
            <span>Add a card to activate calling — trial runs without a DID until a card is added.</span>
            <PlanCheckoutButtons
              className="w-full sm:w-auto"
              priceId={activeTrialPlan.priceId}
              planName={activeTrialPlan.name}
              allowTrial={false}
              disableTrial
              purchaseLabel="Add card"
            />
          </div>
        ) : null}
        {planLoaded ? (
          <PlanActionButtons summary={summary} profile={profile} onRefresh={fetchAll} onRequestTrial={openTrialModal} />
        ) : (profileState.error || summaryState.error) ? (
          <InlineErrorCard message="Plan actions unavailable while we reconnect. Try refreshing the page." />
        ) : (
          <div className="h-12 rounded-xl border border-white/10 bg-white/5 animate-pulse" aria-hidden />
        )}
      </div>

      {planStatus === "none" ? (
        <p className="mt-2 text-sm text-white/60">
          No current plan. Purchase a plan when you’re ready to keep EarlyBird handling calls.
        </p>
      ) : null}
      {planStatus === "trial-cancelled" ? (
        <p className="mt-2 text-sm text-white/60">
          Trial ended{trialEndLabel ? ` ${trialEndLabel}` : ""}. Select a plan to continue uninterrupted service.
        </p>
      ) : null}

      {usageHasData ? (
        <ThisWeekPanel
          periods={usage?.periods ?? []}
          sparklinePoints={sparklinePoints}
          totals={{
            answered: answeredLabel,
            booked: bookedLabel,
            deflected: deflectedLabel,
            avgDuration: avgDurationLabel,
          }}
        />
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-sm text-white/60">
          No usage yet. Once calls start flowing, live insights will appear here.
        </div>
      )}

      {(profileState.error || usageState.error) ? (
        <div className="mt-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
          {profileState.error ? <div>Profile error: {profileState.error}</div> : null}
          {usageState.error ? <div>Usage error: {usageState.error}</div> : null}
        </div>
      ) : null}

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
        <h2 className="font-medium">Quick links</h2>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <a href="/docs" className="btn btn-outline">
            Docs
          </a>
          <a href="/support" className="btn btn-outline">
            Support
          </a>
          <a href="/dashboard/billing" className="btn btn-outline">
            Billing
          </a>
          <CopyDiagnostics />
          <CopyOrgIdButton />
          <a href="/changelog" className="btn btn-outline">
            Changelog
          </a>
          <a
            href="mailto:support@earlybird.ai?subject=Report%20issue&body=Describe%20the%20issue%20you%E2%80%99re%20seeing%3A%0A%0AExpected%20result%3A%0AActual%20result%3A%0A%0AURL%3A%20%28paste%29%0A"
            className="btn btn-outline"
          >
            Report issue
          </a>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5">
        <div className="flex items-center justify-between p-4">
          <h2 className="font-medium">Recent calls</h2>
          <a className="text-sm text-white/80 hover:text-white" href="/dashboard/calls">
            View all
          </a>
        </div>
        <RecentCallsPreview />
      </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
          <h2 className="font-medium">Get set up</h2>
          <ul className="mt-2 space-y-2 text-sm text-white/80">
            <li>✅ Connect phone number (or <a className="underline" href="/support/porting">port your number</a>)</li>
            <li>✅ Connect Google Calendar</li>
            <li>⬜ Connect CRM (HubSpot/Salesforce)</li>
            <li>⬜ Customize greeting & FAQs</li>
            <li>⬜ Make a test call</li>
          </ul>
          <div className="mt-3 flex gap-3">
            <a href="/dashboard/integrations" className="btn btn-primary">
              Open Integrations
            </a>
            <a href="/dashboard/kb" className="btn btn-outline">
              Edit Greeting
            </a>
          </div>
        </div>
      </section>
      {activeTrialPlan?.priceId ? (
        <TrialConfirmationModal
          open={trialModalOpen}
          onClose={closeTrialModal}
          planName={activeTrialPlan.name}
          priceId={activeTrialPlan.priceId}
          includedMinutes={activeTrialPlan.includedMinutes}
          trialMinutes={activeTrialPlan.trialMinutes}
          onTrialTriggered={handleTrialTriggered}
        />
      ) : null}
      <BusinessSetupWizard
        open={wizardOpen}
        onClose={handleWizardClose}
        onCompleted={() => {
          void fetchAll();
        }}
        seed={businessSeed}
        variant="modal"
      />
    </>
  );
}

function ThisWeekPanel({
  periods,
  sparklinePoints,
  totals,
}: {
  periods: UsagePeriod[];
  sparklinePoints: string;
  totals: { answered: string; booked: string; deflected: string; avgDuration: string };
}) {
  return (
    <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-medium">This week</h2>
        <span className="text-sm text-white/60">Live snapshot</span>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-white/10 p-3">
          <div className="text-xs text-white/60">Answered (sparkline)</div>
          <svg viewBox="0 0 100 30" className="mt-1 h-12 w-full">
            {sparklinePoints ? (
              <polyline points={sparklinePoints} fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" />
            ) : (
              <line x1="0" y1="28" x2="100" y2="28" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
            )}
          </svg>
        </div>
        <div className="rounded-lg border border-white/10 p-3">
          <div className="text-xs text-white/60">Booked appts</div>
          <div className="text-lg font-semibold">{totals.booked}</div>
        </div>
        <div className="rounded-lg border border-white/10 p-3">
          <div className="text-xs text-white/60">Voicemail deflected</div>
          <div className="text-lg font-semibold">{totals.deflected}</div>
        </div>
        <div className="rounded-lg border border-white/10 p-3">
          <div className="text-xs text-white/60">Avg duration</div>
          <div className="text-lg font-semibold">{totals.avgDuration}</div>
        </div>
      </div>
      <div className="mt-3 text-xs text-white/60">Period count: {periods.length}</div>
    </div>
  );
}
