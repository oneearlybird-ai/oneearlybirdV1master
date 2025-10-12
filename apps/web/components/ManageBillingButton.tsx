"use client";

import { apiFetch } from "@/lib/http";

import { useState } from "react";

type ManageBillingButtonProps = {
  className?: string;
  label?: string;
  variant?: "primary" | "secondary";
};

export default function ManageBillingButton({ className = "", label = "Manage billing", variant = "primary" }: ManageBillingButtonProps) {
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

  const buttonClasses =
    variant === "secondary"
      ? "rounded-md border border-white/20 px-3 py-1.5 text-sm text-white/80 hover:text-white disabled:opacity-60"
      : "rounded-md bg-white text-black px-3 py-1.5 text-sm font-medium hover:bg-white/90 disabled:opacity-60";

  return (
    <div className={className}>
      <button
        onClick={openPortal}
        disabled={loading}
        aria-busy={loading}
        className={buttonClasses}
      >
        {loading ? "Opening…" : label}
      </button>
      {err ? (
        <div className="mt-2 text-xs text-red-400">{err.replace(/_/g, " ")}</div>
      ) : null}
    </div>
  );
}
