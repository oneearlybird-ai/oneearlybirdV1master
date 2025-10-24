"use client";

export const dynamic = "force-dynamic";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PlanCheckoutButtons from "@/components/PlanCheckoutButtons";
import ManageBillingButton from "@/components/ManageBillingButton";
import { dashboardFetch } from "@/lib/dashboardFetch";
import { derivePlanDisplay, findPlanDefinition, formatIsoDate } from "@/lib/billing";
import { PLAN_DEFINITIONS, type PlanDefinition, getPlanPriceLabel, getPlanTrialBadge } from "@/lib/plans";
import PlanActionButtons from "@/components/PlanActionButtons";

type TenantProfile = {
  planKey?: string | null;
  planPriceId?: string | null;
  minutesCap?: number | null;
  concurrencyCap?: number | null;
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

type BillingHistoryItem = {
  id: string;
  created: string | null;
  status: string | null;
  amountTotal: number | null;
  currency: string | null;
  hostedInvoiceUrl: string | null;
};

type HistoryResponse = {
  items: BillingHistoryItem[];
  nextCursor: string | null;
};

const HISTORY_LIMIT = 25;

function formatCurrency(amount: number | null, currency: string | null): string {
  if (typeof amount !== "number" || !Number.isFinite(amount)) return "—";
  const code = (currency || "usd").toUpperCase();
  const dollars = amount / 100;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
      currencyDisplay: "symbol",
    }).format(dollars);
  } catch {
    return `${dollars.toFixed(2)} ${code}`;
  }
}

function formatStatus(value: string | null): string {
  if (!value) return "—";
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDateTime(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  } as Intl.DateTimeFormatOptions);
}

function PlanTile({
  plan,
  isCurrent,
  summaryStatus,
  trialEligible,
}: {
  plan: PlanDefinition;
  isCurrent: boolean;
  summaryStatus: string;
  trialEligible: boolean;
}) {
  const normalizedStatus = (summaryStatus || "none").toLowerCase();
  const showPortal = ["active", "trial-active", "trial-pending", "activating"].includes(normalizedStatus);
  let actions: React.ReactNode = null;
  const priceLabel = getPlanPriceLabel(plan);
  const trialBadge = getPlanTrialBadge(plan);

  if (showPortal) {
    const label = isCurrent ? "Manage plan" : "Upgrade via portal";
    const variant = isCurrent ? "primary" : "secondary";
    actions = <ManageBillingButton className="mt-4 inline-flex" label={label} variant={variant} />;
  } else if (["none", "trial-expired", "canceled", "trial-cancelled"].includes(normalizedStatus)) {
    const allowTrial = plan.trialAvailable && trialEligible && normalizedStatus === "none";
    actions = (
      <PlanCheckoutButtons
        className="mt-4"
        priceId={plan.priceId}
        planName={plan.name}
        allowTrial={allowTrial}
        disableTrial={!allowTrial}
        disablePurchase={isCurrent}
        purchaseLabel="Purchase"
      />
    );
  } else {
    actions = (
      <PlanCheckoutButtons
        className="mt-4"
        priceId={plan.priceId}
        planName={plan.name}
        allowTrial={false}
        disableTrial
        disablePurchase={isCurrent}
        purchaseLabel="Purchase"
      />
    );
  }

  return (
    <div
      className={`rounded-2xl border ${isCurrent ? "border-white/20" : "border-white/10"} bg-white/5 px-5 py-4 shadow-[0_24px_70px_rgba(5,8,20,0.45)] backdrop-blur`}
    >
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">{plan.name}</div>
        {plan.tag ? (
          <span className="rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-xs text-white/80">{plan.tag}</span>
        ) : null}
      </div>
      <div className="mt-1 text-white/90">{priceLabel}</div>
      {plan.blurb ? <p className="mt-2 text-sm text-white/70">{plan.blurb}</p> : null}
      <div className="text-xs uppercase tracking-wide text-white/50 mt-1">
        {plan.includedMinutes.toLocaleString()} min included
        {plan.overagePerMinute ? ` • ${plan.overagePerMinute}/min overage` : ""}
      </div>
      {plan.trialAvailable && trialBadge ? (
        <div className="mt-2 inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[11px] text-emerald-200">
          {trialBadge}
        </div>
      ) : null}
      <ul className="mt-3 space-y-1 text-sm text-white/80">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <span aria-hidden>•</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      {actions}
    </div>
  );
}

