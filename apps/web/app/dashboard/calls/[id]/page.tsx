"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/http";
import type { CallItem } from "@/components/RecentCallsPreview";
import { formatCallDuration, formatCallTimestamp, normalisePhone, outcomeLabel } from "@/lib/call-format";

type CallState = {
  call: CallItem | null;
  loading: boolean;
  error: string | null;
};

async function fetchCallById(id: string): Promise<CallItem | null> {
  const res = await apiFetch("/calls/list", {
    method: "POST",
    body: JSON.stringify({ limit: 1, search: id }),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `call_fetch_${res.status}`);
  }
  const json = (await res.json()) as { items?: CallItem[] };
  if (!Array.isArray(json.items) || json.items.length === 0) return null;
  return json.items[0];
}

export default function CallDetailPage({ params }: { params: { id: string } }) {
  const [state, setState] = useState<CallState>({ call: null, loading: true, error: null });
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);
  const [signingError, setSigningError] = useState<string | null>(null);
  const call = state.call;

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setState({ call: null, loading: true, error: null });
      try {
        const call = await fetchCallById(params.id);
        if (!cancelled) {
          setState({ call, loading: false, error: call ? null : "Call not found" });
        }
      } catch (err) {
        if (!cancelled) {
          setState({ call: null, loading: false, error: err instanceof Error ? err.message : "Failed to load call" });
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const requestSignedUrl = async (key: string | null) => {
    if (!key) {
      setSigningError("Recording not available");
      return;
    }
    setSigning(true);
    setSigningError(null);
    try {
      const res = await apiFetch("/media/signed-url", {
        method: "POST",
        body: JSON.stringify({ key }),
        cache: "no-store",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `sign_failed_${res.status}`);
      }
      const json = (await res.json()) as { url?: string };
      if (!json.url) throw new Error("missing_url");
      setAudioUrl(json.url);
    } catch (err) {
      setSigningError(err instanceof Error ? err.message : "Failed to sign URL");
    } finally {
      setSigning(false);
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Call details</h1>
        <Link
          href="/dashboard/calls"
          className="rounded-md border border-white/20 px-3 py-1.5 text-sm text-white/80 hover:text-white hover:-translate-y-0.5 transition-transform"
        >
          Back
        </Link>
      </div>

      {state.loading ? (
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="skeleton skeleton-line w-40" />
            <div className="mt-3 skeleton skeleton-box h-24" />
          </div>
        </div>
      ) : state.error ? (
        <div className="mt-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">{state.error}</div>
      ) : call ? (
        <div className="mt-6 grid gap-4 grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
            <div className="text-sm text-white/70">
              {formatCallTimestamp(call.ts)} — {normalisePhone(call.from)} — {formatCallDuration(call.durationSec)}
            </div>
            <div className="rounded-lg border border-white/10 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium">Recording</div>
                <button
                  disabled={signing}
                  onClick={() => void requestSignedUrl(call.recordingKey)}
                  className="rounded border border-white/20 px-2 py-1 text-xs text-white/80 hover:text-white disabled:opacity-40"
                >
                  {signing ? "Requesting…" : "Get signed URL"}
                </button>
              </div>
              {signingError ? <p className="text-xs text-red-300">{signingError}</p> : null}
              {audioUrl ? (
                <audio controls className="w-full">
                  <source src={audioUrl} />
                  Your browser does not support audio playback.
                </audio>
              ) : (
                <p className="text-xs text-white/60">
                  {call.hasRecording
                    ? "Click to request a presigned URL. Audio streams securely from CloudFront."
                    : "No recording attached to this call."}
                </p>
              )}
            </div>
            <div>
              <div className="font-medium">Transcript</div>
              <p className="mt-2 text-sm text-white/70">
                {call.hasTranscript
                  ? "Transcript is available in your CRM or will sync shortly."
                  : "No transcript captured for this call."}
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="font-medium">Summary</div>
            <ul className="mt-2 text-sm text-white/80 space-y-1">
              <li>Outcome: {outcomeLabel(call.outcome)}</li>
              <li>Caller: {normalisePhone(call.from)}</li>
              <li>When: {formatCallTimestamp(call.ts)}</li>
              <li>Duration: {formatCallDuration(call.durationSec)}</li>
              <li>Recording: {call.hasRecording ? "Available" : "—"}</li>
              <li>Transcript: {call.hasTranscript ? "Available" : "—"}</li>
              <li>To: {normalisePhone(call.to)}</li>
            </ul>
          </div>
        </div>
      ) : null}
    </section>
  );
}
