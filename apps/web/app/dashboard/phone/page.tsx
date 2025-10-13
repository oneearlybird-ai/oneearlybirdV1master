"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/http";
import { toast } from "@/components/Toasts";

type RoutingMode = "agent" | "passthrough";

type PhoneProfile = {
  businessNumber?: string | null;
  did?: string | null;
  phoneVerifiedAt?: string | null;
  routingMode?: RoutingMode | null;
  agentEnabled?: boolean | null;
};

const ROUTING_MODES: Array<{ value: RoutingMode; label: string }> = [
  { value: "agent", label: "AI Agent" },
  { value: "passthrough", label: "Passthrough" },
];

function maskPhone(value: string | null | undefined): string {
  if (!value) return "—";
  const digits = value.replace(/\D/g, "");
  if (digits.length < 4) return value;
  const last4 = digits.slice(-4);
  return `•••-•••-${last4}`;
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function SectionCard({ title, children, footer }: { title: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <header>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </header>
      <div className="mt-4 space-y-3 text-sm text-white/80">{children}</div>
      {footer ? <footer className="mt-4 text-xs text-white/50">{footer}</footer> : null}
    </section>
  );
}

export default function PhoneAndAgentPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<PhoneProfile>({});

  const [connectNumber, setConnectNumber] = useState("");
  const [connectPending, setConnectPending] = useState(false);

  const [verifyCode, setVerifyCode] = useState("");
  const [verifyPending, setVerifyPending] = useState(false);

  const [routingPending, setRoutingPending] = useState(false);
  const [agentPending, setAgentPending] = useState(false);

  const verifiedLabel = useMemo(() => {
    if (!profile.phoneVerifiedAt) return "Not verified";
    return `Verified on ${formatDate(profile.phoneVerifiedAt)}`;
  }, [profile.phoneVerifiedAt]);

  const refreshProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/tenants/profile", { cache: "no-store" });
      if (!res.ok) throw new Error(`profile_${res.status}`);
      const data = (await res.json()) as Record<string, unknown> & PhoneProfile;
      setProfile({
        businessNumber: (data.businessNumber as string | null) ?? null,
        did: (data.did as string | null) ?? null,
        phoneVerifiedAt: (data.phoneVerifiedAt as string | null) ?? null,
        routingMode: (data.routingMode as RoutingMode | null) ?? null,
        agentEnabled: typeof data.agentEnabled === "boolean" ? data.agentEnabled : null,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "profile_fetch_failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  const handleConnect = useCallback(async () => {
    const number = connectNumber.trim();
    if (!number) {
      toast("Enter a phone number to connect", "error");
      return;
    }
    setConnectPending(true);
    try {
      const res = await apiFetch("/phone/connect", {
        method: "POST",
        body: JSON.stringify({ businessNumber: number }),
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
        throw new Error(payload.error || payload.message || `connect_${res.status}`);
      }
      toast("Verification code sent to your business number", "success");
      setProfile((prev) => ({ ...prev, businessNumber: number }));
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to connect number", "error");
    } finally {
      setConnectPending(false);
    }
  }, [connectNumber]);

  const handleVerify = useCallback(async () => {
    const code = verifyCode.trim();
    if (!code) {
      toast("Enter the verification code", "error");
      return;
    }
    setVerifyPending(true);
    try {
      const res = await apiFetch("/phone/verify", {
        method: "POST",
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
        throw new Error(payload.error || payload.message || `verify_${res.status}`);
      }
      toast("Number verified", "success");
      setVerifyCode("");
      setProfile((prev) => ({ ...prev, phoneVerifiedAt: new Date().toISOString() }));
      void refreshProfile();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Verification failed", "error");
    } finally {
      setVerifyPending(false);
    }
  }, [refreshProfile, verifyCode]);

  const updateRouting = useCallback(async (mode: RoutingMode) => {
    if (profile.routingMode === mode) return;
    if (!window.confirm(`Switch routing to ${mode === "agent" ? "AI Agent" : "Passthrough"}?`)) return;
    setRoutingPending(true);
    try {
      const res = await apiFetch("/phone/routing", {
        method: "POST",
        body: JSON.stringify({ mode }),
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
        throw new Error(payload.error || payload.message || `routing_${res.status}`);
      }
      toast("Routing mode updated", "success");
      setProfile((prev) => ({ ...prev, routingMode: mode }));
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to update routing", "error");
    } finally {
      setRoutingPending(false);
    }
  }, [profile.routingMode]);

  const updateAgent = useCallback(async (enabled: boolean) => {
    if (profile.agentEnabled === enabled) return;
    if (!window.confirm(`Turn ${enabled ? "on" : "off"} the AI Agent?`)) return;
    setAgentPending(true);
    try {
      const res = await apiFetch("/agent/toggle", {
        method: "POST",
        body: JSON.stringify({ enabled }),
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
        throw new Error(payload.error || payload.message || `agent_${res.status}`);
      }
      toast(`Agent ${enabled ? "enabled" : "paused"}`, "success");
      setProfile((prev) => ({ ...prev, agentEnabled: enabled }));
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to update agent", "error");
    } finally {
      setAgentPending(false);
    }
  }, [profile.agentEnabled]);

  return (
    <main className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Phone &amp; Agent</h1>
        <p className="mt-2 text-sm text-white/70">
          Connect your business number, verify ownership, and control how calls route between the AI agent and passthrough.
        </p>
      </div>

      <SectionCard title="Connect your business number" footer="Need to port an existing number? Visit Support → Porting.">
        <div>
          <label className="block text-xs uppercase tracking-wide text-white/60" htmlFor="business-number">
            Step 1 — Business number
          </label>
          <div className="mt-1 flex flex-col gap-2 sm:flex-row">
            <input
              id="business-number"
              type="tel"
              inputMode="tel"
              placeholder="(555) 555-1234"
              value={connectNumber}
              onChange={(event) => setConnectNumber(event.target.value)}
              className="flex-1 rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20"
              autoComplete="tel"
            />
            <button
              type="button"
              onClick={handleConnect}
              disabled={connectPending}
              className="shrink-0 rounded-md bg-white px-3 py-2 text-sm font-medium text-black hover:bg-white/90 disabled:opacity-60"
            >
              {connectPending ? "Sending…" : "Send code"}
            </button>
          </div>
          {profile.businessNumber ? (
            <p className="text-xs text-white/50">Current number: {profile.businessNumber}</p>
          ) : null}
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wide text-white/60" htmlFor="verification-code">
            Step 2 — Verify code
          </label>
          <div className="mt-1 flex flex-col gap-2 sm:flex-row">
            <input
              id="verification-code"
              type="text"
              placeholder="6-digit code"
              value={verifyCode}
              onChange={(event) => setVerifyCode(event.target.value)}
              className="flex-1 rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20"
              inputMode="numeric"
              pattern="[0-9]*"
            />
            <button
              type="button"
              onClick={handleVerify}
              disabled={verifyPending}
              className="shrink-0 rounded-md border border-white/20 px-3 py-2 text-sm text-white/80 hover:text-white disabled:opacity-60"
            >
              {verifyPending ? "Verifying…" : "Verify"}
            </button>
          </div>
          <p className="text-xs text-white/50">{verifiedLabel}</p>
        </div>
      </SectionCard>

      <SectionCard title="Status">
        <dl className="space-y-2">
          <div className="flex items-center justify-between">
            <dt className="text-white/60">Caller ID (DID)</dt>
            <dd className="text-white">{maskPhone(profile.did)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-white/60">Routing mode</dt>
            <dd className="text-white">{profile.routingMode ? (profile.routingMode === "agent" ? "AI Agent" : "Passthrough") : "—"}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-white/60">Agent status</dt>
            <dd className="text-white">{typeof profile.agentEnabled === "boolean" ? (profile.agentEnabled ? "Enabled" : "Paused") : "—"}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-white/60">Verification</dt>
            <dd className="text-white">{verifiedLabel}</dd>
          </div>
        </dl>
        {loading ? <p className="text-xs text-white/50">Loading status…</p> : null}
        {error ? <p className="text-xs text-rose-300">{error}</p> : null}
      </SectionCard>

      <SectionCard title="Routing &amp; Agent controls">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-medium text-white">Routing</div>
              <p className="text-xs text-white/60">Choose whether calls go to the AI agent or passthrough.</p>
            </div>
            <div className="flex items-center gap-2">
              {ROUTING_MODES.map((mode) => (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() => updateRouting(mode.value)}
                  disabled={routingPending}
                  className={`rounded-md border px-3 py-1.5 text-sm ${profile.routingMode === mode.value ? "border-white/60 bg-white/10 text-white" : "border-white/20 text-white/70 hover:text-white"} disabled:opacity-60`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-medium text-white">AI Agent</div>
              <p className="text-xs text-white/60">Pause or resume the agent without changing routing.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateAgent(true)}
                disabled={agentPending}
                className={`rounded-md border px-3 py-1.5 text-sm ${profile.agentEnabled ? "border-white/60 bg-white/10 text-white" : "border-white/20 text-white/70 hover:text-white"} disabled:opacity-60`}
              >
                On
              </button>
              <button
                type="button"
                onClick={() => updateAgent(false)}
                disabled={agentPending}
                className={`rounded-md border px-3 py-1.5 text-sm ${profile.agentEnabled === false ? "border-white/60 bg-white/10 text-white" : "border-white/20 text-white/70 hover:text-white"} disabled:opacity-60`}
              >
                Off
              </button>
            </div>
          </div>
        </div>
      </SectionCard>
    </main>
  );
}
