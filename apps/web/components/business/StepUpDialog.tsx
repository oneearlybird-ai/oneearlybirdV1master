"use client";

import { useEffect, useState } from "react";
import { startOtp, verifyOtp } from "@/lib/security";
import { toast } from "@/components/Toasts";

type StepUpDialogProps = {
  open: boolean;
  onClose: () => void;
  onVerified: (stepUpOkUntil?: string | null) => void;
  channel?: "sms" | "call" | "email";
  disableEmail?: boolean;
};

export default function StepUpDialog({ open, onClose, onVerified, channel = "sms", disableEmail = true }: StepUpDialogProps) {
  const [state, setState] = useState<"idle" | "pending" | "challenge" | "verifying">("idle");
  const [error, setError] = useState<string | null>(null);
  const [channelState, setChannelState] = useState<"sms" | "call" | "email">(channel);
  const [code, setCode] = useState("");

  useEffect(() => {
    if (!open) {
      setState("idle");
      setError(null);
      setCode("");
      setChannelState(channel);
    }
  }, [channel, open]);

  if (!open) return null;

  const begin = async () => {
    try {
      setError(null);
      setState("pending");
      await startOtp(channelState);
      setState("challenge");
      toast(`Verification code sent via ${channelState}`, "success");
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === "rate_limited") {
        setError("Too many attempts. Please wait and try again.");
      } else if (code === "invalid_channel") {
        setError("That verification channel is not available.");
      } else {
        setError("We could not send the verification code. Try again.");
      }
      setState("idle");
    }
  };

  const submit = async () => {
    if (!code.trim()) {
      setError("Enter the verification code to continue.");
      return;
    }
    setState("verifying");
    setError(null);
    try {
      const payload = channelState === "email" ? { token: code.trim(), channel: channelState } : { code: code.trim(), channel: channelState };
      const result = await verifyOtp(payload);
      toast("Verification complete", "success");
      onVerified(result.stepUpOkUntil ?? null);
      onClose();
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === "verify_failed") {
        setError("The code is incorrect or expired.");
      } else {
        setError("We could not verify the code. Try again.");
      }
      setState("challenge");
    }
  };

  return (
    <div className="fixed inset-0 z-[1010] flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-neutral-950/95 p-6 text-white shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Verify to continue</h2>
            <p className="mt-1 text-sm text-white/60">
              We need to confirm it’s you before saving these changes.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white/70 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            onClick={onClose}
            aria-label="Close verification dialog"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" stroke="currentColor" strokeWidth={1.5} fill="none">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="mt-4 space-y-4 text-sm">
          <div className="flex items-center gap-2">
            <label className="text-white/70">Delivery method</label>
            <div className="inline-flex rounded-full border border-white/15 bg-white/5 p-1 text-xs text-white/70">
              <button
                type="button"
                className={`rounded-full px-3 py-1 ${channelState === "sms" ? "bg-white text-black" : "hover:text-white"}`}
                onClick={() => setChannelState("sms")}
                disabled={state === "pending" || state === "verifying"}
              >
                SMS
              </button>
              <button
                type="button"
                className={`rounded-full px-3 py-1 ${channelState === "call" ? "bg-white text-black" : "hover:text-white"}`}
                onClick={() => setChannelState("call")}
                disabled={state === "pending" || state === "verifying"}
              >
                Call
              </button>
              <button
                type="button"
                className={`rounded-full px-3 py-1 ${channelState === "email" ? "bg-white text-black" : disableEmail ? "opacity-40 cursor-not-allowed" : "hover:text-white"}`}
                onClick={() => !disableEmail && setChannelState("email")}
                disabled={disableEmail || state === "pending" || state === "verifying"}
              >
                Email
              </button>
            </div>
          </div>

          {state === "challenge" || state === "verifying" ? (
            <div className="space-y-2">
              <label className="block text-xs font-medium uppercase tracking-wide text-white/60">
                Verification code
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-white/40 focus:bg-white/10"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  disabled={state === "verifying"}
                />
              </label>
              <button
                type="button"
                onClick={submit}
                disabled={state === "verifying"}
                className="inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-60"
              >
                {state === "verifying" ? "Verifying…" : "Verify code"}
              </button>
              <button
                type="button"
                onClick={begin}
                disabled={state === "verifying"}
                className="w-full rounded-xl border border-white/20 px-4 py-3 text-sm text-white/80 hover:text-white"
              >
                Send a new code
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={begin}
              disabled={state === "pending"}
              className="inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-60"
            >
              {state === "pending" ? "Sending…" : "Send verification code"}
            </button>
          )}

          {error ? <div className="rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</div> : null}
          <p className="text-xs text-white/50">
            Verification keeps sensitive changes secure. Codes expire shortly after delivery.
          </p>
        </div>
      </div>
    </div>
  );
}
