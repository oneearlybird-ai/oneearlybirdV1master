"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RecentCallsPreview, SAMPLE_CALLS, type CallItem, CallDrawer } from "@/components/RecentCallsPreview";

export default function CallsPage() {
  const [query, setQuery] = useState("");
  const [outcome, setOutcome] = useState("all");
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [minDur, setMinDur] = useState<string>("");
  const [maxDur, setMaxDur] = useState<string>("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [tab, setTab] = useState<'list'|'analytics'>('list');
  const [reviewed, setReviewed] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const filterTimer = useRef<number | null>(null);

  const bumpBusy = () => {
    setBusy(true);
    if (filterTimer.current) window.clearTimeout(filterTimer.current);
    filterTimer.current = window.setTimeout(() => setBusy(false), 250);
  };

  const ps = (s:string) => { const [m,sec] = s.split(':').map(Number); return (m||0)*60 + (sec||0); };
  const filtered: CallItem[] = useMemo(() => {
    return SAMPLE_CALLS.filter((c) => {
      const q = query.trim().toLowerCase();
      const okQ = !q || c.caller.toLowerCase().includes(q) || c.outcome.toLowerCase().includes(q);
      const okO = outcome === "all" || c.outcome.toLowerCase().includes(outcome);
      let okD = true;
      if (start) okD = okD && new Date(c.ts) >= new Date(start + 'T00:00:00Z');
      if (end) okD = okD && new Date(c.ts) <= new Date(end + 'T23:59:59Z');
      let okT = true;
      const secs = ps(c.duration);
      if (minDur) okT = okT && secs >= Number(minDur);
      if (maxDur) okT = okT && secs <= Number(maxDur);
      return okQ && okO && okD && okT;
    });
  }, [query, outcome, start, end, minDur, maxDur]);

  const pageSize = 10;
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const [sortBy, setSortBy] = useState<'time'|'duration'|'outcome'>('time');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc');
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const listRef = useRef<HTMLDivElement | null>(null);
  const sorted = useMemo(() => {
    const arr = filtered.slice();
    arr.sort((a,b) => {
      if (sortBy === 'time') {
        const da = new Date(a.ts).getTime();
        const db = new Date(b.ts).getTime();
        return sortDir === 'asc' ? da - db : db - da;
      }
      if (sortBy === 'outcome') {
        const oa = a.outcome.toLowerCase();
        const ob = b.outcome.toLowerCase();
        if (oa === ob) return 0;
        return sortDir === 'asc' ? (oa < ob ? -1 : 1) : (oa < ob ? 1 : -1);
      }
      const da = ps(a.duration), db = ps(b.duration);
      return sortDir === 'asc' ? da - db : db - da;
    });
    return arr;
  }, [filtered, sortBy, sortDir]);
  const pageRows = sorted.slice((page - 1) * pageSize, page * pageSize);
  const setSort = (key: 'time'|'duration'|'outcome') => {
    if (sortBy === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(key); setSortDir('desc'); }
  };

  // Keyboard navigation for rows
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('input,select,textarea,button,[role="dialog"]')) return;
      if (tab !== 'list') return;
      if (e.key === 'ArrowDown') { e.preventDefault(); setFocusedIndex(i => Math.min((i < 0 ? 0 : i + 1), pageRows.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setFocusedIndex(i => Math.max((i <= 0 ? 0 : i - 1), 0)); }
      if (e.key === 'Enter' && focusedIndex >= 0 && focusedIndex < pageRows.length) { e.preventDefault(); setOpenId(pageRows[focusedIndex].id); }
      if (e.key === 'Escape') { setOpenId(null); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tab, pageRows, focusedIndex]);

  return (
    <section>
      <h1 className="text-xl font-semibold tracking-tight">Calls & recordings</h1>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Search by caller or outcome"
          aria-label="Search calls"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); bumpBusy(); }}
          className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
        />
        <div className="pill-group" role="group" aria-label="Outcome filter">
          {[
            { key: 'all', label: 'All' },
            { key: 'appointment', label: 'Booked' },
            { key: 'info', label: 'Info' },
            { key: 'voicemail', label: 'Voicemail' },
          ].map(p => (
            <button key={p.key} type="button" className="pill" aria-pressed={outcome===p.key}
              onClick={() => { setOutcome(p.key); setPage(1); bumpBusy(); }}>
              {p.label}
            </button>
          ))}
        </div>
        <input type="date" value={start} onChange={(e) => { setStart(e.target.value); setPage(1); bumpBusy(); }} className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/20" aria-label="Start date" />
        <input type="date" value={end} onChange={(e) => { setEnd(e.target.value); setPage(1); bumpBusy(); }} className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/20" aria-label="End date" />
        <div className="pill-group" role="group" aria-label="Date range quick picks">
          <button type="button" className="pill" onClick={() => { const d=new Date(); const iso=d.toISOString().slice(0,10); setStart(iso); setEnd(iso); setPage(1); bumpBusy(); }}>Today</button>
          <button type="button" className="pill" onClick={() => { const d=new Date(); const endIso=d.toISOString().slice(0,10); const d2=new Date(Date.now()-6*24*3600*1000); const startIso=d2.toISOString().slice(0,10); setStart(startIso); setEnd(endIso); setPage(1); bumpBusy(); }}>7d</button>
          <button type="button" className="pill" onClick={() => { const d=new Date(); const endIso=d.toISOString().slice(0,10); const d2=new Date(Date.now()-29*24*3600*1000); const startIso=d2.toISOString().slice(0,10); setStart(startIso); setEnd(endIso); setPage(1); bumpBusy(); }}>30d</button>
        </div>
        <input type="number" placeholder="Min sec" value={minDur} onChange={(e) => { setMinDur(e.target.value); setPage(1); bumpBusy(); }} className="w-24 bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/20" aria-label="Min duration (seconds)" />
        <input type="number" placeholder="Max sec" value={maxDur} onChange={(e) => { setMaxDur(e.target.value); setPage(1); bumpBusy(); }} className="w-24 bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/20" aria-label="Max duration (seconds)" />
        <button
          onClick={() => { setQuery(""); setOutcome("all"); setStart(""); setEnd(""); setMinDur(""); setMaxDur(""); setPage(1); bumpBusy(); }}
          className="ml-auto rounded-md border border-white/20 px-3 py-2 text-sm text-white/80 hover:text-white"
        >
          Clear filters
        </button>
        <span className="text-xs text-white/60">Tip: filter by outcome or date; use Min/Max sec for duration.</span>
      </div>

      {/* Loading skeleton during filtering */}
      {busy ? (
        <SkeletonCalls />
      ) : query === '' && outcome === 'all' && !start && !end && !minDur && !maxDur ? (
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
            <div>
              <button disabled className="rounded border border-white/20 px-3 py-1.5 text-xs text-white/60 cursor-not-allowed" aria-disabled="true" aria-label="Download CSV (coming soon)">
                Download CSV (soon)
              </button>
            </div>
          </div>
          <div className="px-4 pb-4" ref={listRef}>
            <div className="grid grid-cols-5 gap-3 text-xs text-white/60 border-b border-white/10 pb-2 sticky-head">
              <button onClick={() => setSort('time')} className="text-left hover:text-white">Time {sortBy==='time' ? (sortDir==='asc'?'↑':'↓') : ''}</button>
              <div>Caller</div>
              <button onClick={() => setSort('duration')} className="text-left hover:text-white">Duration {sortBy==='duration' ? (sortDir==='asc'?'↑':'↓') : ''}</button>
              <button onClick={() => setSort('outcome')} className="text-left hover:text-white">Outcome {sortBy==='outcome' ? (sortDir==='asc'?'↑':'↓') : ''}</button>
              <div>Actions</div>
            </div>
            {pageRows.map((call, i) => {
              const isRecent = Date.now() - new Date(call.ts).getTime() < 24*60*60*1000;
              const isNew = isRecent && !reviewed[call.id];
              const isFocused = i === focusedIndex;
              return (
                <div key={call.id} className={`grid grid-cols-5 items-center gap-3 py-3 hover:bg-white/[0.03] ${isFocused ? 'outline outline-2 outline-white/40 rounded-md' : ''}`} tabIndex={isFocused ? 0 : -1}
                  onClick={() => setFocusedIndex(i)} onFocus={() => setFocusedIndex(i)}>
                  <button onClick={() => setOpenId(call.id)} className="text-left text-sm text-white/80 flex items-center gap-2">
                    {call.time}
                    {isNew ? <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] px-1.5 py-0.5">NEW</span> : null}
                  </button>
                  <div className="text-sm text-white/80">{call.caller}</div>
                  <div className="text-sm text-white/60">{call.duration}</div>
                  <div className="text-sm"><OutcomeBadge text={call.outcome} /></div>
                  <RowActions caller={call.caller} id={call.id} onOpen={() => setOpenId(call.id)} onReviewed={() => setReviewed(r=>({...r,[call.id]:true}))} reviewed={!!reviewed[call.id]} />
                </div>
              );
            })}
            {filtered.length === 0 ? (
              <div className="text-sm text-white/60 py-6">No calls match your filters.</div>
            ) : null}
          </div>
        </div>
      ) : (
        <CallsAnalytics />
      )}
      <div className="mt-3 flex items-center justify-between text-sm text-white/60">
        <div aria-live="polite">
          Showing {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
        </div>
        <div className="flex items-center gap-2">
          <label className="hidden md:flex items-center gap-2">
            <span>Rows per page</span>
            <select disabled className="rounded border border-white/20 bg-white/5 px-2 py-1 text-white/60 cursor-not-allowed" aria-disabled="true" aria-label="Rows per page (coming soon)">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
          </label>
          <button onClick={() => setReviewed(r => ({...r, ...Object.fromEntries(pageRows.map(c=>[c.id,true]))}))} className="rounded border border-white/20 px-2 py-1">Mark all reviewed</button>
          <button disabled={page<=1} onClick={() => setPage(p => Math.max(1, p-1))} className="rounded border border-white/20 px-2 py-1 disabled:opacity-50">Prev</button>
          <span>Page {page} / {pageCount}</span>
          <button disabled={page>=pageCount} onClick={() => setPage(p => Math.min(pageCount, p+1))} className="rounded border border-white/20 px-2 py-1 disabled:opacity-50">Next</button>
        </div>
      </div>
      {openId ? (<CallDrawer call={filtered.find(c => c.id === openId) ?? SAMPLE_CALLS[0]} onClose={() => setOpenId(null)} />) : null}
    </section>
  );
}



