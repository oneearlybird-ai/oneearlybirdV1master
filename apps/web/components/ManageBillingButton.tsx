"use client";

import { apiFetch } from "@/lib/http";

import { useState } from "react";

export default function ManageBillingButton({ className = "" }: { className?: string }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function openPortal() {
    if (loading) return;
    setErr(null);
    setLoading(true);
    try {
      const res = await apiFetch("/billing/portal", {
        method: "POST",
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const code = (data && (data.error || data.code)) || res.statusText || "request_failed";
        throw new Error(String(code));
      }
      const url = data?.url;
      if (typeof url === "string" && url.startsWith("http")) {
        window.location.href = url;
        return;
      }
      throw new Error("invalid_response");
    } catch (e: unknown) {
      const msg = (e as any)?.message || "request_failed";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <button
        onClick={openPortal}
        disabled={loading}
        aria-busy={loading}
        className="rounded-md bg-white text-black px-3 py-1.5 text-sm font-medium hover:bg-white/90 disabled:opacity-60"
      >
        {loading ? "Opening…" : "Manage billing"}
      </button>
      {err ? (
        <div className="mt-2 text-xs text-red-400">{err.replace(/_/g, " ")}</div>
      ) : null}
    </div>
  );
}
