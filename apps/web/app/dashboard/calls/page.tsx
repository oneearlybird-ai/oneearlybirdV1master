"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CallDrawer, type CallItem } from "@/components/RecentCallsPreview";
import { apiFetch } from "@/lib/http";
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

const PAGE_SIZE = 25;

function toIsoDate(date: string): string | undefined {
  if (!date) return undefined;
  const composed = `${date}T00:00:00.000Z`;
  const dt = new Date(composed);
  if (!Number.isFinite(dt.getTime())) return undefined;
  return dt.toISOString();
}

async function requestCalls(payload: Record<string, unknown>): Promise<CallsResponse> {
  const res = await apiFetch("/calls/list", {
    method: "POST",
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `calls_list_${res.status}`);
  }
  const json = (await res.json()) as CallsResponse;
  return {
    items: Array.isArray(json.items) ? json.items : [],
    nextCursor: json.nextCursor || null,
  };
}

export default function CallsPage() {
  const [filters, setFilters] = useState<CallsFilters>({ search: "", outcome: "all", from: "", to: "" });
  const [items, setItems] = useState<CallItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const fetchSeq = useRef(0);

  const buildPayload = useCallback(
    (cursor?: string | null) => {
      const payload: Record<string, unknown> = { limit: PAGE_SIZE };
      if (cursor) payload.cursor = cursor;
      if (filters.search.trim()) payload.search = filters.search.trim();
      if (filters.outcome && filters.outcome !== "all") payload.outcome = filters.outcome;
      const fromIso = toIsoDate(filters.from);
      if (fromIso) payload.from = fromIso;
      const toIsoValue = toIsoDate(filters.to);
      if (toIsoValue) payload.to = toIsoValue;
      return payload;
    },
    [filters],
  );

  const fetchCalls = useCallback(
    async (mode: "replace" | "append", cursor?: string | null) => {
      const seq = ++fetchSeq.current;
      setLoading(true);
      setError(null);
      try {
        const res = await requestCalls(buildPayload(cursor));
        if (fetchSeq.current !== seq) return; // stale
        setItems((prev) => (mode === "replace" ? res.items : [...prev, ...res.items]));
        setNextCursor(res.nextCursor ?? null);
        if (mode === "replace") setOpenId(null);
      } catch (err) {
        if (fetchSeq.current !== seq) return;
        setError(err instanceof Error ? err.message : "failed_to_fetch_calls");
      } finally {
        if (fetchSeq.current === seq) setLoading(false);
      }
    },
    [buildPayload],
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      void fetchCalls("replace");
    }, 250);
    return () => clearTimeout(timeout);
  }, [filters, fetchCalls]);

  const activeCall = useMemo(() => items.find((item) => item.id === openId) ?? null, [items, openId]);
  const callIds = items.map((call) => call.id);
  const openIndex = openId ? callIds.indexOf(openId) : -1;
  const prevCall = openIndex > 0 ? items[openIndex - 1] : null;
  const nextCallItem = openIndex >= 0 && openIndex < items.length - 1 ? items[openIndex + 1] : null;

  return (
    <section>
      <h1 className="text-xl font-semibold tracking-tight">Calls & recordings</h1>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Search by caller or outcome"
          aria-label="Search calls"
          value={filters.search}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
          className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
        />
        <select
          aria-label="Outcome filter"
          value={filters.outcome}
          onChange={(e) => setFilters((prev) => ({ ...prev, outcome: e.target.value }))}
          className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
        >
          <option value="all">All outcomes</option>
          <option value="answered">Answered</option>
          <option value="appointmentBooked">Booked</option>
          <option value="voicemail">Voicemail deflected</option>
          <option value="missed">Missed</option>
        </select>
        <input
          type="date"
          value={filters.from}
          onChange={(e) => setFilters((prev) => ({ ...prev, from: e.target.value }))}
          className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
          aria-label="Start date"
        />
        <input
          type="date"
          value={filters.to}
          onChange={(e) => setFilters((prev) => ({ ...prev, to: e.target.value }))}
          className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
          aria-label="End date"
        />
        <button
          className="rounded-md border border-white/20 px-3 py-2 text-sm text-white/80 hover:text-white"
          onClick={() => setFilters({ search: "", outcome: "all", from: "", to: "" })}
        >
          Clear filters
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5">
        <div className="flex items-center justify-between p-4">
          <h2 className="font-medium">Recent calls</h2>
          <span className="text-xs text-white/60">
            {items.length} results{loading ? " (loading…)" : ""}
          </span>
        </div>
        <div className="px-4 pb-4">
          <div className="grid grid-cols-[1.2fr,1fr,0.6fr,0.9fr,0.8fr] gap-3 text-xs text-white/60 border-b border-white/10 pb-2">
            <div>Time</div>
            <div>Caller</div>
            <div>Duration</div>
            <div>Outcome</div>
            <div>Recording</div>
          </div>
          {loading && items.length === 0 ? (
            <div className="mt-3 space-y-2" aria-hidden>
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="grid grid-cols-[1.2fr,1fr,0.6fr,0.9fr,0.8fr] items-center gap-3 py-3">
                  <div className="skeleton skeleton-line w-36" />
                  <div className="skeleton skeleton-line w-32" />
                  <div className="skeleton skeleton-line w-16" />
                  <div className="skeleton skeleton-badge" />
                  <div className="skeleton skeleton-line w-20" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="mt-3 rounded border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
              Failed to load calls. {error}
              <button className="ml-3 underline" onClick={() => void fetchCalls("replace")}>
                Retry
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="mt-3 text-sm text-white/60">No calls found for the selected filters.</div>
          ) : (
            <div className="mt-2 divide-y divide-white/10">
              {items.map((call) => (
                <button
                  key={call.id}
                  className="grid w-full grid-cols-[1.2fr,1fr,0.6fr,0.9fr,0.8fr] items-center gap-3 py-3 text-left hover:bg-white/[0.03] motion-safe:transition-colors"
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
                  <div className="text-sm text-white/70">{call.hasRecording ? "Available" : "—"}</div>
                </button>
              ))}
            </div>
          )}
          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              className="rounded border border-white/15 px-3 py-1.5 text-sm text-white/80 hover:text-white disabled:opacity-40"
              onClick={() => void fetchCalls("replace")}
              disabled={loading}
            >
              Refresh
            </button>
            <button
              type="button"
              className="rounded border border-white/15 px-3 py-1.5 text-sm text-white/80 hover:text-white disabled:opacity-40"
              onClick={() => void fetchCalls("append", nextCursor ?? undefined)}
              disabled={loading || !nextCursor}
            >
              {nextCursor ? (loading ? "Loading…" : "Load next page") : "No more pages"}
            </button>
          </div>
        </div>
      </div>

      {activeCall ? (
        <CallDrawer
          call={activeCall}
          onClose={() => setOpenId(null)}
          onPrev={prevCall ? () => setOpenId(prevCall.id) : undefined}
          onNext={nextCallItem ? () => setOpenId(nextCallItem.id) : undefined}
        />
      ) : null}
    </section>
  );
}
