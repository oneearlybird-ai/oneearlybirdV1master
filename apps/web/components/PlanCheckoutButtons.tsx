"use client";

import { useState } from "react";
import { toApiUrl } from "@/lib/http";

type ActionKind = "trial" | "purchase";

interface PlanCheckoutButtonsProps {
  priceId: string;
  planName: string;
  allowTrial?: boolean;
  disableTrial?: boolean;
  disablePurchase?: boolean;
  purchaseLabel?: string;
  trialLabel?: string;
  className?: string;
}

type ActionState = {
  kind: ActionKind | null;
  error: string | null;
};

async function submitAction(kind: ActionKind, priceId: string): Promise<string> {
  const path =
    kind === "trial" ? "/billing/trial/start" : "/billing/checkout/start";
  const res = await fetch(toApiUrl(path), {
    method: "POST",
    credentials: "include",
    body: JSON.stringify({ priceId }),
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
  let body: any = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  if (res.status === 401) {
    throw new Error("Please sign in to continue.");
  }
  if (!res.ok || !body?.url) {
    const message =
      body?.error ||
      body?.message ||
      `Unable to ${kind === "trial" ? "start trial" : "start checkout"}.`;
    throw new Error(message);
  }
  return String(body.url);
}

export function PlanCheckoutButtons({
  priceId,
  planName,
  allowTrial = true,
  disableTrial = false,
  disablePurchase = false,
  purchaseLabel = "Purchase",
  trialLabel = "Start Free Trial",
  className = "",
}: PlanCheckoutButtonsProps) {
  const [state, setState] = useState<ActionState>({ kind: null, error: null });

  const run = async (kind: ActionKind) => {
    setState({ kind, error: null });
    try {
      const url = await submitAction(kind, priceId);
      window.location.assign(url);
    } catch (err: any) {
      setState({
        kind: null,
        error: err?.message || "Something went wrong. Please try again.",
      });
    }
  };

  const busy = state.kind !== null;
  const showTrial = allowTrial && !disableTrial;
  const canPurchase = !disablePurchase;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {showTrial ? (
        <button
          type="button"
          onClick={() => run("trial")}
          disabled={busy || disableTrial}
          className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/40 disabled:text-black/40"
          aria-label={`Start free trial for ${planName}`}
        >
          {state.kind === "trial" ? "Starting trial…" : trialLabel}
        </button>
      ) : null}
      {canPurchase ? (
        <button
          type="button"
          onClick={() => run("purchase")}
          disabled={busy || disablePurchase}
          className="inline-flex items-center justify-center rounded-xl border border-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/5 disabled:cursor-not-allowed disabled:text-white/30 disabled:border-white/10"
          aria-label={`Purchase ${planName}`}
        >
          {state.kind === "purchase" ? "Redirecting…" : purchaseLabel}
        </button>
      ) : null}
      {state.error ? (
        <p className="text-xs text-rose-300" role="alert">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}

export default PlanCheckoutButtons;
