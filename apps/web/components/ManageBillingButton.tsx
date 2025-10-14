"use client";

import { apiFetch } from "@/lib/http";

import { useEffect, useState } from "react";
import { openPopup } from "@/lib/popup";

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
  const [showOverlay, setShowOverlay] = useState(false);
  useEffect(() => {
    const handlePortalReturned = () => {
      setLoading(false);
      setShowOverlay(false);
    };
    window.addEventListener("ob:billing:portal:returned", handlePortalReturned);
    return () => {
      window.removeEventListener("ob:billing:portal:returned", handlePortalReturned);
    };
  }, []);

  async function openPortal() {
    if (loading || disabled) return;
    setErr(null);
    setLoading(true);
    let keepActive = false;
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
        const popup = openPopup(url, "stripe-portal", {
          expectedMessageType: "billing:portal:returned",
          w: 540,
          h: 680,
        });
        if (!popup) {
          setShowOverlay(false);
          setLoading(false);
          window.location.href = url;
        }
        if (popup) {
          keepActive = true;
          setShowOverlay(true);
        }
        return;
      }
      throw new Error("invalid_response");
    } catch (e: unknown) {
      const msg = (e as any)?.message || "request_failed";
      setErr(msg);
    } finally {
      if (!keepActive) {
        setLoading(false);
        setShowOverlay(false);
      }
    }
  }

  const buttonClasses =
    variant === "secondary"
      ? "rounded-md border border-white/20 px-3 py-1.5 text-sm text-white/80 hover:text-white disabled:opacity-60"
      : "rounded-md bg-white text-black px-3 py-1.5 text-sm font-medium hover:bg-white/90 disabled:opacity-60";

  return (
    <div className={className}>
      {showOverlay ? (
        <div
          className="pointer-events-none fixed inset-0 z-40 bg-black/25 backdrop-blur-[1px] transition-opacity"
          aria-hidden="true"
        />
      ) : null}
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
