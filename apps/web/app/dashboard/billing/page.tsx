"use client";
import { useEffect, useState } from "react";

function getCookie(name: string): string | null {
  const m = document.cookie.match(new RegExp("(^| )" + name.replace(/[-[\]{}()*+?.,\\^$|#\\s]/g, "\\$&") + "=([^;]+)"));
  return m ? decodeURIComponent(m[2]) : null;
}

export default function BillingPage() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [plan, setPlan] = useState<{ name?: string | null; price?: string | null; interval?: string | null } | null>(null);
  const [upcoming, setUpcoming] = useState<{ amount?: string; date?: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/stripe/usage', { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok || !data?.ok) return;
        const p = data.plan || {};
        const nick = p.product_name || p.price_nickname || null;
        const unit = typeof p.unit_amount === 'number' ? (p.unit_amount / 100).toFixed(2) : null;
        if (!cancelled) setPlan({ name: nick, price: unit, interval: p.interval || null });
        const u = data.upcoming || null;
        if (u && typeof u.amount_due === 'number') {
          const amt = (u.amount_due / 100).toFixed(2);
          const ts = (u.next_payment_attempt || 0) * 1000;
          const date = ts ? new Date(ts).toLocaleDateString() : '';
          if (!cancelled) setUpcoming({ amount: amt, date });
        }
      } catch {
        // silent; usage block is optional
      }
    })();
    return () => { cancelled = true };
  }, []);

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
      {(plan || upcoming) && (
        <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm text-white/80 grid gap-4 md:grid-cols-2">
            <div>
              <div className="font-medium">Current plan</div>
              <div className="text-white/70">
                {plan?.name ? plan.name : '—'}
                {plan?.price ? (
                  <span> · ${plan.price}{plan?.interval ? `/${plan.interval}` : ''}</span>
                ) : null}
              </div>
            </div>
            <div>
              <div className="font-medium">Upcoming invoice</div>
              <div className="text-white/70">{upcoming?.amount ? `$${upcoming.amount}` : '—'}{upcoming?.date ? ` on ${upcoming.date}` : ''}</div>
            </div>
          </div>
        </div>
      )}
      <h2 className="text-xl font-semibold tracking-tight mb-2">Billing</h2>
      <p className="text-white/70">Manage plan and invoices here. No PHI is ever sent to Stripe metadata.</p>
      <button
        onClick={openPortal}
        disabled={loading}
        className="mt-3 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 disabled:opacity-50"
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
