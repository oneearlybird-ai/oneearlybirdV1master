"use client";
import { useState } from "react";

function getCookie(name: string): string | null {
  const m = document.cookie.match(new RegExp("(^| )" + name.replace(/[-[\]{}()*+?.,\\^$|#\\s]/g, "\\$&") + "=([^;]+)"));
  return m ? decodeURIComponent(m[2]) : null;
}

export default function BillingPage() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function openPortal() {
    setErr(null);
    setLoading(true);
    try {
      const csrf = getCookie("eb_csrf") || "";
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "content-type": "application/json", "x-eb-csrf": csrf },
      });

      const ct = res.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await res.json() : { ok: false, error: await res.text() };

      if (!res.ok) {
        setErr(data?.error || "unavailable");
      } else if (data?.url) {
        window.location.href = data.url;
      } else {
        setErr("no url");
      }
    } catch {
      setErr("network");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="max-w-[960px] mx-auto p-6">
      <h2>Billing</h2>
      <p>Manage plan and invoices here. No PHI is ever sent to Stripe metadata.</p>
      <ul>
        <li>Current Plan: Starter</li>
        <li>Next Invoice: PHI-zero details only</li>
      </ul>
      <button
        onClick={openPortal}
        disabled={loading}
        className={`px-:math:displaypx:math:display-:math:displaypx:math:display-lg border border-gray-300 mt-3 `}
      >
        {loading ? "Opening…" : "Manage Billing in Stripe"}
      </button>
      {err && <p className="text-red-700 mt-2 text-xs">Error: {err}</p>}
      <p className="text-xs opacity-70 mt-2">
        Server-to-server portal session (no PHI). Swap to protected vendors later for HIPAA.
      </p>
    </section>
  );
}
