"use client";

import { useMemo, useState } from "react";
import { RecentCallsPreview, SAMPLE_CALLS, type CallItem } from "@/components/RecentCallsPreview";

export default function CallsPage() {
  const [query, setQuery] = useState("");
  const [outcome, setOutcome] = useState("all");

  const filtered: CallItem[] = useMemo(() => {
    return SAMPLE_CALLS.filter((c) => {
      const q = query.trim().toLowerCase();
      const okQ = !q || c.caller.toLowerCase().includes(q) || c.outcome.toLowerCase().includes(q);
      const okO = outcome === "all" || c.outcome.toLowerCase().includes(outcome);
      return okQ && okO;
    });
  }, [query, outcome]);

  return (
    <section>
      <h1 className="text-xl font-semibold tracking-tight">Calls & recordings</h1>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Search by caller or outcome"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
        />
        <select
          value={outcome}
          onChange={(e) => setOutcome(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
        >
          <option value="all">All outcomes</option>
          <option value="appointment">Appointment booked</option>
          <option value="info">Info provided</option>
          <option value="voicemail">Voicemail deflected</option>
        </select>
      </div>

      {/* Render using the existing preview list if no filters applied; else show filtered table */}
      {query === "" && outcome === "all" ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5">
          <div className="flex items-center justify-between p-4">
            <h2 className="font-medium">Recent calls</h2>
          </div>
          <RecentCallsPreview />
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5">
          <div className="flex items-center justify-between p-4">
            <h2 className="font-medium">Filtered calls</h2>
          </div>
          <div className="px-4 pb-4">
            <div className="grid grid-cols-4 gap-3 text-xs text-white/60 border-b border-white/10 pb-2">
              <div>Time</div>
              <div>Caller</div>
              <div>Duration</div>
              <div>Outcome</div>
            </div>
            {filtered.map((call) => (
              <div key={call.id} className="grid grid-cols-4 items-center gap-3 py-3">
                <div className="text-sm text-white/80">{call.time}</div>
                <div className="text-sm text-white/80">{call.caller}</div>
                <div className="text-sm text-white/60">{call.duration}</div>
                <div className="text-sm">
                  <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-white/80">{call.outcome}</span>
                </div>
              </div>
            ))}
            {filtered.length === 0 ? (
              <div className="text-sm text-white/60 py-6">No calls match your filters.</div>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}

