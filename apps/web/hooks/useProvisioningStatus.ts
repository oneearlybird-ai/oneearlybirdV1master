import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  fetchProvisioningStatus,
  requestProvisioningRetry,
  type ProvisioningStatusCode,
  type ProvisioningStatusResponse,
} from "@/lib/provisioning";

const POLL_INTERVAL_MS = 4000;
const MAX_DURATION_MS = 120000;
const LONG_THRESHOLD_MS = 60000;
const MAX_PROVISIONING_RETRY_ATTEMPTS = 3;
const MAX_NETWORK_RETRIES = 1;

type ProvisioningErrorKind = "network" | "auth" | "server";

export type ProvisioningErrorState = {
  message: string;
  kind: ProvisioningErrorKind;
  statusCode?: number;
};

export type ProvisioningHookState = {
  status: ProvisioningStatusResponse | null;
  loading: boolean;
  polling: boolean;
  timedOut: boolean;
  takingLonger: boolean;
  elapsedMs: number;
  error: ProvisioningErrorState | null;
  canRetryStatus: boolean;
  retrying: boolean;
  retryCount: number;
  retryError: string | null;
  triggerManualRefresh: () => void;
  attemptProvisioningRetry: () => Promise<boolean>;
  resumePolling: () => void;
  stopPolling: () => void;
};

function now(): number {
  return typeof performance !== "undefined" && typeof performance.now === "function"
    ? performance.now()
    : Date.now();
}

export function useProvisioningStatus(autoStart = true): ProvisioningHookState {
  const [status, setStatus] = useState<ProvisioningStatusResponse | null>(null);
  const [loading, setLoading] = useState(autoStart);
  const [polling, setPolling] = useState(autoStart);
  const [timedOut, setTimedOut] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [error, setError] = useState<ProvisioningErrorState | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [retryError, setRetryError] = useState<string | null>(null);
  const [manualRefreshes, setManualRefreshes] = useState(0);
  const startTimeRef = useRef<number | null>(autoStart ? now() : null);
  const frameRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const loggedErrorRef = useRef(false);
  const refreshTokenRef = useRef(0);

  const takingLonger = useMemo(() => elapsedMs >= LONG_THRESHOLD_MS && !timedOut, [elapsedMs, timedOut]);

  const clearScheduled = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  };

  const stopPolling = useCallback(() => {
    setPolling(false);
    clearScheduled();
  }, []);

  const resumePolling = useCallback(() => {
    setTimedOut(false);
    setError(null);
    startTimeRef.current = now();
    setElapsedMs(0);
    setPolling(true);
    setLoading(true);
    refreshTokenRef.current += 1;
  }, []);

  useEffect(() => {
    if (!polling) {
      clearScheduled();
      return undefined;
    }

    let cancelled = false;
    const localToken = refreshTokenRef.current;

    if (!startTimeRef.current) {
      startTimeRef.current = now();
    }

    const updateElapsed = () => {
      if (!polling || cancelled) return;
      if (!startTimeRef.current) return;
      const delta = now() - startTimeRef.current;
      setElapsedMs(delta);
      frameRef.current = requestAnimationFrame(updateElapsed);
    };

    frameRef.current = requestAnimationFrame(updateElapsed);

    const performFetch = async () => {
      abortRef.current = new AbortController();
      try {
        const result = await fetchProvisioningStatus(abortRef.current.signal);
        if (cancelled || refreshTokenRef.current !== localToken) {
          return;
        }
        setStatus(result);
        setError(null);
        setLoading(false);
        setManualRefreshes(0);
        loggedErrorRef.current = false;
        if (result.status === "Active") {
          stopPolling();
          return;
        }
        if (result.status === "Failed") {
          stopPolling();
          return;
        }
        if (startTimeRef.current) {
          const elapsed = now() - startTimeRef.current;
          if (elapsed >= MAX_DURATION_MS) {
            setTimedOut(true);
            stopPolling();
            return;
          }
        }
        timerRef.current = setTimeout(() => {
          void performFetch();
        }, POLL_INTERVAL_MS);
      } catch (err) {
        if (cancelled || refreshTokenRef.current !== localToken) {
          return;
        }
        const isAbortError = err instanceof DOMException && err.name === "AbortError";
        if (isAbortError) {
          return;
        }
        if (!loggedErrorRef.current) {
          console.error("provisioning_status_poll_failed", {
            message: (err as Error)?.message ?? "unknown_error",
            status: (err as Error & { status?: number })?.status,
          });
          loggedErrorRef.current = true;
        }
        const statusCode = (err as Error & { status?: number })?.status;
        let kind: ProvisioningErrorKind = "server";
        if (statusCode === 401 || statusCode === 403) {
          kind = "auth";
        } else if (!statusCode) {
          kind = "network";
        }
        const message =
          kind === "network"
            ? "Server unreachable. Retry."
            : kind === "auth"
              ? "We couldn’t verify your session. Please sign in again."
              : `Setup hit an error (${statusCode ?? "unexpected"}).`;
        setError({
          kind,
          message,
          statusCode,
        });
        setLoading(false);
        stopPolling();
      }
    };

    void performFetch();

    return () => {
      cancelled = true;
      clearScheduled();
    };
  }, [polling, stopPolling]);

  useEffect(() => {
    return () => {
      clearScheduled();
    };
  }, []);

  const canRetryStatus = useMemo(() => {
    if (!error) return false;
    if (error.kind === "auth") return false;
    if (manualRefreshes >= MAX_NETWORK_RETRIES) return false;
    return true;
  }, [error, manualRefreshes]);

  const triggerManualRefresh = useCallback(() => {
    if (!canRetryStatus) return;
    setManualRefreshes((prev) => prev + 1);
    resumePolling();
  }, [canRetryStatus, resumePolling]);

  const attemptProvisioningRetry = useCallback(async () => {
    if (retrying) return false;
    if (retryCount >= MAX_PROVISIONING_RETRY_ATTEMPTS) return false;
    setRetrying(true);
    setRetryError(null);
    try {
      await requestProvisioningRetry();
      setRetryCount((prev) => prev + 1);
      startTimeRef.current = now();
      setElapsedMs(0);
      setTimedOut(false);
      setStatus((prev) => {
        if (!prev) {
          return { status: "Pending", lastUpdated: null, lastErrorCode: null };
        }
        return { ...prev, status: "Pending" as ProvisioningStatusCode, lastErrorCode: null };
      });
      setPolling(true);
      setLoading(true);
      refreshTokenRef.current += 1;
      loggedErrorRef.current = false;
      return true;
    } catch (err) {
      console.error("provisioning_retry_failed", {
        message: (err as Error)?.message ?? "unknown_error",
        status: (err as Error & { status?: number })?.status,
      });
      setRetryError("Retry failed. Try again shortly or contact support.");
      return false;
    } finally {
      setRetrying(false);
    }
  }, [retryCount, retrying]);

  return {
    status,
    loading,
    polling,
    timedOut,
    takingLonger,
    elapsedMs,
    error,
    canRetryStatus,
    retrying,
    retryCount,
    retryError,
    triggerManualRefresh,
    attemptProvisioningRetry,
    resumePolling,
    stopPolling,
  };
}
