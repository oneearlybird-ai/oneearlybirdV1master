"use client";

import React, { useEffect, useState } from "react";

export type CallItem = {
  id: string;
  time: string;
  ts: string; // ISO timestamp for filtering/sorting
  caller: string;
  duration: string;
  outcome: string;
  transcript: string[];
};

export const SAMPLE_CALLS: CallItem[] = [
  {
    id: "c1",
    time: "Today 10:14",
    ts: "2025-09-15T10:14:00.000Z",
    caller: "(415) 555‑0198",
    duration: "02:45",
    outcome: "Appointment booked",
    transcript: [
      "EB: Hi! Thanks for calling Northstar Clinic. How can I help?",
      "Caller: I'd like to book a consultation.",
      "EB: Happy to help. I can do Tuesday at 2 PM."
    ]
  },
  {
    id: "c2",
    time: "Today 09:05",
    ts: "2025-09-15T09:05:00.000Z",
    caller: "(347) 555‑0101",
    duration: "01:12",
    outcome: "Info provided",
    transcript: [
      "EB: We’re open 8am–6pm weekdays.",
      "Caller: Great, thank you!",
      "EB: You’re welcome. Have a great day."
    ]
  },
  {
    id: "c3",
    time: "Yesterday 18:21",
    ts: "2025-09-14T18:21:00.000Z",
    caller: "(206) 555‑0112",
    duration: "00:48",
    outcome: "Voicemail deflected",
    transcript: [
      "EB: We can text you details now if preferred.",
      "Caller: Yes, please send the address.",
      "EB: Done. Anything else I can help with today?"
    ]
  }
];

// Removed row expander in favor of a dedicated drawer

// Shared drawer component
export function CallDrawer({ call, onClose }: { call: CallItem; onClose: () => void }) {
  const closeRef = React.useRef<HTMLButtonElement | null>(null);
  const [copied, setCopied] = useState(false);
  React.useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  const doCopy = async () => {
    try {
      await navigator.clipboard.writeText(call.transcript.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (_err) {
      // ignore clipboard errors in preview
    }
  };
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="call-details-title">
      <div className="absolute inset-0 bg-black/60 eb-overlay-in" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-neutral-950 border-l border-white/10 shadow-xl eb-drawer-in focus:outline-none" tabIndex={-1}>
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <h3 id="call-details-title" className="font-medium">Call details</h3>
          <div className="flex items-center gap-2">
            <button onClick={doCopy} className="rounded border border-white/20 px-2 py-1 text-xs text-white/80 hover:text-white">{copied ? 'Copied' : 'Copy transcript'}</button>
            <button ref={closeRef} onClick={onClose} className="rounded border border-white/20 px-2 py-1 text-xs text-white/80 hover:text-white">Close</button>
          </div>
        </div>
        <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-56px)]">
          <div className="text-sm text-white/70">{call.time} — {call.caller} — {call.duration}</div>
          <div>
            <div className="text-xs text-white/60">Outcome</div>
            <div className="mt-1 inline-flex items-center rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-white/80">{call.outcome}</div>
          </div>
          <div className="rounded-lg border border-white/10 p-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">Recording</div>
              <button disabled className="rounded border border-white/20 px-2 py-1 text-xs text-white/50">Play sample (coming soon)</button>
            </div>
            <p className="mt-2 text-xs text-white/60">Preview only — UI demo. No PHI, no live audio.</p>
          </div>
          <div>
            <div className="font-medium">Transcript (preview)</div>
            <ul className="mt-2 space-y-1 text-sm text-white/70">
              {call.transcript.map((line, i) => (
                <li key={i}>• {line}</li>
              ))}
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
}

export function RecentCallsPreview() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 360);
    return () => clearTimeout(t);
  }, []);
  const openCall = SAMPLE_CALLS.find(c => c.id === openId) || null;
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
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="grid grid-cols-4 items-center gap-3 py-3">
              <div className="skeleton skeleton-line w-24" />
              <div className="skeleton skeleton-line w-36" />
              <div className="skeleton skeleton-line w-16" />
              <div className="skeleton skeleton-badge" />
            </div>
          ))}
        </div>
      ) : SAMPLE_CALLS.map((call) => (
        <button
          key={call.id}
          className="table-row-btn grid w-full grid-cols-4 items-center gap-3 py-3 text-left hover:bg-white/[0.03] motion-safe:transition-colors"
          onClick={() => setOpenId(call.id)}
          aria-haspopup="dialog"
          aria-controls="call-details-title"
        >
          <div className="text-sm text-white/80">{call.time}</div>
          <div className="text-sm text-white/80">{call.caller}</div>
          <div className="text-sm text-white/60">{call.duration}</div>
          <div className="text-sm">
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-white/80">{call.outcome}</span>
          </div>
        </button>
      ))}
      {openCall ? <CallDrawer call={openCall} onClose={() => setOpenId(null)} /> : null}
    </div>
  );
}

export function LiveStatusBadge() {
  const [status, setStatus] = useState<null | { ok: boolean; version?: string }>(null);
  useEffect(() => {
    let cancelled = false;
    fetch('/api/usage/summary', { cache: 'no-store' })
      .then(async r => ({ ok: r.ok, body: r.ok ? await r.json() : null }))
      .then(({ ok, body }) => {
        if (!cancelled) setStatus({ ok, version: body?.version });
      })
      .catch(() => { if (!cancelled) setStatus({ ok: false }); });
    return () => { cancelled = true };
  }, []);
  if (!status) return <span className="text-sm text-white/60">Checking live status…</span>;
  return (
    <span className="text-sm">
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 border ${status.ok ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-red-500/30 bg-red-500/10 text-red-300'}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${status.ok ? 'bg-emerald-400' : 'bg-red-400'}`} />
        {status.ok ? 'Live' : 'Offline'}
      </span>
      {status.version ? <span className="ml-2 text-white/50">build {status.version.slice(0,7)}</span> : null}
    </span>
  );
}
