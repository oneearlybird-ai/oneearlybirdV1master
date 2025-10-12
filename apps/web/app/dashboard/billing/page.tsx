"use client";

export const dynamic = "force-dynamic";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ManageBillingButton from "@/components/ManageBillingButton";
import PlanCheckoutButtons from "@/components/PlanCheckoutButtons";
import { apiFetch } from "@/lib/http";
import { derivePlanDisplay, findPlanDefinition, formatIsoDate } from "@/lib/billing";
import { PLAN_DEFINITIONS, type PlanDefinition } from "@/lib/plans";

type TenantProfile = {
  planKey?: string | null;
  planPriceId?: string | null;
  minutesCap?: number | null;
  concurrencyCap?: number | null;
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
  disableTrial,
  disablePurchase,
}: {
  plan: PlanDefinition;
  isCurrent: boolean;
  disableTrial: boolean;
  disablePurchase: boolean;
}) {
  return (
    <div className={`rounded-2xl border ${isCurrent ? "border-white/30" : "border-white/10"} bg-white/5 p-4`}>
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">{plan.name}</div>
        {plan.tag ? (
          <span className="rounded-full border border-white/20 px-2 py-0.5 text-xs text-white/80">{plan.tag}</span>
        ) : null}
      </div>
      <div className="mt-1 text-white/90">{plan.priceLabel}</div>
      <ul className="mt-3 space-y-1 text-sm text-white/80">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <span aria-hidden>•</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <PlanCheckoutButtons
        className="mt-4"
        priceId={plan.priceId}
        planName={plan.name}
        disableTrial={disableTrial}
        disablePurchase={disablePurchase || isCurrent}
      />
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
        apiFetch("/tenants/profile", { cache: "no-store" }),
        apiFetch("/billing/summary", { cache: "no-store" }),
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
        const res = await apiFetch(`/billing/history?${params.toString()}`, { cache: "no-store" });
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
  const disableTrial = summaryStatus === "trial-active" || summaryStatus === "active";
  const disablePurchase = summaryStatus === "active" && Boolean(activePlanSlug);

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
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
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
          <div className="mt-4 flex flex-wrap gap-3">
            <ManageBillingButton className="shrink-0" />
            <a
              href="/pricing"
              className="shrink-0 rounded-md border border-white/20 px-3 py-1.5 text-sm text-white/80 hover:text-white"
            >
              View pricing
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:col-span-2">
          <div className="font-medium">Compare plans</div>
          <div className="mt-3 grid gap-4 grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
            {PLAN_DEFINITIONS.map((plan) => (
              <PlanTile
                key={plan.slug}
                plan={plan}
                isCurrent={activePlanSlug === plan.slug}
                disableTrial={disableTrial}
                disablePurchase={disablePurchase}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between">
          <div className="font-medium">Billing history</div>
          {historyLoading ? <div className="text-xs text-white/50">Loading…</div> : null}
        </div>
        {historyError ? (
          <div className="mt-3 text-xs text-rose-300" role="alert">
            {historyError.replace(/_/g, " ")}
          </div>
        ) : null}
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[580px] text-sm text-white/80">
            <thead className="text-left text-white/50">
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
                  <tr key={item.id} className="border-t border-white/5">
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
          <div className="mt-4">
            <button
              type="button"
              onClick={() => loadHistory(historyCursor)}
              disabled={historyLoading}
              className="rounded-md border border-white/20 px-3 py-1.5 text-sm text-white/80 hover:text-white disabled:opacity-60"
            >
              {historyLoading ? "Loading…" : "Load more"}
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
        <h2 className="text-lg font-semibold text-white">Need something custom?</h2>
        <p className="mt-2 text-sm text-white/70">
          Enterprise plans include SSO, custom integrations, and dedicated onboarding. Reach out and we’ll tailor a
          plan for your team.
        </p>
        <a
          href="mailto:hello@oneearlybird.ai"
          className="mt-4 inline-flex rounded-md border border-white/20 px-3 py-1.5 text-sm text-white/80 hover:text-white"
        >
          Contact sales
        </a>
      </div>
    </section>
  );
}
