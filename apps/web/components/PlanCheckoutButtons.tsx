"use client";

import { useEffect, useState } from "react";
import { toApiUrl } from "@/lib/http";
import { openPopup } from "@/lib/popup";

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
    cache: "no-store",
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
  const [showOverlay, setShowOverlay] = useState(false);
  useEffect(() => {
    const handleCheckoutSuccess = () => {
      setState({ kind: null, error: null });
      setShowOverlay(false);
    };
    window.addEventListener("ob:billing:checkout:success", handleCheckoutSuccess);
    return () => {
      window.removeEventListener("ob:billing:checkout:success", handleCheckoutSuccess);
    };
  }, []);

  const run = async (kind: ActionKind) => {
    setState({ kind, error: null });
    let keepOverlay = false;
    let errorMessage: string | null = null;
    try {
      const url = await submitAction(kind, priceId);
      const popup = openPopup(url, "stripe-checkout", {
        expectedMessageType: "billing:checkout:success",
        w: 540,
        h: 680,
      });
      if (!popup) {
        setShowOverlay(false);
        window.location.assign(url);
        return;
      }
      keepOverlay = true;
      setShowOverlay(true);
    } catch (err: any) {
      errorMessage = err?.message || "Something went wrong. Please try again.";
    } finally {
      if (!keepOverlay || errorMessage) {
        setShowOverlay(false);
        setState({ kind: null, error: errorMessage });
      }
    }
  };

  const busy = state.kind !== null;
  const showTrial = allowTrial && !disableTrial;
  const canPurchase = !disablePurchase;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {showOverlay ? (
        <div
          className="pointer-events-none fixed inset-0 z-40 bg-black/25 backdrop-blur-[1px] transition-opacity"
          aria-hidden="true"
        />
      ) : null}
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
