"use client";

import { useEffect } from "react";
import { consumeActiveAuthFlow } from "@/lib/authFlow";
import { resolvePopupMessage } from "@/lib/popup";
import { useOAuthFinalizer } from "@/hooks/useOAuthFinalizer";

export default function GoogleOauthDonePage() {
  const finalizeOAuth = useOAuthFinalizer();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const needsParam = params.get("needsAccountCreate");
    const needsAccountCreate = needsParam === "1" || needsParam === "true";
    const redirectPath = params.get("redirect") ?? undefined;
    consumeActiveAuthFlow();
    resolvePopupMessage("oauthResult");
    void finalizeOAuth({
      needsAccountCreate,
      redirectPath,
    });
  }, [finalizeOAuth]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#05050b] px-6 text-center text-white">
      <div className="max-w-sm rounded-2xl border border-white/10 bg-white/5 px-6 py-8 shadow-2xl">
        <h1 className="text-lg font-semibold text-white">Finishing sign-in…</h1>
        <p className="mt-3 text-sm text-white/70">Please wait while we update your session.</p>
      </div>
    </main>
  );
}
