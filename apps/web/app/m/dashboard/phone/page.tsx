"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "@/lib/http";
import { MobileCard, MobileCardContent, MobileCardFooter, MobileCardHeader } from "@/components/mobile/Card";
import MobileSheet from "@/components/mobile/Sheet";
import { toast } from "@/components/Toasts";

type RoutingMode = "agent" | "passthrough";

type PhoneProfile = {
  did?: string | null;
  phoneVerifiedAt?: string | null;
  routingMode?: RoutingMode | null;
  agentEnabled?: boolean | null;
};

export default function MobilePhonePage() {
  const [profile, setProfile] = useState<PhoneProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [connectNumber, setConnectNumber] = useState("+");
  const [connectChannel, setConnectChannel] = useState<"call" | "sms">("call");
  const [connectPending, setConnectPending] = useState(false);
  const [verifySheetOpen, setVerifySheetOpen] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyPending, setVerifyPending] = useState(false);
  const [routingPending, setRoutingPending] = useState(false);
  const [agentPending, setAgentPending] = useState(false);
  const pendingToggleRef = useRef<RoutingMode | boolean | null>(null);

  const refreshProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/tenants/profile", { cache: "no-store" });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `profile_${res.status}`);
      }
      const data = (await res.json()) as PhoneProfile & Record<string, unknown>;
      setProfile({
        did: typeof data.did === "string" ? data.did : null,
        phoneVerifiedAt: typeof data.phoneVerifiedAt === "string" ? data.phoneVerifiedAt : null,
        routingMode: data.routingMode === "agent" || data.routingMode === "passthrough" ? (data.routingMode as RoutingMode) : null,
        agentEnabled: typeof data.agentEnabled === "boolean" ? data.agentEnabled : null,
      });
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to load phone profile", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  const handleConnect = useCallback(async () => {
    const number = connectNumber.trim();
    if (!number.startsWith("+")) {
      toast("Use E.164 format, e.g. +14155552671", "error");
      return;
    }
    setConnectPending(true);
    try {
      const res = await apiFetch("/phone/connect", {
        method: "POST",
        cache: "no-store",
        body: JSON.stringify({ businessNumber: number, channel: connectChannel }),
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
        throw new Error(payload.error || payload.message || `connect_${res.status}`);
      }
      toast("Verification code sent", "success");
      setVerifySheetOpen(true);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to send code", "error");
    } finally {
      setConnectPending(false);
    }
  }, [connectChannel, connectNumber]);

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
        cache: "no-store",
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
        throw new Error(payload.error || payload.message || `verify_${res.status}`);
      }
      toast("Number verified", "success");
      setVerifyCode("");
      setVerifySheetOpen(false);
      await refreshProfile();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Verification failed", "error");
    } finally {
      setVerifyPending(false);
    }
  }, [refreshProfile, verifyCode]);

  const updateRouting = useCallback(
    async (mode: RoutingMode) => {
      if (profile?.routingMode === mode) return;
      setRoutingPending(true);
      try {
        const res = await apiFetch("/phone/routing", {
          method: "POST",
          cache: "no-store",
          body: JSON.stringify({ mode }),
        });
        if (res.status === 403) {
          const payload = (await res.json().catch(() => ({}))) as { code?: string };
          if ((payload.code || "") === "phone_unverified") {
            pendingToggleRef.current = mode;
            setVerifySheetOpen(true);
            toast("Verify your number to change routing", "error");
            return;
          }
          throw new Error("routing_forbidden");
        }
        if (!res.ok) {
          const payload = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
          throw new Error(payload.error || payload.message || `routing_${res.status}`);
        }
        await refreshProfile();
        toast("Routing updated", "success");
      } catch (err) {
        toast(err instanceof Error ? err.message : "Failed to update routing", "error");
      } finally {
        setRoutingPending(false);
      }
    },
    [profile?.routingMode, refreshProfile],
  );

  const updateAgent = useCallback(
    async (enabled: boolean) => {
      if (profile?.agentEnabled === enabled) return;
      setAgentPending(true);
      try {
        const res = await apiFetch("/agent/toggle", {
          method: "POST",
          cache: "no-store",
          body: JSON.stringify({ enabled }),
        });
        if (res.status === 403) {
          const payload = (await res.json().catch(() => ({}))) as { code?: string };
          if ((payload.code || "") === "phone_unverified") {
            pendingToggleRef.current = enabled;
            setVerifySheetOpen(true);
            toast("Verify your number to toggle the agent", "error");
            return;
          }
          throw new Error("agent_forbidden");
        }
        if (!res.ok) {
          const payload = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
          throw new Error(payload.error || payload.message || `agent_${res.status}`);
        }
        await refreshProfile();
        toast(enabled ? "Agent enabled" : "Agent paused", "success");
      } catch (err) {
        toast(err instanceof Error ? err.message : "Failed to update agent", "error");
      } finally {
        setAgentPending(false);
      }
    },
    [profile?.agentEnabled, refreshProfile],
  );

  useEffect(() => {
    if (!profile?.phoneVerifiedAt || !pendingToggleRef.current) return;
    const pending = pendingToggleRef.current;
    pendingToggleRef.current = null;
    if (typeof pending === "boolean") {
      void updateAgent(pending);
    } else {
      void updateRouting(pending as RoutingMode);
    }
  }, [profile?.phoneVerifiedAt, updateAgent, updateRouting]);

  const verifiedLabel = useMemo(() => {
    if (!profile?.phoneVerifiedAt) return "Not verified";
    const date = new Date(profile.phoneVerifiedAt);
    if (!Number.isFinite(date.getTime())) return "Verified";
    return `Verified on ${date.toLocaleDateString()}`;
  }, [profile?.phoneVerifiedAt]);

  const maskedDid = useMemo(() => {
    if (!profile?.did) return "—";
    const digits = profile.did.replace(/\D/g, "");
    if (digits.length < 4) return profile.did;
    return `${profile.did.slice(0, profile.did.length - 4).replace(/\d/g, "•")}${profile.did.slice(-4)}`;
  }, [profile?.did]);

  return (
    <>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6 text-white">
        <header className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-white/50">Phone & Agent</span>
          <h1 className="text-2xl font-semibold">Routing controls</h1>
          <p className="text-sm text-white/60">Connect your number, verify, and choose where calls go.</p>
        </header>

        <MobileCard>
          <MobileCardHeader title="Connect your business number" subtitle="Use E.164 format" />
          <MobileCardContent>
            <div className="space-y-3">
              <label className="flex flex-col gap-2 text-sm">
                <span className="text-white/70">Step 1 — Number</span>
                <input
                  value={connectNumber}
                  onChange={(e) => setConnectNumber(e.target.value)}
                  placeholder="+14155551212"
                  className="h-12 rounded-xl border border-white/15 bg-white/5 px-3 text-white placeholder-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                  inputMode="tel"
                />
              </label>
              <div className="flex gap-2 text-sm">
                {["call", "sms"].map((channel) => {
                  const value = channel as "call" | "sms";
                  const active = connectChannel === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setConnectChannel(value)}
                      className={`inline-flex flex-1 items-center justify-center rounded-full border px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${
                        active ? "border-white/20 bg-white/10 text-white" : "border-white/15 text-white/70"
                      }`}
                      disabled={connectPending}
                    >
                      Send via {value === "call" ? "Call" : "SMS"}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => void handleConnect()}
                disabled={connectPending}
                className="inline-flex h-12 w-full items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 disabled:opacity-40"
              >
                {connectPending ? "Sending…" : "Send code"}
              </button>
            </div>
          </MobileCardContent>
        </MobileCard>

        <MobileCard>
          <MobileCardHeader title="Routing" subtitle="Choose where calls land" />
          <MobileCardContent>
            <div className="flex gap-3">
              {(["agent", "passthrough"] as RoutingMode[]).map((mode) => {
                const active = profile?.routingMode === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => void updateRouting(mode)}
                    disabled={routingPending}
                    className={`inline-flex flex-1 items-center justify-center rounded-full border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${
                      active ? "border-white/20 bg-white/10 text-white" : "border-white/15 text-white/70"
                    }`}
                  >
                    {mode === "agent" ? "AI Agent" : "Passthrough"}
                  </button>
                );
              })}
            </div>
          </MobileCardContent>
        </MobileCard>

        <MobileCard>
          <MobileCardHeader title="Agent" subtitle="Toggle the AI receptionist" />
          <MobileCardFooter>
            <button
              type="button"
              onClick={() => void updateAgent(true)}
              disabled={agentPending}
              className={`inline-flex flex-1 items-center justify-center rounded-full border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${
                profile?.agentEnabled ? "border-white/20 bg-white/10 text-white" : "border-white/15 text-white/70"
              }`}
            >
              On
            </button>
            <button
              type="button"
              onClick={() => void updateAgent(false)}
              disabled={agentPending}
              className={`inline-flex flex-1 items-center justify-center rounded-full border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${
                profile?.agentEnabled === false ? "border-white/20 bg-white/10 text-white" : "border-white/15 text-white/70"
              }`}
            >
              Off
            </button>
          </MobileCardFooter>
        </MobileCard>

        <MobileCard>
          <MobileCardHeader title="Status" subtitle={loading ? "Loading…" : undefined} />
          <MobileCardContent>
            <dl className="space-y-2 text-sm text-white/70">
              <div className="flex items-center justify-between">
                <dt>DID</dt>
                <dd>{maskedDid}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Verification</dt>
                <dd>{verifiedLabel}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Routing</dt>
                <dd>{profile?.routingMode === "agent" ? "AI Agent" : profile?.routingMode === "passthrough" ? "Passthrough" : "—"}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Agent</dt>
                <dd>{typeof profile?.agentEnabled === "boolean" ? (profile.agentEnabled ? "Enabled" : "Paused") : "—"}</dd>
              </div>
            </dl>
          </MobileCardContent>
        </MobileCard>
      </div>

      <MobileSheet open={verifySheetOpen} onClose={() => setVerifySheetOpen(false)} title="Verify number">
        <div className="space-y-4">
          <p className="text-sm text-white/70">
            Enter the 6-digit code we sent via {connectChannel === "call" ? "voice call" : "SMS"}.
          </p>
          <input
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value)}
            maxLength={6}
            inputMode="numeric"
            className="h-14 w-full rounded-2xl border border-white/15 bg-white/5 px-4 text-center text-2xl tracking-widest text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            placeholder="••••••"
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setVerifySheetOpen(false)}
              className="inline-flex h-12 flex-1 items-center justify-center rounded-full border border-white/20 px-6 text-sm font-medium text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              Later
            </button>
            <button
              type="button"
              onClick={() => void handleVerify()}
              disabled={verifyPending}
              className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 disabled:opacity-40"
            >
              {verifyPending ? "Verifying…" : "Verify"}
            </button>
          </div>
        </div>
      </MobileSheet>
    </>
  );
}
