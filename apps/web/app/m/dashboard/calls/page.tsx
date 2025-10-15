"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/http";
import { MobileCard, MobileCardContent, MobileCardFooter, MobileCardHeader } from "@/components/mobile/Card";
import MobileSheet from "@/components/mobile/Sheet";
import type { CallItem } from "@/components/RecentCallsPreview";
import { formatCallDuration, formatCallTimestamp, normalisePhone, outcomeLabel } from "@/lib/call-format";

type CallsFilters = {
  search: string;
  outcome: string;
  from: string;
  to: string;
};

type CallsResponse = {
  items: CallItem[];
  nextCursor: string | null;
};

const PAGE_SIZE = 15;

function toIsoDate(value: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(`${value}T00:00:00Z`);
  if (!Number.isFinite(date.getTime())) return undefined;
  return date.toISOString();
}

export default function MobileCallsPage() {
  const [filters, setFilters] = useState<CallsFilters>({ search: "", outcome: "all", from: "", to: "" });
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [items, setItems] = useState<CallItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [pendingCursor, setPendingCursor] = useState<string | null>(null);
  const [detail, setDetail] = useState<{ call: CallItem; tab: "overview" | "play" | "transcript" } | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);
  const [signingError, setSigningError] = useState<string | null>(null);

  const payloadForFilters = useCallback(
    (nextCursor?: string | null) => {
      const payload: Record<string, unknown> = { limit: PAGE_SIZE };
      if (nextCursor) payload.cursor = nextCursor;
      if (filters.search.trim()) payload.search = filters.search.trim();
      if (filters.outcome && filters.outcome !== "all") payload.outcome = filters.outcome;
      const fromIso = toIsoDate(filters.from);
      if (fromIso) payload.from = fromIso;
      const toIso = toIsoDate(filters.to);
      if (toIso) payload.to = toIso;
      return payload;
    },
    [filters],
  );

  const fetchCalls = useCallback(
    async (mode: "replace" | "append") => {
      if (mode === "append" && (!cursor || pendingCursor)) return;
      setLoading(true);
      setError(null);
      const requestCursor = mode === "append" ? cursor : null;
      if (mode === "append") {
        setPendingCursor(cursor);
      }
      try {
        const res = await apiFetch("/calls/list", {
          method: "POST",
          cache: "no-store",
          body: JSON.stringify(payloadForFilters(requestCursor ?? undefined)),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `calls_list_${res.status}`);
        }
        const json = (await res.json()) as CallsResponse;
        setCursor(json.nextCursor ?? null);
        setItems((prev) => (mode === "append" ? [...prev, ...(json.items ?? [])] : json.items ?? []));
      } catch (err) {
        setError(err instanceof Error ? err.message : "failed_to_load_calls");
      } finally {
        setLoading(false);
        setPendingCursor(null);
      }
    },
    [cursor, payloadForFilters, pendingCursor],
  );

  useEffect(() => {
    void fetchCalls("replace");
  }, [fetchCalls, filters]);

  const openDetail = useCallback((call: CallItem, tab: "overview" | "play" | "transcript") => {
    setDetail({ call, tab });
    setAudioUrl(null);
    setSigningError(null);
  }, []);

  const requestRecording = useCallback(async () => {
    if (!detail?.call?.recordingKey) {
      setSigningError("Recording not available");
      return;
    }
    setSigning(true);
    setSigningError(null);
    try {
      const res = await apiFetch("/media/signed-url", {
        method: "POST",
        body: JSON.stringify({ key: detail.call.recordingKey }),
        cache: "no-store",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `sign_${res.status}`);
      }
      const json = (await res.json()) as { url?: string };
      if (!json.url) throw new Error("missing_url");
      setAudioUrl(json.url);
    } catch (err) {
      setSigningError(err instanceof Error ? err.message : "Failed to fetch recording");
    } finally {
      setSigning(false);
    }
  }, [detail]);

  const hasMore = useMemo(() => Boolean(cursor), [cursor]);

  return (
    <>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6 text-white">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Calls</h1>
            <p className="text-sm text-white/60">Monitor recent conversations and jump into recordings.</p>
          </div>
          <button
            type="button"
            onClick={() => setFilterSheetOpen(true)}
            className="inline-flex h-11 items-center justify-center rounded-full border border-white/20 px-4 text-sm font-medium text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            Filters
          </button>
        </header>

        {error ? (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
            Failed to load calls. {error.replace(/_/g, " ")}
          </div>
        ) : null}

        <div className="space-y-3">
          {loading && items.length === 0
            ? Array.from({ length: 4 }).map((_, idx) => (
                <MobileCard key={idx}>
                  <div className="space-y-2" aria-hidden>
                    <div className="skeleton skeleton-line w-32" />
                    <div className="skeleton skeleton-line w-40" />
                    <div className="skeleton skeleton-line w-20" />
                  </div>
                </MobileCard>
              ))
            : null}

          {items.map((call) => (
            <MobileCard key={call.id}>
              <MobileCardHeader
                title={formatCallTimestamp(call.ts)}
                subtitle={`Caller ${normalisePhone(call.from)}`}
              />
              <MobileCardContent>
                <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
                  <span className="rounded-full border border-white/15 px-2 py-1">{outcomeLabel(call.outcome)}</span>
                  <span className="rounded-full border border-white/15 px-2 py-1">
                    {formatCallDuration(call.durationSec)}
                  </span>
                </div>
              </MobileCardContent>
              <MobileCardFooter>
                <button
                  type="button"
                  onClick={() => openDetail(call, "play")}
                  className="inline-flex flex-1 items-center justify-center rounded-full border border-white/20 px-3 py-2 text-sm text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                >
                  Play
                </button>
                <button
                  type="button"
                  onClick={() => openDetail(call, "transcript")}
                  className="inline-flex flex-1 items-center justify-center rounded-full border border-white/20 px-3 py-2 text-sm text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                >
                  Transcript
                </button>
                <button
                  type="button"
                  onClick={() => openDetail(call, "overview")}
                  className="inline-flex flex-1 items-center justify-center rounded-full border border-white/20 px-3 py-2 text-sm text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                >
                  More
                </button>
              </MobileCardFooter>
            </MobileCard>
          ))}
        </div>

        {hasMore ? (
          <button
            type="button"
            disabled={Boolean(pendingCursor)}
            onClick={() => void fetchCalls("append")}
            className="mt-2 inline-flex h-12 items-center justify-center rounded-full border border-white/20 px-6 text-sm font-medium text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:opacity-40"
          >
            {pendingCursor ? "Loading…" : "Load more"}
          </button>
        ) : null}
      </div>

      <MobileSheet open={filterSheetOpen} onClose={() => setFilterSheetOpen(false)} title="Filters">
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            setFilterSheetOpen(false);
            void fetchCalls("replace");
          }}
        >
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-white/70">Search</span>
            <input
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              placeholder="Caller, outcome, notes"
              className="h-12 rounded-xl border border-white/15 bg-white/5 px-3 text-white placeholder-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-white/70">Outcome</span>
            <select
              value={filters.outcome}
              onChange={(e) => setFilters((prev) => ({ ...prev, outcome: e.target.value }))}
              className="h-12 rounded-xl border border-white/15 bg-white/5 px-3 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              <option value="all">All outcomes</option>
              <option value="answered">Answered</option>
              <option value="appointmentBooked">Booked</option>
              <option value="voicemail">Voicemail deflected</option>
              <option value="missed">Missed</option>
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <label className="flex flex-col gap-2">
              <span className="text-white/70">From</span>
              <input
                type="date"
                value={filters.from}
                onChange={(e) => setFilters((prev) => ({ ...prev, from: e.target.value }))}
                className="h-12 rounded-xl border border-white/15 bg-white/5 px-3 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-white/70">To</span>
              <input
                type="date"
                value={filters.to}
                onChange={(e) => setFilters((prev) => ({ ...prev, to: e.target.value }))}
                className="h-12 rounded-xl border border-white/15 bg-white/5 px-3 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              />
            </label>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setFilters({ search: "", outcome: "all", from: "", to: "" })}
              className="inline-flex h-12 flex-1 items-center justify-center rounded-full border border-white/20 px-6 text-sm font-medium text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              Reset
            </button>
            <button
              type="submit"
              className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-black shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
            >
              Apply
            </button>
          </div>
        </form>
      </MobileSheet>

      <MobileSheet open={Boolean(detail)} onClose={() => setDetail(null)} title="Call details">
        {detail ? (
          <div className="space-y-4 text-sm text-white/80">
            <div>
              <div className="text-xs uppercase tracking-wide text-white/50">Time</div>
              <div className="mt-1 text-base font-semibold text-white">{formatCallTimestamp(detail.call.ts)}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-white/50">Caller</div>
              <div className="mt-1 text-base text-white/80">{normalisePhone(detail.call.from)}</div>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/60">
              <span className="rounded-full border border-white/15 px-2 py-1">{outcomeLabel(detail.call.outcome)}</span>
              <span className="rounded-full border border-white/15 px-2 py-1">{formatCallDuration(detail.call.durationSec)}</span>
            </div>

            {detail.tab === "play" ? (
              <div className="rounded-2xl border border-white/10 p-3">
                <div className="flex items-center justify-between text-sm text-white/70">
                  <span>Recording</span>
                  <button
                    type="button"
                    disabled={signing}
                    onClick={() => void requestRecording()}
                    className="inline-flex h-10 items-center justify-center rounded-full border border-white/20 px-3 text-xs text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:opacity-40"
                  >
                    {signing ? "Requesting…" : audioUrl ? "Refresh" : "Get URL"}
                  </button>
                </div>
                {signingError ? <p className="mt-2 text-xs text-red-300">{signingError}</p> : null}
                {audioUrl ? (
                  <audio controls className="mt-3 w-full">
                    <source src={audioUrl} />
                    Your browser does not support the audio element.
                  </audio>
                ) : (
                  <p className="mt-3 text-xs text-white/60">
                    {detail.call.hasRecording
                      ? "Request a temporary URL to stream the recording."
                      : "Recording not available for this call."}
                  </p>
                )}
              </div>
            ) : null}

            {detail.tab === "transcript" ? (
              <div className="rounded-2xl border border-white/10 p-3 text-sm text-white/70">
                {detail.call.hasTranscript
                  ? "Transcript is synced to your CRM. View in the desktop dashboard or CRM for the full text."
                  : "No transcript available for this call."}
              </div>
            ) : null}

            {detail.tab === "overview" ? (
              <div className="rounded-2xl border border-white/10 p-3 text-sm text-white/70">
                Full call metadata is available on desktop under Calls & Recordings.
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => setDetail(null)}
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
            >
              Close
            </button>
          </div>
        ) : null}
      </MobileSheet>
    </>
  );
}