function SkeletonCalls() {
  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 animate-pulse">
      <div className="flex items-center justify-between p-4">
        <div className="h-4 w-24 bg-white/10 rounded" />
        <div className="h-6 w-32 bg-white/10 rounded" />
      </div>
      <div className="px-4 pb-4">
        <div className="h-5 bg-white/10 rounded mb-3" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-10 bg-white/5 rounded mb-2 border border-white/10" />
        ))}
      </div>
    </div>
  );
}

function OutcomeBadge({ text }: { text: string }) {
  const t = text.toLowerCase();
  let cls = "border-white/15 bg-white/5 text-white/80";
  if (t.includes("appointment")) cls = "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  else if (t.includes("info")) cls = "border-indigo-500/30 bg-indigo-500/10 text-indigo-300";
  else if (t.includes("voicemail")) cls = "border-yellow-500/30 bg-yellow-500/10 text-yellow-300";
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 ${cls}`}>{text}</span>;
}

function RowActions({ caller, id, onOpen, onReviewed, reviewed }: { caller: string; id: string; onOpen: () => void; onReviewed: () => void; reviewed: boolean }) {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async () => {
    try { await navigator.clipboard.writeText(caller); setCopied(id); setTimeout(() => setCopied(null), 1200); } catch (_err) { /* ignore in preview */ }
  };
  return (
    <div className="flex items-center gap-2">
      <button onClick={onOpen} className="rounded border border-white/20 px-2 py-1 text-xs text-white/80 hover:text-white" aria-label={`Open call ${id}`}>Open</button>
      <button onClick={copy} className="rounded border border-white/20 px-2 py-1 text-xs text-white/80 hover:text-white" aria-label={`Copy caller for ${id}`}>{copied===id ? 'Copied' : 'Copy #'}</button>
      <button onClick={onReviewed} className={`rounded border px-2 py-1 text-xs ${reviewed ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-white/20 text-white/80 hover:text-white'}`} aria-pressed={reviewed} aria-label={reviewed ? `Mark ${id} unreviewed` : `Mark ${id} reviewed`}>{reviewed ? 'Reviewed' : 'Mark reviewed'}</button>
    </div>
  );
}

