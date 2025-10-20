"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const PROD_ORIGINS = new Set(["https://oneearlybird.ai", "https://m.oneearlybird.ai", "https://www.oneearlybird.ai"]);

function resolveAllowedTargets(): string[] {
  if (typeof window === "undefined") return Array.from(PROD_ORIGINS);
  const currentOrigin = window.location.origin;
  const targets = new Set<string>([currentOrigin, ...Array.from(PROD_ORIGINS)]);
  try {
    if (document.referrer) {
      const refOrigin = new URL(document.referrer).origin;
      targets.add(refOrigin);
    }
  } catch (error) {
    console.warn("auth_success_referrer_parse_failed", { message: (error as Error)?.message });
  }
  return Array.from(targets);
}

export default function AuthSuccessView() {
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    const opener = window.opener;
    const targets = resolveAllowedTargets();
    const payload = { type: "auth-success" } as const;
    try {
      if (opener) {
        targets.forEach((target) => {
          try {
            opener.postMessage(payload, target);
            opener.postMessage("auth-success", target);
            opener.postMessage("oauth:success", target);
          } catch (innerError) {
            console.warn("auth_success_postmessage_target_failed", {
              target,
              message: (innerError as Error)?.message,
            });
          }
        });
      }
    } catch (error) {
      console.warn("auth_success_postmessage_failed", { message: (error as Error)?.message });
    }

    const timers: number[] = [];

    if (opener) {
      try {
        window.close();
      } catch (error) {
        console.warn("auth_success_close_failed", { message: (error as Error)?.message });
      }
      timers.push(
        window.setTimeout(() => {
          if (!window.closed) {
            setShowFallback(true);
          }
        }, 600),
      );
    } else {
      setShowFallback(true);
    }

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#05050b] px-6 text-center text-white">
      <div className="max-w-sm rounded-2xl border border-white/10 bg-white/5 px-6 py-8 shadow-2xl">
        <h1 className="text-lg font-semibold text-white">Authentication complete</h1>
        <p className="mt-3 text-sm text-white/70">
          You can return to EarlyBird AI. If this window did not close automatically, use the button below.
        </p>
        <button
          type="button"
          className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90"
          onClick={() => {
            try {
              window.opener?.focus();
            } catch {
              /* ignore */
            }
            try {
              window.close();
            } catch (error) {
              console.warn("auth_success_manual_close_failed", { message: (error as Error)?.message });
              setShowFallback(true);
            }
          }}
        >
          Close window
        </button>
        {showFallback ? (
          <div className="mt-4 text-xs text-white/50">
            If this tab stays open, <Link href="/" className="text-purple-200 hover:text-purple-100">return to EarlyBird AI</Link> and refresh your
            browser.
          </div>
        ) : null}
      </div>
    </main>
  );
}
