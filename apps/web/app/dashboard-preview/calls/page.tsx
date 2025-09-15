"use client";

import { useMemo, useState } from "react";
import { RecentCallsPreview, SAMPLE_CALLS, type CallItem, CallDrawer } from "@/components/RecentCallsPreview";

export default function CallsPage() {
  const [query, setQuery] = useState("");
  const [outcome, setOutcome] = useState("all");
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered: CallItem[] = useMemo(() => {
    return SAMPLE_CALLS.filter((c) => {
      const q = query.trim().toLowerCase();
      const okQ = !q || c.caller.toLowerCase().includes(q) || c.outcome.toLowerCase().includes(q);
      const okO = outcome === "all" || c.outcome.toLowerCase().includes(outcome);
      let okD = true;
      if (start) {
        okD = okD && new Date(c.ts) >= new Date(start + 'T00:00:00Z');
      }
      if (end) {
        okD = okD && new Date(c.ts) <= new Date(end + 'T23:59:59Z');
      }
      return okQ && okO && okD;
    });
  }, [query, outcome, start, end]);

  const pageSize = 10;
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

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
        <input
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
          aria-label="Start date"
        />
        <input
          type="date"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
          aria-label="End date"
        />
        <button
          onClick={() => exportCsv(filtered)}
          className="rounded-md border border-white/20 px-3 py-2 text-sm text-white/80 hover:text-white"
        >
          Export CSV
        </button>
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
            {pageRows.map((call) => (
              <button
                key={call.id}
                className="grid w-full grid-cols-4 items-center gap-3 py-3 text-left hover:bg-white/[0.03]"
                onClick={() => setOpenId(call.id)}
                aria-haspopup="dialog"
              >
                <div className="text-sm text-white/80">{call.time}</div>
                <div className="text-sm text-white/80">{call.caller}</div>
                <div className="text-sm text-white/60">{call.duration}</div>
                <div className="text-sm">
                  <OutcomeBadge text={call.outcome} />
                </div>
              </button>
            ))}
            {filtered.length === 0 ? (
              <div className="text-sm text-white/60 py-6">No calls match your filters.</div>
            ) : null}
          </div>
        </div>
      )}
      <div className="mt-3 flex items-center justify-between text-sm text-white/60">
        <div>
          Showing {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
        </div>
        <div className="flex items-center gap-2">
          <button disabled={page<=1} onClick={() => setPage(p => Math.max(1, p-1))} className="rounded border border-white/20 px-2 py-1 disabled:opacity-50">Prev</button>
          <span>Page {page} / {pageCount}</span>
          <button disabled={page>=pageCount} onClick={() => setPage(p => Math.min(pageCount, p+1))} className="rounded border border-white/20 px-2 py-1 disabled:opacity-50">Next</button>
        </div>
      </div>
      {openId ? (
        <CallDrawer call={filtered.find(c => c.id === openId) ?? SAMPLE_CALLS[0]} onClose={() => setOpenId(null)} />
      ) : null}
    </section>
  );
}

function exportCsv(rows: CallItem[]) {
  const header = ["time","caller","duration","outcome"];
  const body = rows.map(r => [r.time, r.caller, r.duration, r.outcome]);
  const csv = [header, ...body].map(cols => cols.map(sanitizeCsv).join(",")).join("\n");
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'calls.csv';
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

function sanitizeCsv(s: string) {
  const needsQuotes = /[",\n]/.test(s);
  const escaped = s.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

function OutcomeBadge({ text }: { text: string }) {
  const t = text.toLowerCase();
  let cls = "border-white/15 bg-white/5 text-white/80";
  if (t.includes("appointment")) cls = "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  else if (t.includes("info")) cls = "border-indigo-500/30 bg-indigo-500/10 text-indigo-300";
  else if (t.includes("voicemail")) cls = "border-yellow-500/30 bg-yellow-500/10 text-yellow-300";
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 ${cls}`}>{text}</span>;
}
