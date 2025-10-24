"use client";
import { apiFetch } from "@/lib/http";
import { useEffect, useState } from "react";

type ApiCall = {
  id: string;
  startedAt: string;
  callerMasked: string;
  outcome: "booked" | "qualified" | "voicemail" | "missed";
  sentiment: "pos" | "neu" | "neg";
  durationSec: number;
  costCents: number;
};

function Badge({ children, tone = "default" as const }: { children: React.ReactNode; tone?: "default" | "success" | "warn" | "danger" }) {
  const tones: Record<string, string> = {
    default: "bg-white/10 text-white/80",
    success: "bg-green-600/15 text-green-400",
    warn: "bg-amber-600/15 text-amber-300",
    danger: "bg-red-600/15 text-red-300",
  };
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${tones[tone]}`}>{children}</span>;
}

export default function CallsTableClient({ rows }: { rows: ApiCall[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [detail, setDetail] = useState<{ id: string; startedAt: string; durationSec: number; transcript: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load(id: string) {
      setLoading(true);
      setDetail(null);
      try {
        const res = await apiFetch('/recordings/item?id=' + encodeURIComponent(id), { cache: 'no-store' });
        const data = await res.json();
        if (!cancelled && res.ok && data?.ok) setDetail({ id: data.id, startedAt: data.startedAt, durationSec: data.durationSec, transcript: data.transcript || '' });
      } catch (_e) { /* ignore */ void 0 }
      finally { if (!cancelled) setLoading(false); }
    }
    if (openId) load(openId);
    return () => { cancelled = true };
  }, [openId]);

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_24px_70px_rgba(5,8,20,0.45)] backdrop-blur">
        <table className="w-full text-sm text-white/80">
          <thead className="bg-white/10 text-left text-white/60">
            <tr>
              <th className="px-5 py-3">Time</th>
              <th className="px-5 py-3">Caller</th>
              <th className="px-5 py-3">Outcome</th>
              <th className="px-5 py-3">Sentiment</th>
              <th className="px-5 py-3">Duration</th>
              <th className="px-5 py-3">Cost</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-white/10 transition hover:bg-white/10">
                <td className="whitespace-nowrap px-5 py-3">{new Date(r.startedAt).toLocaleString()}</td>
                <td className="px-5 py-3">{r.callerMasked}</td>
                <td className="px-5 py-3">
                  {r.outcome === "booked" ? (
                    <Badge tone="success">Booked</Badge>
                  ) : r.outcome === "qualified" ? (
                    <Badge>Qualified</Badge>
                  ) : r.outcome === "voicemail" ? (
                    <Badge tone="warn">Voicemail</Badge>
                  ) : (
                    <Badge tone="danger">Missed</Badge>
                  )}
                </td>
                <td className="px-5 py-3">
                  {r.sentiment === "pos" ? (
                    <Badge tone="success">Positive</Badge>
                  ) : r.sentiment === "neg" ? (
                    <Badge tone="danger">Negative</Badge>
                  ) : (
                    <Badge>Neutral</Badge>
                  )}
                </td>
                <td className="px-5 py-3">
                  {String(Math.floor(r.durationSec / 60)).padStart(2, "0")}:{String(r.durationSec % 60).padStart(2, "0")}
                </td>
                <td className="px-5 py-3">${(r.costCents / 100).toFixed(2)}</td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => setOpenId(r.id)}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition hover:-translate-y-0.5 hover:text-white"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openId && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpenId(null)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto border-l border-white/10 bg-[#05050b]/95 px-6 py-5 shadow-[0_0_60px_rgba(5,8,20,0.7)]">
            <div className="flex items-center justify-between">
              <div className="font-medium">Call Detail</div>
              <button
                onClick={() => setOpenId(null)}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 transition hover:text-white"
              >
                Close
              </button>
            </div>
            {loading ? (
              <div className="mt-4 text-sm text-white/70">Loading…</div>
            ) : detail ? (
              <div className="mt-4 space-y-3">
                <div className="text-xs text-white/60">ID: {detail.id}</div>
                <div className="text-xs text-white/60">Started: {new Date(detail.startedAt).toLocaleString()}</div>
                <div className="text-xs text-white/60">Duration: {Math.floor(detail.durationSec/60)}m {detail.durationSec%60}s</div>
                <div className="mt-2 font-medium">Transcript (masked)</div>
                <pre className="whitespace-pre-wrap text-sm text-white/80">{detail.transcript}</pre>
                <div className="mt-1 text-[11px] text-white/50">PII is masked. No PHI is shown.</div>
              </div>
            ) : (
              <div className="mt-4 text-sm text-red-300">Unable to load.</div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
