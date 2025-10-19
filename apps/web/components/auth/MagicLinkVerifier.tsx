"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { verifyOtp } from "@/lib/security";
import { useAuthSession } from "@/components/auth/AuthSessionProvider";
import { getAccountCreatePath, getDashboardPath } from "@/lib/authPaths";
import { redirectTo } from "@/lib/clientNavigation";

type Status = "verifying" | "error" | "success";

export function MagicLinkVerifierView() {
  const searchParams = useSearchParams();
  const { refresh } = useAuthSession();
  const [status, setStatus] = useState<Status>("verifying");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const intent = useMemo(() => {
    const raw = searchParams?.get("intent");
    return raw === "signup" ? "signup" : "signin";
  }, [searchParams]);

  useEffect(() => {
    const token = searchParams?.get("token");
    if (!token) {
      setStatus("error");
      setErrorMessage("This verification link is missing required data. Request a new one to continue.");
      return;
    }
    let cancelled = false;
    const run = async () => {
      try {
        await verifyOtp({ channel: "email", token });
        if (cancelled) return;
        await refresh({ showLoading: true, retryOnUnauthorized: true });
        if (cancelled) return;
        setStatus("success");
      } catch (error) {
        console.error("magic_link_verify_failed", { message: (error as Error)?.message });
        if (cancelled) return;
        setErrorMessage("This link is invalid or expired. Request a new magic link to try again.");
        setStatus("error");
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [refresh, searchParams]);

  useEffect(() => {
    if (status !== "success") return;
    const target = intent === "signup" ? getAccountCreatePath() : getDashboardPath();
    redirectTo(target);
  }, [intent, status]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-white">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 px-6 py-8 text-center shadow-2xl">
        {status === "verifying" ? (
          <>
            <h1 className="text-lg font-semibold">Verifying your link…</h1>
            <p className="mt-2 text-sm text-white/70">Hang tight while we confirm your email.</p>
          </>
        ) : null}
        {status === "error" ? (
          <>
            <h1 className="text-lg font-semibold text-rose-200">Verification failed</h1>
            <p className="mt-2 text-sm text-white/70">{errorMessage}</p>
            <p className="mt-4 text-xs text-white/50">
              Need help? <a href="/support" className="underline">Contact support</a>
            </p>
          </>
        ) : null}
        {status === "success" ? (
          <>
            <h1 className="text-lg font-semibold">Success!</h1>
            <p className="mt-2 text-sm text-white/70">Redirecting you to the next step…</p>
          </>
        ) : null}
      </div>
    </main>
  );
}