function CallsAnalytics() {
  const outcomes = [
    { label: 'Appointment', value: 48, color: '#10B981' },
    { label: 'Info', value: 32, color: '#6366F1' },
    { label: 'Voicemail', value: 20, color: '#EAB308' },
  ];
  const total = outcomes.reduce((a,b)=>a+b.value,0);
  const perDay = [6,8,7,9,5,10,8];
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-3">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center justify-center">
        <Donut parts={outcomes} />
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:col-span-2">
        <div className="font-medium">Outcome distribution</div>
        <ul className="mt-3 text-sm text-white/80 space-y-2">
          {outcomes.map(p => (
            <li key={p.label} className="flex items-center gap-2">
              <svg width="8" height="8" aria-hidden><circle cx="4" cy="4" r="4" fill={p.color} /></svg>
              <span className="w-28">{p.label}</span>
              <svg viewBox="0 0 100 6" className="flex-1 h-2">
                <rect x="0" y="0" height="6" width={(p.value/total)*100} fill={p.color} />
              </svg>
              <span className="w-10 text-right">{p.value}%</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:col-span-3">
        <div className="font-medium">Calls per day</div>
        <Bars data={perDay} />
      </div>
    </div>
  );
}

function Donut({ parts }: { parts: { label: string; value: number; color: string }[] }) {
  const total = parts.reduce((a,b)=>a+b.value,0) || 1;
  let startAngle = -Math.PI/2;
  const radius = 60; const cx = 80; const cy = 80; const thickness = 20;
  const rings = parts.map((p, idx) => {
    const angle = (p.value/total) * Math.PI * 2;
    const end = startAngle + angle;
    const path = arcPath(cx, cy, radius, startAngle, end);
    startAngle = end;
    return <path key={idx} d={path} fill={p.color} />;
  });
  return (
    <svg viewBox="0 0 160 160" width="160" height="160" aria-label="Outcomes donut">
      <g transform={`translate(0,0)`}>{rings}</g>
      <circle cx={cx} cy={cy} r={radius - thickness} fill="#0F1117" stroke="rgba(255,255,255,0.1)" />
      <text x={cx} y={cy} fill="#FFFFFF" opacity="0.8" fontSize="10" textAnchor="middle" dominantBaseline="middle">Outcomes</text>
    </svg>
  );
}

function arcPath(cx: number, cy: number, r: number, start: number, end: number) {
  const x1 = cx + r * Math.cos(start);
  const y1 = cy + r * Math.sin(start);
  const x2 = cx + r * Math.cos(end);
  const y2 = cy + r * Math.sin(end);
  const largeArc = end - start > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

function Bars({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  const width = data.length * 14 + 6;
  const height = 100;
  let x = 3;
  const rects = data.map((v, i) => {
    const h = Math.round((v / max) * height);
    const y = height - h;
    const r = <rect key={i} x={x} y={y} width={12} height={h} fill="rgba(255,255,255,0.6)" />;
    x += 14;
    return r;
  });
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="mt-3 w-full h-28" aria-label="Calls per day">
      <rect x="0" y="0" width={width} height={height} fill="none" />
      {rects}
    </svg>
  );
}
