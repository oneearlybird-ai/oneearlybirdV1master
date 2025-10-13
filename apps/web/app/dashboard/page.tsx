"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { apiFetch } from "@/lib/http";
import { LiveStatusBadge, RecentCallsPreview } from "@/components/RecentCallsPreview";
import CopyDiagnostics from "@/components/CopyDiagnostics";
import CopyOrgIdButton from "@/components/CopyOrgIdButton";
import CopyPageLinkButton from "@/components/CopyPageLinkButton";
import { derivePlanDisplay } from "@/lib/billing";
import PlanActionButtons from "@/components/PlanActionButtons";

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
};

type BillingSummary = {
  status: "none" | "trial-active" | "active";
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

function Kpi({ label, value, hint, progress }: { label: string; value: string; hint?: string; progress?: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs text-white/60">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {hint ? <div className="mt-1 text-xs text-white/50">{hint}</div> : null}
      {typeof progress === "number" && progress > 0 ? (
        <div className="mt-3 h-2 w-full overflow-hidden rounded bg-white/5" aria-hidden title={`${Math.round(progress * 100)}%`}>
          <div className="h-full bg-white/10" style={{ width: `${Math.max(0, Math.min(100, progress * 100))}%` }} />
        </div>
      ) : null}
    </div>
  );
}

export default function DashboardPage() {
  const mountedRef = useRef(true);
  const [profileState, setProfileState] = useState<FetchState<TenantProfile>>(() => initialState<TenantProfile>());
  const [usageState, setUsageState] = useState<FetchState<UsageSummary>>(() => initialState<UsageSummary>());
  const [summaryState, setSummaryState] = useState<FetchState<BillingSummary>>(() => initialState<BillingSummary>());

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
        apiFetch("/tenants/profile", { cache: "no-store" }),
        apiFetch("/usage/summary?window=week", { cache: "no-store" }),
        apiFetch("/billing/summary", { cache: "no-store" }),
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
    const handlePageShow = () => {
      void fetchAll();
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [fetchAll]);

  const profile = profileState.data;
  const usage = usageState.data;
  const summary = summaryState.data;

  const planDisplay = useMemo(() => derivePlanDisplay(summary ?? null, profile ?? null), [summary, profile]);

  const minutesCap = summary?.minutesCap ?? profile?.minutesCap ?? usage?.minutesCap ?? null;
  const concurrencyCap = summary?.concurrencyCap ?? profile?.concurrencyCap ?? usage?.concurrencyCap ?? null;

  const periodTotals = useMemo(() => aggregatePeriods(usage?.periods ?? []), [usage?.periods]);
  const sparklineSeries = useMemo(() => (usage?.periods ?? []).map((period) => Number(period.answered ?? 0)), [usage?.periods]);
  const sparklinePoints = useMemo(() => computeSparklinePoints(sparklineSeries), [sparklineSeries]);

  const minutesLabel = formatMinutesWithCap(
    usage?.monthlyMinutes ?? usage?.usedMinutes ?? null,
    summary?.planMinutes ?? minutesCap,
  );

  const avgDurationLabel = secondsToDurationLabel(periodTotals.avgDuration);
  const answeredLabel = String(periodTotals.answered || 0);
  const bookedLabel = String(periodTotals.booked || 0);
  const deflectedLabel = String(periodTotals.deflected || 0);

  const now = new Date();
  const when = now.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" } as Intl.DateTimeFormatOptions);

  return (
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
        <span>{when}</span>
        <span>•</span>
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
        <Kpi label="Current plan" value={planDisplay.value} hint={planDisplay.hint} />
        <Kpi
          label="Minutes (month)"
          value={minutesLabel.label}
          hint={minutesCap ? `Minute cap ${formatMinutes(minutesCap)}` : undefined}
          progress={minutesLabel.progress}
        />
        <Kpi
          label="Answered (7d)"
          value={answeredLabel}
          hint={concurrencyCap ? `Concurrency cap ${concurrencyCap}` : undefined}
        />
        <Kpi label="Booked (7d)" value={bookedLabel} hint={`Voicemail deflected ${deflectedLabel}`} />
      </div>
      <div className="mt-3">
        <PlanActionButtons summary={summary} profile={profile} onRefresh={fetchAll} />
      </div>

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
