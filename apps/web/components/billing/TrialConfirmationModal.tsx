"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toApiUrl } from "@/lib/http";
import { openPopup } from "@/lib/popup";

type TrialConfirmationModalProps = {
  open: boolean;
  onClose: () => void;
  planName: string;
  priceId: string;
  includedMinutes?: number | null;
  trialMinutes?: number | null;
  onTrialTriggered?: (kind: "card" | "skip") => void;
};

async function requestTrialCheckout(priceId: string): Promise<string> {
  const response = await fetch(toApiUrl("/billing/trial/start"), {
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
    body = await response.json();
  } catch {
    body = null;
  }
  if (response.status === 401) {
    throw new Error("Please sign in to continue.");
  }
  if (!response.ok || !body?.url) {
    const message = body?.error || body?.message || "Unable to start checkout.";
    throw new Error(String(message));
  }
  return String(body.url);
}

export default function TrialConfirmationModal({
  open,
  onClose,
  planName,
  priceId,
  includedMinutes,
  trialMinutes,
  onTrialTriggered,
}: TrialConfirmationModalProps) {
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState<null | "card" | "skip">(null);
  const [error, setError] = useState<string | null>(null);
  const [overlay, setOverlay] = useState(false);

  const emitTrialSuccess = useCallback((source: "card" | "skip") => {
    window.dispatchEvent(new CustomEvent("ob:billing:trial:success", { detail: { source } }));
  }, []);

  useEffect(() => {
    if (!open) {
      setAgree(false);
      setBusy(null);
      setError(null);
      setOverlay(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const handleCheckoutSuccess = () => {
      setBusy(null);
      setOverlay(false);
      emitTrialSuccess("card");
    };
    const handleTrialSuccess = (event: Event) => {
      setBusy(null);
      setOverlay(false);
      const detail = (event as CustomEvent<{ source?: "card" | "skip" }>).detail;
      const source = detail?.source === "card" ? "card" : "skip";
      onTrialTriggered?.(source);
      onClose();
    };
    window.addEventListener("ob:billing:checkout:success", handleCheckoutSuccess);
    window.addEventListener("ob:billing:trial:success", handleTrialSuccess as EventListener);
    return () => {
      window.removeEventListener("ob:billing:checkout:success", handleCheckoutSuccess);
      window.removeEventListener("ob:billing:trial:success", handleTrialSuccess as EventListener);
    };
  }, [emitTrialSuccess, onClose, onTrialTriggered, open]);

  const planSummary = useMemo(() => {
    if (!includedMinutes && !trialMinutes) return null;
    const parts: string[] = [];
    if (includedMinutes) {
      parts.push(`${includedMinutes.toLocaleString()} min plan`);
    }
    if (trialMinutes) {
      parts.push(`${trialMinutes} min trial`);
    }
    return parts.join(" • ");
  }, [includedMinutes, trialMinutes]);

  if (!open) return null;

  const requireAgreement = () => {
    if (!agree) {
      setError("You must agree before starting your trial.");
      return false;
    }
    return true;
  };

  const handleStartWithCard = async () => {
    if (!requireAgreement()) return;
    setBusy("card");
    setError(null);
    try {
      const url = await requestTrialCheckout(priceId);
      const popup = openPopup(url, "stripe-checkout", {
        expectedMessageType: "billing:checkout:success",
        w: 540,
        h: 680,
      });
      if (!popup) {
        window.location.assign(url);
        return;
      }
      setOverlay(true);
    } catch (err) {
      setBusy(null);
      setOverlay(false);
      setError(err instanceof Error ? err.message : "We couldn’t open checkout. Try again.");
    }
  };

  const handleSkipCard = async () => {
    if (!requireAgreement()) return;
    setBusy("skip");
    setError(null);
    try {
      const response = await fetch(toApiUrl("/billing/trial/start"), {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: {
          "content-type": "application/json",
          "cache-control": "no-store",
        },
        body: JSON.stringify({ priceId, skipCard: true }),
      });
      let payload: any = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }
      if (!response.ok) {
        const message = payload?.error || payload?.message || "Unable to start trial without a card.";
        throw new Error(String(message));
      }
      emitTrialSuccess("skip");
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn’t start your trial. Try again.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/70 px-4 py-6">
      <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-neutral-950/95 p-6 text-white shadow-2xl">
        <button
          type="button"
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white/70 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          onClick={() => {
            if (busy === "card" && overlay) return;
            onClose();
          }}
          aria-label="Close trial confirmation"
          disabled={busy === "card" && overlay}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" stroke="currentColor" strokeWidth={1.5} fill="none">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {overlay ? (
          <div className="pointer-events-none absolute inset-0 z-20 rounded-3xl bg-black/40 backdrop-blur-sm" aria-hidden="true" />
        ) : null}

        <div className="relative z-10 space-y-6">
          <header className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-white/50">Trial confirmation</p>
            <h2 className="text-2xl font-semibold">Start your {planName} trial</h2>
            <p className="text-sm text-white/70">
              “Your 14-day / 100-minute trial auto-converts to your selected plan when either limit is reached. You can cancel anytime before conversion.”
            </p>
            {planSummary ? <p className="text-xs text-white/40">{planSummary}</p> : null}
          </header>

          <label className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/5 p-4 text-sm text-white/80">
            <input
              type="checkbox"
              checked={agree}
              onChange={(event) => {
                setAgree(event.target.checked);
                if (event.target.checked) {
                  setError((prev) => (prev === "You must agree before starting your trial." ? null : prev));
                }
              }}
              className="mt-1 h-5 w-5 shrink-0 rounded border border-white/30 bg-black/30 text-white accent-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            />
            <span>I agree</span>
          </label>

          {error ? (
            <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleSkipCard}
              disabled={busy !== null}
              className="inline-flex items-center justify-center rounded-xl border border-white/20 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy === "skip" ? "Starting…" : "Skip card for now"}
            </button>
            <button
              type="button"
              onClick={handleStartWithCard}
              disabled={busy !== null}
              className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy === "card" ? "Opening checkout…" : "Start 14-Day Free Trial"}
            </button>
          </div>

          {overlay ? (
            <p className="text-center text-xs text-white/60">Complete checkout in the new window. This page updates automatically.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
