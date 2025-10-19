"use client";

import { useEffect } from "react";
import { getAccountCreatePath, getDashboardPath } from "@/lib/authPaths";
import { redirectTo } from "@/lib/clientNavigation";
import { clearActiveAuthFlow } from "@/lib/authFlow";

const PROD_ALLOWED_ORIGINS = new Set([
  "https://oneearlybird.ai",
  "https://m.oneearlybird.ai",
  "https://www.oneearlybird.ai",
]);

export type GoogleCallbackIntent = "signin" | "signup";

export function GoogleOauthCallbackView({ intent }: { intent: GoogleCallbackIntent }) {
  useEffect(() => {
    const opener = window.opener;
    const origin = window.location.origin;
    const referrerOrigin = (() => {
      try {
        if (document.referrer) {
          const url = new URL(document.referrer);
          return url.origin;
        }
      } catch (error) {
        console.warn("oauth_callback_referrer_parse_failed", { message: (error as Error)?.message });
      }
      return null;
    })();
    const baseOrigins = new Set<string>([origin, ...Array.from(PROD_ALLOWED_ORIGINS)]);
    if (referrerOrigin) {
      baseOrigins.add(referrerOrigin);
    }
    const targets = Array.from(baseOrigins);
    const payload = { type: "oauth:success", provider: "google", intent } as const;
    try {
      if (opener) {
        targets.forEach((target) => {
          try {
            opener.postMessage(payload, target);
            opener.postMessage("oauth:success", target);
          } catch (innerError) {
            console.warn("oauth_callback_postmessage_target_failed", {
              target,
              message: (innerError as Error)?.message,
            });
          }
        });
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
