"use client";

import { useCallback, useMemo, useState } from "react";
import ManageBillingButton from "@/components/ManageBillingButton";
import PlanCheckoutButtons from "@/components/PlanCheckoutButtons";
import { apiFetch } from "@/lib/http";
import { PLAN_DEFINITIONS, type PlanDefinition } from "@/lib/plans";
import { findPlanDefinition } from "@/lib/billing";
import { toast } from "@/components/Toasts";

type PlanSummaryInput = {
  status?: string | null;
  planKey?: string | null;
  planPriceId?: string | null;
  trialEligible?: boolean | null;
  hasPaymentMethod?: boolean | null;
};

type PlanProfileInput = {
  planKey?: string | null;
  planPriceId?: string | null;
};

type PlanActionButtonsProps = {
  summary: PlanSummaryInput | null | undefined;
  profile: PlanProfileInput | null | undefined;
  onRefresh?: () => void | Promise<void>;
  align?: "start" | "center" | "end";
  className?: string;
  showManageDuringTrial?: boolean;
  onRequestTrial?: (plan: PlanDefinition) => void;
};

export default function PlanActionButtons({
  summary,
  profile,
  onRefresh,
  align = "start",
  className = "",
  showManageDuringTrial = false,
  onRequestTrial,
}: PlanActionButtonsProps) {
  const [canceling, setCanceling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const planKey = summary?.planKey ?? profile?.planKey ?? null;
  const planPriceId = summary?.planPriceId ?? profile?.planPriceId ?? null;

  const planDefinition = useMemo(() => {
    const found = findPlanDefinition(planKey, planPriceId);
    if (found) return found;
    return PLAN_DEFINITIONS.find((plan) => plan.popular) ?? PLAN_DEFINITIONS[0] ?? null;
  }, [planKey, planPriceId]);

  const hasPlan = Boolean(planKey || planPriceId);
  const rawStatus = typeof summary?.status === "string" ? summary.status.toLowerCase() : "none";
  let status: "none" | "trial-active" | "active" = "none";
  if (rawStatus === "trial-active") {
    status = "trial-active";
  } else if (rawStatus === "active") {
    status = "active";
  } else if (hasPlan && rawStatus === "activating") {
    status = "active";
  }

  const trialEligible = summary?.trialEligible === true;
  const hasPaymentMethod = Boolean(summary?.hasPaymentMethod);
  const showTrialCta = status === "none" && trialEligible;
  const showPurchaseCta = status === "none" && !trialEligible;
  const showManage =
    status === "active" || (status === "trial-active" && showManageDuringTrial);
  const showCancel = status === "active" || status === "trial-active";

  const alignmentClass =
    align === "center" ? "justify-center" : align === "end" ? "justify-end" : "justify-start";

  const handleCancel = useCallback(async () => {
    if (canceling) return;
    if (typeof window !== "undefined") {
      const confirmed = window.confirm(
        "Are you sure you want to cancel your plan? This takes effect immediately.",
      );
      if (!confirmed) return;
    }
    setCancelError(null);
    setCanceling(true);
    try {
      const res = await apiFetch("/billing/cancel", {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || (data && typeof data === "object" && "ok" in data && !data.ok)) {
        const code =
          (data as { error?: string; code?: string })?.error ||
          (data as { error?: string; code?: string })?.code ||
          res.statusText ||
          "request_failed";
        throw new Error(String(code));
      }
      toast("Plan canceled", "success");
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "cancel_failed";
      const readable = message.replace(/_/g, " ");
      setCancelError(readable);
    } finally {
      setCanceling(false);
    }
  }, [canceling, onRefresh]);

  if (!planDefinition && !showCancel && !showManage && !showTrialCta && !showPurchaseCta) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${alignmentClass} ${className}`.trim()}>
      {showTrialCta && planDefinition ? (
        onRequestTrial ? (
          <button
            type="button"
            onClick={() => onRequestTrial(planDefinition)}
            className="shrink-0 inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
          >
            Start Free Trial
          </button>
        ) : (
          <PlanCheckoutButtons
            className="shrink-0"
            priceId={planDefinition.priceId}
            planName={planDefinition.name}
            allowTrial
            disablePurchase
            trialLabel="Start Free Trial"
          />
        )
      ) : null}
      {showPurchaseCta && planDefinition ? (
        <PlanCheckoutButtons
          className="shrink-0"
          priceId={planDefinition.priceId}
          planName={planDefinition.name}
          allowTrial={false}
          disableTrial
          disablePurchase={false}
          purchaseLabel="Purchase"
        />
      ) : null}
      {showManage ? (
        <ManageBillingButton
          className="shrink-0"
          label="Manage plan"
          disabled={!hasPaymentMethod}
          tooltip={!hasPaymentMethod ? "Available after starting a trial or purchase." : undefined}
        />
      ) : null}
      {showCancel ? (
        <div className="shrink-0">
          <button
            type="button"
            onClick={handleCancel}
            disabled={canceling}
            className="inline-flex items-center justify-center rounded-md border border-white/20 px-3 py-1.5 text-sm text-white/80 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {canceling ? "Canceling…" : "Cancel plan"}
          </button>
          {cancelError ? (
            <p className="mt-1 text-xs text-rose-300" role="alert">
              {cancelError}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
