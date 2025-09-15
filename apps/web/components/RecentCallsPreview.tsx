"use client";

import { useEffect, useState } from "react";

type CallItem = {
  id: string;
  time: string;
  caller: string;
  duration: string;
  outcome: string;
  transcript: string[];
};

const SAMPLE_CALLS: CallItem[] = [
  {
    id: "c1",
    time: "Today 10:14",
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

function Row({ call, open, onToggle }: { call: CallItem; open: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-white/10">
      <button
        className="grid w-full grid-cols-4 items-center gap-3 py-3 text-left hover:bg-white/[0.03] motion-safe:transition-colors"
        aria-expanded={open}
        onClick={onToggle}
      >
        <div className="text-sm text-white/80">{call.time}</div>
        <div className="text-sm text-white/80">{call.caller}</div>
        <div className="text-sm text-white/60">{call.duration}</div>
        <div className="text-sm">
          <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-white/80">
            {call.outcome}
          </span>
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-white/80">
          <div className="mt-2 rounded-lg border border-white/10 p-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">Recording</div>
              <button disabled className="rounded border border-white/20 px-2 py-1 text-xs text-white/50">Play sample (coming soon)</button>
            </div>
            <p className="mt-2 text-xs text-white/60">Preview only — no PHI, no live audio.</p>
          </div>
          <div className="mt-3">
            <div className="font-medium">Transcript (preview)</div>
            <ul className="mt-2 space-y-1 text-white/70">
              {call.transcript.map((line, i) => (
                <li key={i}>• {line}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export function RecentCallsPreview() {
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <div className="px-4 pb-4">
      <div className="grid grid-cols-4 gap-3 text-xs text-white/60 border-b border-white/10 pb-2">
        <div>Time</div>
        <div>Caller</div>
        <div>Duration</div>
        <div>Outcome</div>
      </div>
      {SAMPLE_CALLS.map((c) => (
        <Row key={c.id} call={c} open={openId === c.id} onToggle={() => setOpenId(openId === c.id ? null : c.id)} />
      ))}
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