export default function BillingPage() {
  const mountedRef = useRef(true);
  const [profile, setProfile] = useState<TenantProfile | null>(null);
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [planError, setPlanError] = useState<string | null>(null);

  const [historyItems, setHistoryItems] = useState<BillingHistoryItem[]>([]);
  const [historyCursor, setHistoryCursor] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyInitialised, setHistoryInitialised] = useState(false);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadPlanData = useCallback(async () => {
    setPlanLoading(true);
    setPlanError(null);
    try {
      const [profileRes, summaryRes] = await Promise.all([
        dashboardFetch("/api/dashboard/profile", { cache: "no-store" }),
        dashboardFetch("/billing/summary", { cache: "no-store" }),
      ]);
      if (!mountedRef.current) return;

      if (profileRes.ok) {
        const profileJson = (await profileRes.json()) as TenantProfile;
        setProfile(profileJson);
      } else {
        setProfile(null);
        setPlanError(`profile_${profileRes.status}`);
      }

      if (summaryRes.ok) {
        const summaryJson = (await summaryRes.json()) as BillingSummary;
        setSummary(summaryJson);
      } else {
        setSummary(null);
        setPlanError((prev) => prev ?? `summary_${summaryRes.status}`);
      }
    } catch (err) {
      if (!mountedRef.current) return;
      const message = err instanceof Error ? err.message : "plan_fetch_failed";
      setPlanError(message);
      setProfile(null);
      setSummary(null);
    } finally {
      if (mountedRef.current) {
        setPlanLoading(false);
      }
    }
  }, []);

  const loadHistory = useCallback(
    async (cursor?: string, replace = false) => {
      if (historyLoading && !replace) return;
      setHistoryLoading(true);
      if (replace) {
        setHistoryError(null);
      }
      try {
        const params = new URLSearchParams({ limit: String(HISTORY_LIMIT) });
        if (cursor) params.set("cursor", cursor);
        const res = await dashboardFetch(`/billing/history?${params.toString()}`, { cache: "no-store" });
        const data = (await res.json().catch(() => ({}))) as HistoryResponse & { error?: string };
        if (!mountedRef.current) return;
        if (!res.ok) {
          throw new Error(data?.error || `history_${res.status}`);
        }
        const items = Array.isArray(data?.items) ? data.items : [];
        setHistoryItems((prev) => (replace ? items : [...prev, ...items]));
        setHistoryCursor(data?.nextCursor ?? null);
        setHistoryError(null);
        setHistoryInitialised(true);
      } catch (err) {
        if (!mountedRef.current) return;
        const message = err instanceof Error ? err.message : "history_fetch_failed";
        setHistoryError(message);
        if (replace) {
          setHistoryItems([]);
          setHistoryCursor(null);
        }
      } finally {
        if (mountedRef.current) {
          setHistoryLoading(false);
        }
      }
    },
    [historyLoading],
  );

  useEffect(() => {
    void loadPlanData();
    void loadHistory(undefined, true);
  }, [loadPlanData, loadHistory]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handleRefetch = () => {
      void loadPlanData();
      void loadHistory(undefined, true);
    };
    window.addEventListener("ob:billing:checkout:success", handleRefetch);
    window.addEventListener("ob:billing:portal:returned", handleRefetch);
    return () => {
      window.removeEventListener("ob:billing:checkout:success", handleRefetch);
      window.removeEventListener("ob:billing:portal:returned", handleRefetch);
    };
  }, [loadPlanData, loadHistory]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handler = () => {
      void loadPlanData();
    };
    window.addEventListener("pageshow", handler);
    return () => {
      window.removeEventListener("pageshow", handler);
    };
  }, [loadPlanData]);

  const planDisplay = useMemo(() => derivePlanDisplay(summary, profile), [summary, profile]);
  const planDefinition = useMemo(
    () =>
      findPlanDefinition(
        summary?.planKey ?? profile?.planKey ?? null,
        summary?.planPriceId ?? profile?.planPriceId ?? null,
      ),
    [summary, profile],
  );
  const activePlanSlug = planDefinition?.slug ?? null;
  const summaryStatus = summary?.status ?? (summary?.planKey || profile?.planKey ? "active" : "none");
  const trialEligible = summary?.trialEligible ?? false;

  const planMinutes = summary?.planMinutes ?? summary?.minutesCap ?? profile?.minutesCap ?? null;
  const concurrencyCap = summary?.concurrencyCap ?? profile?.concurrencyCap ?? null;
  const trialEnd = formatIsoDate(summary?.trialEnd ?? null);
  const periodEnd = formatDateTime(summary?.currentPeriodEnd ?? null);

  return (
    <section className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Billing &amp; Plan</h1>
      <p className="mt-2 text-sm text-white/60">
        Manage your subscription, update payment methods, and review your invoice history.
      </p>

      <div className="mt-6 grid gap-4 grid-cols-[repeat(auto-fit,minmax(280px,1fr))]">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-[0_24px_70px_rgba(5,8,20,0.45)] backdrop-blur">
          <div className="text-sm text-white/60">Current plan</div>
          <div className="mt-2 text-2xl font-semibold text-white">
            {planLoading ? "Loading…" : planDisplay.value}
          </div>
          {planDisplay.hint ? <div className="mt-1 text-sm text-white/60">{planDisplay.hint}</div> : null}
          {planError ? <div className="mt-3 text-xs text-rose-300">{planError.replace(/_/g, " ")}</div> : null}
          <dl className="mt-3 grid gap-2 text-sm text-white/70">
            <div className="flex items-center justify-between">
              <dt>Included minutes</dt>
              <dd>{planMinutes ? `${planMinutes} min/mo` : "—"}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Concurrency cap</dt>
              <dd>{concurrencyCap ?? "—"}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Trial ends</dt>
              <dd>{trialEnd ?? "—"}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Current period ends</dt>
              <dd>{periodEnd ?? "—"}</dd>
            </div>
          </dl>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <PlanActionButtons
              summary={summary}
              profile={profile}
              onRefresh={loadPlanData}
              className="shrink-0"
            />
            <a
              href="/pricing"
              className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25"
            >
              View pricing
            </a>
          </div>
          {summaryStatus === "none" ? (
            <p className="mt-2 text-sm text-white/60">
              No current plan. Purchase a plan when you’re ready to keep EarlyBird active.
            </p>
          ) : null}
          {summaryStatus === "trial-cancelled" ? (
            <p className="mt-2 text-sm text-white/60">
              Trial ended{trialEnd ? ` ${trialEnd}` : ""}. Select a plan to continue uninterrupted service.
            </p>
          ) : null}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-[0_24px_70px_rgba(5,8,20,0.45)] backdrop-blur md:col-span-2">
          <div className="font-medium">Compare plans</div>
          <div className="mt-3 grid gap-4 grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
            {PLAN_DEFINITIONS.map((plan) => (
              <PlanTile
                key={plan.slug}
                plan={plan}
                isCurrent={activePlanSlug === plan.slug}
                summaryStatus={summaryStatus}
                trialEligible={trialEligible}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_24px_70px_rgba(5,8,20,0.45)] backdrop-blur">
        <div className="flex items-center justify-between border-b border-white/10 bg-white/10 px-5 py-4">
          <div className="font-medium">Billing history</div>
          {historyLoading ? <div className="text-xs text-white/50">Loading…</div> : null}
        </div>
        {historyError ? (
          <div className="flex flex-wrap items-center gap-3 px-5 py-3 text-xs text-rose-300" role="alert">
            <span>{historyError.replace(/_/g, " ")}</span>
            <button
              type="button"
              onClick={() => void loadHistory(undefined, true)}
              className="rounded-xl border border-rose-300/40 bg-rose-400/10 px-2 py-1 text-xs text-rose-100 transition hover:border-rose-200 hover:text-rose-50"
              disabled={historyLoading}
            >
              Retry
            </button>
          </div>
        ) : null}
        <div className="px-5 pb-5 pt-4 overflow-x-auto">
          <table className="w-full min-w-[580px] text-sm text-white/80">
            <thead className="text-left text-white/60">
              <tr>
                <th className="pb-2">Date</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Amount</th>
                <th className="pb-2">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {historyItems.map((item) => {
                const created = formatIsoDate(item.created);
                return (
                  <tr key={item.id} className="border-t border-white/10 text-white/80 transition hover:bg-white/10">
                    <td className="py-2 align-middle">{created ?? "—"}</td>
                    <td className="py-2 align-middle">{formatStatus(item.status)}</td>
                    <td className="py-2 align-middle">{formatCurrency(item.amountTotal, item.currency)}</td>
                    <td className="py-2 align-middle">
                      {item.hostedInvoiceUrl ? (
                        <a
                          href={item.hostedInvoiceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-white underline hover:text-white/70"
                        >
                          View invoice
                        </a>
                      ) : (
                        <span className="text-white/40">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {historyInitialised && historyItems.length === 0 && !historyLoading ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-white/50">
                    No invoices yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        {historyCursor ? (
          <div className="border-t border-white/10 bg-white/10 px-5 py-3">
            <button
              type="button"
              onClick={() => loadHistory(historyCursor)}
              disabled={historyLoading}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition hover:text-white disabled:opacity-60"
            >
              {historyLoading ? "Loading…" : "Load more"}
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-[0_24px_70px_rgba(5,8,20,0.45)] backdrop-blur">
        <h2 className="text-lg font-semibold text-white">Need something custom?</h2>
        <p className="mt-2 text-sm text-white/70">
          Enterprise plans include SSO, custom integrations, and dedicated onboarding. Reach out and we’ll tailor a
          plan for your team.
        </p>
        <a
          href="mailto:hello@oneearlybird.ai"
          className="mt-4 inline-flex rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition hover:text-white"
        >
          Contact sales
        </a>
      </div>
    </section>
  );
}
