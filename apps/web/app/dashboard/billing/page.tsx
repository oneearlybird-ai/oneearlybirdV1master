"use client";
import { useState } from "react";

function getCookie(name: string): string | null {
  const m = document.cookie.match(new RegExp("(^| )" + name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&") + "=([^;]+)"));
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
      const data = await res.json();
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
    <section style={{ maxWidth: 960, margin: "0 auto", padding: 24 }}>
      <h2>Billing</h2>
      <p>Manage plan and invoices here. No PHI is ever sent to Stripe metadata.</p>
      <ul>
        <li>Current Plan: Starter</li>
        <li>Next Invoice: PHI-zero details only</li>
      </ul>
      <button
        onClick={openPortal}
        disabled={loading}
        style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd", cursor: loading ? "wait" : "pointer", marginTop: 12 }}
      >
        {loading ? "Opening…" : "Manage Billing in Stripe"}
      </button>
      {err && <p style={{ color: "#b00", marginTop: 8, fontSize: 12 }}>Error: {err}</p>}
      <p style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>
        Server-to-server portal session (no PHI). Swap to protected vendors later for HIPAA.
      </p>
    </section>
  );
}
