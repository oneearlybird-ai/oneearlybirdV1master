"use client";

import { useEffect } from "react";
import { getAccountCreatePath, getDashboardPath } from "@/lib/authPaths";
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
    const fallback = intent === "signup" ? getAccountCreatePath() : getDashboardPath();
    redirectTo(fallback);
  }, [intent]);

  return null;
}
