"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { redirectTo } from "@/lib/clientNavigation";
import { getDashboardPath, getLandingPath } from "@/lib/authPaths";
import { useAuthSession } from "@/components/auth/AuthSessionProvider";
import { useProvisioningStatus } from "@/hooks/useProvisioningStatus";

const SUPPORT_EMAIL = "support@oneearlybird.ai";

const STEP_LABELS = ["Securing data", "Connecting phone", "Final checks"] as const;

function formatRelativeTime(value: string | null | undefined): string | null {
  if (!value) return null;
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return null;
  const now = Date.now();
  const delta = Math.max(0, now - parsed);
  if (delta < 1000 * 60) return "moments ago";
  if (delta < 1000 * 60 * 5) return "a few minutes ago";
  const minutes = Math.round(delta / (1000 * 60));
  return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
}

function StatusPulse() {
  return (
    <span className="relative inline-flex h-3 w-3 items-center justify-center">
      <span className="absolute h-full w-full animate-ping rounded-full bg-stellar-amber/50" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-stellar-amber" />
    </span>
  );
}

function PendingStep({ label, active, completed }: { label: string; active: boolean; completed: boolean }) {
  return (
    <li
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
        completed
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
          : active
            ? "border-stellar-amber/40 bg-stellar-amber/10 text-white"
            : "border-white/10 bg-white/5 text-white/70"
      }`}
      aria-current={active ? "step" : undefined}
    >
      <span className="mt-0.5 inline-flex h-2 w-2 flex-none rounded-full bg-current opacity-80" />
      <span>{label}</span>
    </li>
  );
}

export function ProvisioningPendingView() {
  const { status: authStatus } = useAuthSession();
  const [supportVisible, setSupportVisible] = useState(false);
  const provisioning = useProvisioningStatus(true);
  const { status, loading, takingLonger, timedOut, error, canRetryStatus, triggerManualRefresh, polling, elapsedMs } =
    provisioning;

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      redirectTo(getLandingPath());
    }
  }, [authStatus]);

  useEffect(() => {
    if (status?.status === "Active") {
      redirectTo(getDashboardPath());
    }
  }, [status?.status]);

  useEffect(() => {
    if (provisioning.retryCount >= 2) {
      setSupportVisible(true);
    }
  }, [provisioning.retryCount]);

  const activeStepIndex = useMemo(() => {
    if (status?.status === "Failed") return STEP_LABELS.length - 1;
    if (status?.status === "Active") return STEP_LABELS.length;
    if (elapsedMs >= 90000) return STEP_LABELS.length - 1;
    if (elapsedMs >= 45000) return 1;
    return 0;
  }, [elapsedMs, status?.status]);

  const completedCount = useMemo(() => {
    if (status?.status === "Active") return STEP_LABELS.length;
    if (status?.status === "Failed") return Math.max(0, STEP_LABELS.length - 1);
    return Math.max(0, activeStepIndex);
  }, [activeStepIndex, status?.status]);

  const lastUpdatedLabel = useMemo(() => formatRelativeTime(status?.lastUpdated ?? null), [status?.lastUpdated]);

  const showRetryButton = status?.status === "Failed" && provisioning.retryCount < 3;

  return (
    <div className="mx-auto flex min-h-[80vh] w-full max-w-3xl flex-col justify-center px-6 py-16 text-white">
      <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-10 shadow-2xl shadow-black/40 backdrop-blur">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 text-sm font-semibold text-white/80">
            <StatusPulse />
            <span aria-live="polite" aria-atomic="true">
              {status?.status === "Failed"
                ? "Setup needs attention"
                : status?.status === "Active"
                  ? "Setup complete"
                  : "Setting up your account…"}
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Setting up your account… usually under a minute.
          </h1>
          <p className="text-sm text-white/70">
            We’re preparing your tenant, phone routing, and security policies. Stay on this page—we’ll move you into the dashboard once everything is live.
          </p>
          <ol className="mt-4 grid gap-3 md:grid-cols-3" aria-label="Provisioning steps">
            {STEP_LABELS.map((label, index) => (
              <PendingStep
                key={label}
                label={label}
                active={index === activeStepIndex}
                completed={index < completedCount}
              />
            ))}
          </ol>
        </div>

        {takingLonger ? (
          <div className="mt-6 rounded-2xl border border-stellar-amber/40 bg-stellar-amber/10 px-4 py-3 text-sm text-stellar-amber">
            <strong className="font-semibold">Taking longer than usual.</strong> Most tenants are ready within 60 seconds—we’re still working. Keep the tab open or explore the docs while we finish.
          </div>
        ) : null}

        {error ? (
          <div
            role="alert"
            className="mt-6 rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100"
          >
            <div className="font-semibold">
              {error.kind === "auth" ? "We need you to sign in again." : "We couldn’t reach the status service."}
            </div>
            <p className="mt-1">
              {error.message} {error.statusCode ? `(HTTP ${error.statusCode})` : null}
            </p>
            {canRetryStatus ? (
              <button
                type="button"
                onClick={triggerManualRefresh}
                className="mt-3 inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black shadow-glow-md transition hover:bg-white/90"
              >
                Retry now
              </button>
            ) : null}
          </div>
        ) : null}

        {status?.status === "Failed" ? (
          <div className="mt-6 rounded-3xl border border-rose-400/40 bg-rose-500/10 px-6 py-5 text-sm text-rose-50">
            <div className="flex flex-col gap-2">
              <div className="text-base font-semibold">Setup hit a snag.</div>
              {status.lastErrorCode ? (
                <div className="text-xs uppercase tracking-[0.2em] text-rose-200/80">
                  Error code: <span className="font-mono text-rose-100">{status.lastErrorCode}</span>
                </div>
              ) : null}
              <p className="text-sm text-rose-100/90">
                We’ll re-run the automation—this usually clears transient Twilio or IAM checks.
              </p>
              {showRetryButton ? (
                <button
                  type="button"
                  onClick={() => {
                    void provisioning.attemptProvisioningRetry();
                  }}
                  className="mt-2 inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black shadow-glow-md transition hover:bg-white/90 disabled:opacity-60"
                  disabled={provisioning.retrying}
                >
                  {provisioning.retrying ? "Retrying…" : "Retry setup"}
                </button>
              ) : null}
              {provisioning.retryError ? (
                <p className="text-xs text-rose-200/90">{provisioning.retryError}</p>
              ) : null}
            </div>
          </div>
        ) : null}

        {supportVisible ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
            Still waiting? Email{" "}
            <Link href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-white underline">
              {SUPPORT_EMAIL}
            </Link>{" "}
            with your account email and the code above—we’ll jump in.
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-white/60">
          <div>
            <span aria-live="polite" aria-atomic="true">
              {loading ? "Checking status…" : polling ? "Polling active…" : "Idle"}
            </span>
            {lastUpdatedLabel ? <span className="ml-2 text-white/40">Last update {lastUpdatedLabel}</span> : null}
          </div>
          {timedOut ? (
            <div className="flex items-center gap-2 text-white/70">
              <span>We’ll keep working in the background.</span>
              <button
                type="button"
                onClick={provisioning.resumePolling}
                className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/15"
              >
                Keep checking
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
