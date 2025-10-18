"use client";

import { useEffect } from "react";
import { getDashboardPath, getProfileCapturePath } from "@/lib/authPaths";
import { redirectTo } from "@/lib/clientNavigation";
import { clearActiveAuthFlow } from "@/lib/authFlow";

const PROD_ALLOWED_ORIGINS = new Set([
  "https://oneearlybird.ai",
  "https://m.oneearlybird.ai",
]);

export type GoogleCallbackIntent = "signin" | "signup";

export function GoogleOauthCallbackView({ intent }: { intent: GoogleCallbackIntent }) {
  useEffect(() => {
    const opener = window.opener;
    const origin = window.location.origin;
    const allowedOrigins = new Set<string>([origin, ...Array.from(PROD_ALLOWED_ORIGINS)]);
    const targetOrigin = allowedOrigins.has(origin) ? origin : "https://oneearlybird.ai";
    try {
      if (opener) {
        opener.postMessage({ type: "oauth:success", provider: "google", intent }, targetOrigin);
        opener.postMessage("oauth:success", targetOrigin);
      }
    } catch (error) {
      console.warn("oauth_callback_postmessage_failed", { message: (error as Error)?.message });
    }
    clearActiveAuthFlow();
    if (opener) {
      try {
        window.close();
      } catch (error) {
        console.warn("oauth_callback_close_failed", { message: (error as Error)?.message });
      }
      return;
    }
    const fallback = intent === "signup" ? getProfileCapturePath() : getDashboardPath();
    redirectTo(fallback);
  }, [intent]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-white">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 px-6 py-8 text-center shadow-2xl">
        <h1 className="text-lg font-semibold">Completing sign in…</h1>
        <p className="mt-2 text-sm text-white/70">You can close this window if it doesn’t close automatically.</p>
      </div>
    </main>
  );
}
