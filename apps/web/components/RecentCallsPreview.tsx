"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "@/lib/http";
import { formatCallDuration, formatCallTimestamp, normalisePhone, outcomeLabel } from "@/lib/call-format";

export type CallItem = {
  id: string;
  ts: string;
  from: string | null;
  to: string | null;
  outcome: string;
  durationSec: number;
  hasRecording: boolean;
  hasTranscript: boolean;
  recordingKey: string | null;
  transcriptKey: string | null;
};

type CallsResponse = {
  items: CallItem[];
  nextCursor: string | null;
};

type CallsPageData = CallsResponse & { cursor: string | null };

const PAGE_SIZE = 10;

async function fetchCalls(payload: Record<string, unknown>): Promise<CallsResponse> {
  const res = await apiFetch("/calls/list", {
    method: "POST",
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `calls_list_${res.status}`);
  }
  const json = (await res.json()) as CallsResponse;
  return {
    items: Array.isArray(json.items) ? json.items : [],
    nextCursor: json.nextCursor || null,
  };
}

export function RecentCallsPreview() {
  const [pages, setPages] = useState<CallsPageData[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [pendingCursor, setPendingCursor] = useState<string | null>(null);

  const initialFetchRef = useRef(false);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPendingCursor(null);
    try {
      const res = await fetchCalls({ limit: PAGE_SIZE });
      setPages([{ ...res, cursor: null }]);
      setPageIndex(0);
      setOpenId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed_to_load_calls");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialFetchRef.current) return;
    initialFetchRef.current = true;
    void loadInitial();
  }, [loadInitial]);

  const currentPage = pages[pageIndex] ?? null;
  const currentItems = currentPage?.items ?? [];

  const loadNextPage = useCallback(async () => {
    if (!currentPage?.nextCursor || pendingCursor) return;
    const cached = pages[pageIndex + 1];
    if (cached) {
      setPageIndex(pageIndex + 1);
      return;
    }
    setLoading(true);
    setError(null);
    setPendingCursor(currentPage.nextCursor);
    try {
      const res = await fetchCalls({ limit: PAGE_SIZE, cursor: currentPage.nextCursor });
      setPages((prev) => {
        const base = prev.slice(0, pageIndex + 1);
        return [...base, { ...res, cursor: currentPage.nextCursor }];
      });
      setPageIndex((prev) => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed_to_load_calls");
    } finally {
      setPendingCursor(null);
      setLoading(false);
    }
  }, [currentPage, pageIndex, pages, pendingCursor]);

  const goPrevPage = useCallback(() => {
    if (pageIndex === 0) return;
    setPageIndex((prev) => Math.max(0, prev - 1));
  }, [pageIndex]);

  const activeCall = useMemo(() => {
    if (!openId) return null;
    for (const page of pages) {
      const match = page.items.find((item) => item.id === openId);
      if (match) return match;
    }
    return null;
  }, [openId, pages]);

  const callOrder = currentItems.map((item) => item.id);
  const openIndex = openId ? callOrder.indexOf(openId) : -1;
  const prevCall = openIndex > 0 ? currentItems[openIndex - 1] : null;
  const nextCall = openIndex >= 0 && openIndex < currentItems.length - 1 ? currentItems[openIndex + 1] : null;

  return (
    <div className="px-4 pb-4">
      <div className="grid grid-cols-4 gap-3 text-xs text-white/60 border-b border-white/10 pb-2">
        <div>Time</div>
        <div>Caller</div>
        <div>Duration</div>
        <div>Outcome</div>
      </div>
      {loading ? (
        <div className="mt-2 space-y-2" aria-hidden>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="grid grid-cols-4 items-center gap-3 py-3">
              <div className="skeleton skeleton-line w-28" />
              <div className="skeleton skeleton-line w-36" />
              <div className="skeleton skeleton-line w-16" />
              <div className="skeleton skeleton-badge" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="mt-4 rounded border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
          Failed to load calls. {error}
          <button onClick={() => void loadInitial()} className="ml-3 underline">
            Retry
          </button>
        </div>
      ) : currentItems.length === 0 ? (
        <div className="mt-4 text-sm text-white/60">No calls yet.</div>
      ) : (
        <>
          {currentItems.map((call) => (
            <button
              key={call.id}
              className="table-row-btn grid w-full grid-cols-4 items-center gap-3 py-3 text-left hover:bg-white/[0.03] motion-safe:transition-colors"
              onClick={() => setOpenId(call.id)}
              aria-haspopup="dialog"
            >
              <div className="text-sm text-white/80">{formatCallTimestamp(call.ts)}</div>
              <div className="text-sm text-white/80 truncate">{normalisePhone(call.from)}</div>
              <div className="text-sm text-white/60">{formatCallDuration(call.durationSec)}</div>
              <div className="text-sm">
                <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-white/80">
                  {outcomeLabel(call.outcome)}
                </span>
              </div>
            </button>
          ))}
          <div className="mt-4 flex items-center justify-between text-sm text-white/70">
            <button
              type="button"
              className="rounded border border-white/15 px-3 py-1.5 disabled:opacity-40"
              onClick={goPrevPage}
              disabled={pageIndex === 0}
            >
              Previous
            </button>
            <div>
              Page {pageIndex + 1}
            </div>
            <button
              type="button"
              className="rounded border border-white/15 px-3 py-1.5 disabled:opacity-40"
              onClick={() => void loadNextPage()}
              disabled={!currentPage?.nextCursor || Boolean(pendingCursor)}
            >
              {pendingCursor ? "Loading…" : "Next"}
            </button>
          </div>
        </>
      )}
      {activeCall ? (
        <CallDrawer
          call={activeCall}
          onClose={() => setOpenId(null)}
          onPrev={prevCall ? () => setOpenId(prevCall.id) : undefined}
          onNext={nextCall ? () => setOpenId(nextCall.id) : undefined}
        />
      ) : null}
    </div>
  );
}

export function CallDrawer({
  call,
  onClose,
  onPrev,
  onNext,
}: {
  call: CallItem;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  const closeRef = React.useRef<HTMLButtonElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);
  const [signingError, setSigningError] = useState<string | null>(null);

  useEffect(() => {
    const prevActive = typeof document !== "undefined" ? (document.activeElement as HTMLElement | null) : null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if ((e.key === "ArrowLeft" || e.key.toLowerCase() === "k") && onPrev) {
        e.preventDefault();
        onPrev();
      }
      if ((e.key === "ArrowRight" || e.key.toLowerCase() === "j") && onNext) {
        e.preventDefault();
        onNext();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      try {
        prevActive?.focus();
      } catch {
        /* ignore focus errors */
      }
    };
  }, [onClose, onPrev, onNext]);

  const doCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        [
          `Call ID: ${call.id}`,
          `Time: ${formatCallTimestamp(call.ts)}`,
          `Caller: ${normalisePhone(call.from)}`,
          `Outcome: ${outcomeLabel(call.outcome)}`,
        ].join("\n"),
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore clipboard errors */
    }
  };

  const requestSignedUrl = async () => {
    if (!call.recordingKey) {
      setSigningError("Recording not available");
      return;
    }
    setSigning(true);
    setSigningError(null);
    try {
      const res = await apiFetch("/media/signed-url", {
        method: "POST",
        body: JSON.stringify({ key: call.recordingKey }),
        cache: "no-store",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `sign_failed_${res.status}`);
      }
      const json = (await res.json()) as { url?: string };
      if (json.url) {
        setAudioUrl(json.url);
      } else {
        throw new Error("missing_url");
      }
    } catch (err) {
      setSigningError(err instanceof Error ? err.message : "Failed to sign URL");
    } finally {
      setSigning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="call-details-title">
      <div className="absolute inset-0 bg-black/60 eb-overlay-in" onClick={onClose} />
      <aside
        className="absolute right-0 top-0 h-full w-full max-w-md bg-neutral-950 border-l border-white/10 shadow-xl eb-drawer-in focus:outline-none"
        tabIndex={-1}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <h3 id="call-details-title" className="font-medium">
            Call details
          </h3>
          <div className="flex items-center gap-2">
            {onPrev ? (
              <button
                onClick={onPrev}
                title="Previous (K / ←)"
                className="rounded border border-white/20 px-2 py-1 text-xs text-white/80 hover:text-white"
              >
                Prev
              </button>
            ) : null}
            {onNext ? (
              <button
                onClick={onNext}
                title="Next (J / →)"
                className="rounded border border-white/20 px-2 py-1 text-xs text-white/80 hover:text-white"
              >
                Next
              </button>
            ) : null}
            <button
              onClick={doCopy}
              className="rounded border border-white/20 px-2 py-1 text-xs text-white/80 hover:text-white"
            >
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              ref={closeRef}
              onClick={onClose}
              className="rounded border border-white/20 px-2 py-1 text-xs text-white/80 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
        <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-56px)]">
          <div className="text-sm text-white/70">{formatCallTimestamp(call.ts)}</div>
          <div>
            <div className="text-xs text-white/60">Caller</div>
            <div className="mt-1 text-white/80">{normalisePhone(call.from)}</div>
          </div>
          <div>
            <div className="text-xs text-white/60">Outcome</div>
            <div className="mt-1 inline-flex items-center rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-white/80">
              {outcomeLabel(call.outcome)}
            </div>
          </div>
          <div>
            <div className="text-xs text-white/60">Duration</div>
            <div className="mt-1 text-white/80">{formatCallDuration(call.durationSec)}</div>
          </div>
          <div className="rounded-lg border border-white/10 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-medium">Recording</div>
              <button
                disabled={signing}
                onClick={() => void requestSignedUrl()}
                className="rounded border border-white/20 px-2 py-1 text-xs text-white/80 hover:text-white disabled:opacity-40"
              >
                {signing ? "Requesting…" : "Get signed URL"}
              </button>
            </div>
            {signingError ? <p className="text-xs text-red-300">{signingError}</p> : null}
            {audioUrl ? (
              <audio controls className="w-full">
                <source src={audioUrl} />
                Your browser does not support the audio element.
              </audio>
            ) : (
              <p className="text-xs text-white/60">
                {call.hasRecording
                  ? "Click to request a presigned URL. Recording streams from secure storage."
                  : "No recording attached to this call."}
              </p>
            )}
          </div>
          <div>
            <div className="font-medium">Transcript</div>
            <p className="mt-2 text-sm text-white/70">
              {call.hasTranscript
                ? "Transcript available in your CRM or will sync shortly."
                : "No transcript captured for this call."}
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

export function LiveStatusBadge() {
  const [status, setStatus] = useState<{ ok: boolean; window?: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch("/api/dashboard/usage?window=week", { cache: "no-store" })
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) {
          setStatus({ ok: false });
          return;
        }
        const json = await res.json();
        setStatus({ ok: true, window: json?.window });
      })
      .catch(() => {
        if (!cancelled) setStatus({ ok: false });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!status) {
    return <span className="text-sm text-white/60">Checking live status…</span>;
  }
  return (
    <span className="text-sm">
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 border ${
          status.ok ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-red-500/30 bg-red-500/10 text-red-300"
        }`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${status.ok ? "bg-emerald-400" : "bg-red-400"}`} />
        {status.ok ? "Live" : "Offline"}
      </span>
      {status.window ? <span className="ml-2 text-white/50">window: {status.window}</span> : null}
    </span>
  );
}
