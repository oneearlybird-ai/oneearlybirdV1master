"use client";

import Link from "next/link";
import { useMemo } from "react";
import { SAMPLE_CALLS, type CallItem } from "@/components/RecentCallsPreview";

export default function CallDetailPage({ params }: { params: { id: string } }) {
  const call = useMemo<CallItem | null>(() => SAMPLE_CALLS.find(c => c.id === params.id) ?? null, [params.id]);
  if (!call) {
    return (
      <section>
        <div className="text-sm text-white/60">Call not found.</div>
        <div className="mt-3"><Link href="/dashboard-preview/calls" className="underline">Back to Calls</Link></div>
      </section>
    );
  }
  return (
    <section>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Call details</h1>
        <Link href="/dashboard-preview/calls" className="rounded-md border border-white/20 px-3 py-1.5 text-sm text-white/80 hover:text-white">Back</Link>
      </div>

      <div className="mt-6 grid gap-4 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm text-white/70">{call.time} — {call.caller} — {call.duration}</div>
          <div className="mt-3 rounded-lg border border-white/10 p-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">Recording</div>
              <button disabled className="rounded border border-white/20 px-2 py-1 text-xs text-white/50">Play sample (coming soon)</button>
            </div>
            <p className="mt-2 text-xs text-white/60">Preview only — UI demo. No PHI, no live audio.</p>
          </div>
          <div className="mt-3">
            <div className="font-medium">Transcript (preview)</div>
            <ul className="mt-2 space-y-1 text-sm text-white/70">
              {call.transcript.map((line, i) => (
                <li key={i}>• {line}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="font-medium">Summary</div>
          <ul className="mt-2 text-sm text-white/80 space-y-1">
            <li>Outcome: {call.outcome}</li>
            <li>Caller: {call.caller}</li>
            <li>When: {new Date(call.ts).toLocaleString()}</li>
            <li>Duration: {call.duration}</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
