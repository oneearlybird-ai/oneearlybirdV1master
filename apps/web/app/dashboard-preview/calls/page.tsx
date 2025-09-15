"use client";

import { useMemo, useState } from "react";
import { RecentCallsPreview, SAMPLE_CALLS, type CallItem, CallDrawer } from "@/components/RecentCallsPreview";

export default function CallsPage() {
  const [query, setQuery] = useState("");
  const [outcome, setOutcome] = useState("all");
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [tab, setTab] = useState<'list'|'analytics'>('list');

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
  const [sortBy, setSortBy] = useState<'time'|'duration'>('time');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc');
  const sorted = useMemo(() => {
    const arr = filtered.slice();
    arr.sort((a,b) => {
      if (sortBy === 'time') {
        const da = new Date(a.ts).getTime();
        const db = new Date(b.ts).getTime();
        return sortDir === 'asc' ? da - db : db - da;
      }
      // duration mm:ss
      const ps = (s:string) => { const [m,sec] = s.split(':').map(Number); return (m||0)*60 + (sec||0); };
      const da = ps(a.duration), db = ps(b.duration);
      return sortDir === 'asc' ? da - db : db - da;
    });
    return arr;
  }, [filtered, sortBy, sortDir]);
  const pageRows = sorted.slice((page - 1) * pageSize, page * pageSize);
  const setSort = (key: 'time'|'duration') => {
    if (sortBy === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(key); setSortDir('desc'); }
  };

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
        <div className="ml-auto flex items-center gap-2 text-xs text-white/60">
          <span>Quick range:</span>
          <button onClick={() => { setStart(new Date().toISOString().slice(0,10)); setEnd(new Date().toISOString().slice(0,10)); setPage(1); }} className="rounded border border-white/20 px-2 py-1 hover:text-white">Today</button>
          <button onClick={() => { const d=new Date(); const endS=d.toISOString().slice(0,10); d.setDate(d.getDate()-6); const startS=d.toISOString().slice(0,10); setStart(startS); setEnd(endS); setPage(1); }} className="rounded border border-white/20 px-2 py-1 hover:text-white">7d</button>
          <button onClick={() => { const d=new Date(); const endS=d.toISOString().slice(0,10); d.setDate(d.getDate()-29); const startS=d.toISOString().slice(0,10); setStart(startS); setEnd(endS); setPage(1); }} className="rounded border border-white/20 px-2 py-1 hover:text-white">30d</button>
          <button onClick={() => { setStart(''); setEnd(''); setPage(1); }} className="rounded border border-white/20 px-2 py-1 hover:text-white">Clear</button>
        </div>
      </div>

      {/* Render using the existing preview list if no filters applied; else show filtered table */}
      {tab === 'list' && query === "" && outcome === "all" ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <h2 className="font-medium">Recent calls</h2>
              <div className="ml-4 rounded bg-white/10 p-1 text-xs">
                <button onClick={() => setTab('list')} className={`px-2 py-1 rounded ${tab === 'list' ? 'bg-white text-black' : 'text-white/80'}`}>List</button>
                <button onClick={() => setTab('analytics')} className={`px-2 py-1 rounded ${tab !== 'list' ? 'bg-white text-black' : 'text-white/80'}`}>Analytics</button>
              </div>
            </div>
          </div>
          <RecentCallsPreview />
        </div>
      ) : tab === 'list' ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <h2 className="font-medium">Filtered calls</h2>
              <div className="ml-4 rounded bg-white/10 p-1 text-xs">
                <button onClick={() => setTab('list')} className={`px-2 py-1 rounded ${tab === 'list' ? 'bg-white text-black' : 'text-white/80'}`}>List</button>
                <button onClick={() => setTab('analytics')} className={`px-2 py-1 rounded ${tab !== 'list' ? 'bg-white text-black' : 'text-white/80'}`}>Analytics</button>
              </div>
            </div>
          </div>
          <div className="px-4 pb-4">
            <div className="grid grid-cols-5 gap-3 text-xs text-white/60 border-b border-white/10 pb-2">
              <button onClick={() => setSort('time')} className="text-left hover:text-white">Time {sortBy==='time' ? (sortDir==='asc'?'↑':'↓') : ''}</button>
              <div>Caller</div>
              <button onClick={() => setSort('duration')} className="text-left hover:text-white">Duration {sortBy==='duration' ? (sortDir==='asc'?'↑':'↓') : ''}</button>
              <div>Outcome</div>
              <div>Actions</div>
            </div>
            {pageRows.map((call) => (
              <div key={call.id} className="grid grid-cols-5 items-center gap-3 py-3 hover:bg-white/[0.03]">
                <button onClick={() => setOpenId(call.id)} className="text-left text-sm text-white/80">{call.time}</button>
                <div className="text-sm text-white/80">{call.caller}</div>
                <div className="text-sm text-white/60">{call.duration}</div>
                <div className="text-sm"><OutcomeBadge text={call.outcome} /></div>
                <RowActions caller={call.caller} id={call.id} onOpen={() => setOpenId(call.id)} />
              </div>
            ))}
            {filtered.length === 0 ? (
              <div className="text-sm text-white/60 py-6">No calls match your filters.</div>
            ) : null}
          </div>
        </div>
      ) : (
        <CallsAnalytics />
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

function RowActions({ caller, id, onOpen }: { caller: string; id: string; onOpen: () => void }) {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async () => {
    try { await navigator.clipboard.writeText(caller); setCopied(id); setTimeout(() => setCopied(null), 1200); } catch (_err) { /* ignore in preview */ }
  };
  return (
    <div className="flex items-center gap-2">
      <button onClick={onOpen} className="rounded border border-white/20 px-2 py-1 text-xs text-white/80 hover:text-white">Open</button>
      <button onClick={copy} className="rounded border border-white/20 px-2 py-1 text-xs text-white/80 hover:text-white">{copied===id ? 'Copied' : 'Copy #'}</button>
    </div>
  );
}

function CallsAnalytics() {
  // preview-only charts
  const outcomes = [
    { label: 'Appointment', value: 48, color: '#10B981' },
    { label: 'Info', value: 32, color: '#6366F1' },
    { label: 'Voicemail', value: 20, color: '#EAB308' },
  ];
  const total = outcomes.reduce((a,b)=>a+b.value,0);
  const stops: string[] = [];
  let acc = 0;
  for (const p of outcomes) {
    const from = (acc/total)*100;
    const to = ((acc+p.value)/total)*100;
    stops.push(`${p.color} ${from}% ${to}%`);
    acc += p.value;
  }
  const bg = `conic-gradient(${stops.join(',')})`;
  const perDay = [6,8,7,9,5,10,8];
  const max = Math.max(...perDay,1);
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-3">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center justify-center">
        <div style={{ backgroundImage: bg }} className="relative h-40 w-40 rounded-full">
          <div className="absolute inset-6 rounded-full bg-neutral-950 border border-white/10 flex items-center justify-center text-sm">Outcomes</div>
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:col-span-2">
        <div className="font-medium">Outcome distribution</div>
        <ul className="mt-3 text-sm text-white/80 space-y-2">
          {outcomes.map(p => (
            <li key={p.label} className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: p.color }} />
              <span className="w-28">{p.label}</span>
              <div className="flex-1 h-2 rounded bg-white/10 overflow-hidden"><div className="h-full" style={{ width: `${(p.value/total)*100}%`, background: p.color }} /></div>
              <span className="w-10 text-right">{p.value}%</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:col-span-3">
        <div className="font-medium">Calls per day</div>
        <div className="mt-3 flex items-end gap-2 h-28">
          {perDay.map((v,i)=> (
            <div key={i} className="w-8 bg-white/10" style={{ height: `${(v/max)*100}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
