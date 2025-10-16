"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "@/lib/http";
import { dashboardFetch } from "@/lib/dashboardFetch";
import { toast } from "@/components/Toasts";

type RoutingMode = "agent" | "passthrough";

type PhoneProfile = {
  did?: string | null;
  phoneVerifiedAt?: string | null;
  routingMode?: RoutingMode | null;
  agentEnabled?: boolean | null;
};

type VerificationChannel = "call" | "sms";

type PendingToggle =
  | { kind: "routing"; mode: RoutingMode }
  | { kind: "agent"; enabled: boolean };

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
  const pendingToggleRef = useRef<PendingToggle | null>(null);

  const [connectNumber, setConnectNumber] = useState("");
  const [connectPending, setConnectPending] = useState(false);
  const [connectChannel, setConnectChannel] = useState<VerificationChannel>("call");

  const [verifyCode, setVerifyCode] = useState("");
  const [verifyPending, setVerifyPending] = useState(false);
  const [verifyVisible, setVerifyVisible] = useState(false);

  const [routingPending, setRoutingPending] = useState(false);
  const [agentPending, setAgentPending] = useState(false);

  const verifiedLabel = useMemo(() => {
    if (!profile.phoneVerifiedAt) return "Not verified";
    return `Verified on ${formatDate(profile.phoneVerifiedAt)}`;
  }, [profile.phoneVerifiedAt]);

  const statusRows = useMemo(() => {
    const rows: Array<{ label: string; value: string }> = [];
    rows.push({
      label: "Caller ID (DID)",
      value: maskPhone(profile.did),
    });
    rows.push({
      label: "Routing mode",
      value: profile.routingMode === "agent" ? "AI Agent" : profile.routingMode === "passthrough" ? "Passthrough" : "—",
    });
    rows.push({
      label: "Agent status",
      value: typeof profile.agentEnabled === "boolean" ? (profile.agentEnabled ? "Enabled" : "Paused") : "—",
    });
    rows.push({ label: "Verification", value: verifiedLabel });
    return rows;
  }, [
    profile.agentEnabled,
    profile.did,
    profile.phoneVerifiedAt,
    profile.routingMode,
    verifiedLabel,
  ]);
  const refreshProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardFetch("/tenants/profile", { cache: "no-store" });
      if (!res.ok) throw new Error(`profile_${res.status}`);
      const data = (await res.json()) as Record<string, unknown> & PhoneProfile;
      const routing =
        typeof data.routingMode === "string" && (data.routingMode === "agent" || data.routingMode === "passthrough")
          ? (data.routingMode as RoutingMode)
          : null;
      const verifiedAt = typeof data.phoneVerifiedAt === "string" ? data.phoneVerifiedAt : null;
      setProfile({
        did: typeof data.did === "string" ? data.did : null,
        phoneVerifiedAt: verifiedAt,
        routingMode: routing,
        agentEnabled: typeof data.agentEnabled === "boolean" ? data.agentEnabled : null,
      });
      setVerifyVisible((prev) => prev || !verifiedAt);
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
        body: JSON.stringify({ businessNumber: number, channel: connectChannel }),
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
        throw new Error(payload.error || payload.message || `connect_${res.status}`);
      }
      toast("Verification code sent to your business number", "success");
      setVerifyVisible(true);
      void refreshProfile();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to connect number", "error");
    } finally {
      setConnectPending(false);
    }
  }, [connectChannel, connectNumber, refreshProfile]);

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
      setVerifyVisible(false);
      void refreshProfile();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Verification failed", "error");
    } finally {
      setVerifyPending(false);
    }
  }, [refreshProfile, verifyCode]);

  const updateRouting = useCallback(
    async (mode: RoutingMode, options?: { skipConfirm?: boolean }) => {
      const skipConfirm = options?.skipConfirm ?? false;
      if (!skipConfirm && profile.routingMode === mode) return;
      if (!skipConfirm && !window.confirm(`Switch routing to ${mode === "agent" ? "AI Agent" : "Passthrough"}?`)) {
        return;
      }
      setRoutingPending(true);
      try {
        const res = await apiFetch("/phone/routing", {
          method: "POST",
          body: JSON.stringify({ mode }),
        });
        if (res.status === 403) {
          const payload = (await res.json().catch(() => ({}))) as { error?: string; message?: string; code?: string };
          if ((payload?.code || payload?.error) === "phone_unverified") {
            pendingToggleRef.current = { kind: "routing", mode };
            setVerifyVisible(true);
            toast("Verify your number to update routing", "error");
            void refreshProfile();
            return;
          }
          throw new Error(payload.error || payload.message || "routing_403");
        }
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
    },
    [profile.routingMode, refreshProfile],
  );

  const updateAgent = useCallback(
    async (enabled: boolean, options?: { skipConfirm?: boolean }) => {
      const skipConfirm = options?.skipConfirm ?? false;
      if (!skipConfirm && profile.agentEnabled === enabled) return;
      if (!skipConfirm && !window.confirm(`Turn ${enabled ? "on" : "off"} the AI Agent?`)) return;
      setAgentPending(true);
      try {
        const res = await apiFetch("/agent/toggle", {
          method: "POST",
          body: JSON.stringify({ enabled }),
        });
        if (res.status === 403) {
          const payload = (await res.json().catch(() => ({}))) as { error?: string; message?: string; code?: string };
          if ((payload?.code || payload?.error) === "phone_unverified") {
            pendingToggleRef.current = { kind: "agent", enabled };
            setVerifyVisible(true);
            toast("Verify your number to toggle the agent", "error");
            void refreshProfile();
            return;
          }
          throw new Error(payload.error || payload.message || "agent_403");
        }
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
    },
    [profile.agentEnabled, refreshProfile],
  );

  useEffect(() => {
    if (!profile.phoneVerifiedAt) return;
    const pending = pendingToggleRef.current;
    if (!pending) return;
    pendingToggleRef.current = null;
    if (pending.kind === "routing") {
      void updateRouting(pending.mode, { skipConfirm: true });
    } else {
      void updateAgent(pending.enabled, { skipConfirm: true });
    }
  }, [profile.phoneVerifiedAt, updateAgent, updateRouting]);

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
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs uppercase tracking-wide text-white/60">Delivery method</span>
            <div
              role="group"
              aria-label="Verification delivery method"
              className="inline-flex rounded-md border border-white/15 bg-white/5 p-0.5"
            >
              <button
                type="button"
                onClick={() => setConnectChannel("call")}
                disabled={connectPending}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  connectChannel === "call"
                    ? "bg-white text-black shadow"
                    : "text-white/70 hover:text-white"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                Send via Call
              </button>
              <button
                type="button"
                onClick={() => setConnectChannel("sms")}
                disabled={connectPending}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  connectChannel === "sms"
                    ? "bg-white text-black shadow"
                    : "text-white/70 hover:text-white"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                Send via SMS
              </button>
            </div>
          </div>
        </div>

        {verifyVisible ? (
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
          </div>
        ) : null}
        <p className="text-xs text-white/50">{verifiedLabel}</p>
      </SectionCard>

      <SectionCard title="Status">
        {statusRows.length > 0 ? (
          <dl className="space-y-2">
            {statusRows.map((row) => (
              <div key={row.label} className="flex items-center justify-between">
                <dt className="text-white/60">{row.label}</dt>
                <dd className="text-white">{row.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-xs text-white/50">No phone setup detected yet.</p>
        )}
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
