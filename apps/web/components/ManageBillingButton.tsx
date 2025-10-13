"use client";

import { apiFetch } from "@/lib/http";

import { useEffect, useState } from "react";
import { openPopup, resolvePopupMessage } from "@/lib/popup";

type ManageBillingButtonProps = {
  className?: string;
  label?: string;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  tooltip?: string;
};

export default function ManageBillingButton({
  className = "",
  label = "Manage billing",
  variant = "primary",
  disabled = false,
  tooltip,
}: ManageBillingButtonProps) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    const allowedOrigin = "https://oneearlybird.ai";
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== allowedOrigin) return;
      const data = event.data as { type?: string } | null;
      if (!data || data.type !== "billing:portal:returned") return;
      resolvePopupMessage(data.type);
      setLoading(false);
    };
    const handleFallback = (event: Event) => {
      const detail = (event as CustomEvent<{ type?: string }>).detail;
      if (detail?.type === "billing:portal:returned") {
        setLoading(false);
      }
    };
    window.addEventListener("message", handleMessage);
    window.addEventListener("popup:fallback", handleFallback as EventListener);
    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("popup:fallback", handleFallback as EventListener);
    };
  }, []);

  async function openPortal() {
    if (loading || disabled) return;
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
        const popup = openPopup(url, {
          name: "stripe-portal",
          expectedMessageType: "billing:portal:returned",
        });
        if (!popup) {
          window.location.href = url;
        }
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
        disabled={loading || disabled}
        aria-busy={loading}
        title={disabled ? tooltip : undefined}
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
