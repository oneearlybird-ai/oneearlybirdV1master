"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import PlanActionButtons from "@/components/PlanActionButtons";
import { derivePlanDisplay, formatIsoDate } from "@/lib/billing";
import { dashboardFetch } from "@/lib/dashboardFetch";
import { MobileCard, MobileCardContent, MobileCardFooter, MobileCardHeader } from "@/components/mobile/Card";

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

type TenantProfile = {
  planKey?: string | null;
  planPriceId?: string | null;
  minutesCap?: number | null;
  concurrencyCap?: number | null;
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

function formatCurrency(amount: number | null, currency: string | null) {
  if (typeof amount !== "number") return "—";
  const code = (currency || "usd").toUpperCase();
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: code }).format(amount / 100);
  } catch {
    return `${(amount / 100).toFixed(2)} ${code}`;
  }
}

function formatStatus(value: string | null) {
  if (!value) return "—";
  return value.replace(/[_-]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function MobileBillingPage() {
  const [profile, setProfile] = useState<TenantProfile | null>(null);
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [history, setHistory] = useState<BillingHistoryItem[]>([]);
  const [historyCursor, setHistoryCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPlanData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileRes, summaryRes] = await Promise.all([
        dashboardFetch("/tenants/profile", { cache: "no-store" }),
        dashboardFetch("/billing/summary", { cache: "no-store" }),
      ]);
      if (!profileRes.ok) {
        const text = await profileRes.text();
        throw new Error(text || `profile_${profileRes.status}`);
      }
      if (!summaryRes.ok) {
        const text = await summaryRes.text();
        throw new Error(text || `summary_${summaryRes.status}`);
      }
      setProfile((await profileRes.json()) as TenantProfile);
      setSummary((await summaryRes.json()) as BillingSummary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed_to_load_plan");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadHistory = useCallback(
    async (cursor?: string | null, replace = false) => {
      if (historyLoading) return;
      setHistoryLoading(true);
      if (replace) {
        setHistory([]);
        setHistoryCursor(null);
      }
      try {
        const params = new URLSearchParams({ limit: String(HISTORY_LIMIT) });
        if (cursor) params.set("cursor", cursor);
        const res = await dashboardFetch(`/billing/history?${params.toString()}`, { cache: "no-store" });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `history_${res.status}`);
        }
        const json = (await res.json()) as HistoryResponse;
        setHistory((prev) => (replace ? json.items ?? [] : [...prev, ...(json.items ?? [])]));
        setHistoryCursor(json.nextCursor ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "failed_to_load_history");
      } finally {
        setHistoryLoading(false);
      }
    },
    [historyLoading],
  );

  useEffect(() => {
    void loadPlanData();
    void loadHistory(undefined, true);
  }, [loadPlanData, loadHistory]);

  const planDisplay = useMemo(() => derivePlanDisplay(summary, profile), [summary, profile]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6 text-white">
      <header className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-white/50">Billing</span>
        <h1 className="text-2xl font-semibold">Plan & invoices</h1>
        <p className="text-sm text-white/60">Manage subscription, portal access, and history.</p>
      </header>

      {error ? (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
          {error.replace(/_/g, " ")}
        </div>
      ) : null}

      <MobileCard>
        <MobileCardHeader
          title={planDisplay.value}
          subtitle={loading ? "Loading plan…" : planDisplay.hint ?? "Current plan"}
        />
        <MobileCardContent>
          <div className="flex flex-wrap gap-2 text-xs text-white/60">
            <span className="rounded-full border border-white/15 px-2 py-1">
              Status: {summary?.status === "trial-active" ? "Trial" : summary?.status === "active" ? "Active" : "None"}
            </span>
            <span className="rounded-full border border-white/15 px-2 py-1">
              Concurrency: {summary?.concurrencyCap ?? profile?.concurrencyCap ?? "—"}
            </span>
            <span className="rounded-full border border-white/15 px-2 py-1">
              Trial ends: {formatIsoDate(summary?.trialEnd ?? null) ?? "—"}
            </span>
          </div>
        </MobileCardContent>
        <MobileCardFooter>
          <PlanActionButtons summary={summary} profile={profile} onRefresh={loadPlanData} align="start" />
        </MobileCardFooter>
      </MobileCard>

      <MobileCard>
        <MobileCardHeader title="Billing history" subtitle="Most recent invoices" />
        <MobileCardContent>
          {history.length === 0 && historyLoading ? (
            <div className="space-y-2" aria-hidden>
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="rounded-xl border border-white/10 p-3">
                  <div className="skeleton skeleton-line w-32" />
                  <div className="mt-2 skeleton skeleton-line w-24" />
                </div>
              ))}
            </div>
          ) : null}
          <div className="space-y-3">
            {history.map((item) => (
              <div key={item.id} className="rounded-xl border border-white/10 p-3 text-sm text-white/75">
                <div className="flex items-center justify-between">
                  <div>{formatIsoDate(item.created) ?? "—"}</div>
                  <span className="rounded-full border border-white/15 px-2 py-0.5 text-xs text-white/60">
                    {formatStatus(item.status)}
                  </span>
                </div>
                <div className="mt-2 text-white/80">{formatCurrency(item.amountTotal, item.currency)}</div>
                {item.hostedInvoiceUrl ? (
                  <a
                    href={item.hostedInvoiceUrl}
                    className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-full border border-white/20 text-sm text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                    target="_blank"
                    rel="noreferrer"
                  >
                    View invoice
                  </a>
                ) : null}
              </div>
            ))}
          </div>
          {!historyLoading && history.length === 0 ? (
            <p className="text-sm text-white/60">No invoices yet.</p>
          ) : null}
        </MobileCardContent>
        {historyCursor ? (
          <MobileCardFooter>
            <button
              type="button"
              onClick={() => void loadHistory(historyCursor, false)}
              disabled={historyLoading}
              className="inline-flex h-11 w-full items-center justify-center rounded-full border border-white/20 px-4 text-sm font-medium text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:opacity-40"
            >
              {historyLoading ? "Loading…" : "Load more"}
            </button>
          </MobileCardFooter>
        ) : null}
      </MobileCard>
    </div>
  );
}
