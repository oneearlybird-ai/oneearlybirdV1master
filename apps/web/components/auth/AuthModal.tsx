"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import OfficialGoogleIcon from "@/components/OfficialGoogleIcon";
import { openPopup } from "@/lib/popup";
import { useAuthModal } from "@/components/auth/AuthModalProvider";
import { buildGoogleStartUrl, getMagicVerifyPath } from "@/lib/authPaths";
import { apiFetch } from "@/lib/http";
import { fetchCsrfToken, invalidateCsrfToken } from "@/lib/security";
import { setActiveAuthFlow } from "@/lib/authFlow";

const LOGIN_EVENT_KEY = "__ob_login";
const GOOGLE_POPUP_NAME = "oauth-google";

type MagicLinkStatus = "idle" | "pending" | "sent" | "error";

type PanelMode = "signin" | "signup";

function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];
  const selectors = [
    "a[href]",
    "button:not([disabled])",
    "textarea:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ];
  return Array.from(container.querySelectorAll<HTMLElement>(selectors.join(","))).filter(
    (element) => !element.hasAttribute("inert") && element.tabIndex !== -1,
  );
}

function buildAbsoluteUrl(path: string): string {
  if (typeof window === "undefined") {
    return `https://oneearlybird.ai${path}`;
  }
  const origin = window.location.origin.replace(/\/$/, "");
  return `${origin}${path}`;
}

export default function AuthModal() {
  const { close, mode, setMode } = useAuthModal();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const initialFocusRef = useRef<HTMLInputElement | null>(null);
  const googlePopupMonitorRef = useRef<number | null>(null);
  const [signInEmail, setSignInEmail] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signInStatus, setSignInStatus] = useState<MagicLinkStatus>("idle");
  const [signUpStatus, setSignUpStatus] = useState<MagicLinkStatus>("idle");
  const [signInMessage, setSignInMessage] = useState<string | null>(null);
  const [signUpMessage, setSignUpMessage] = useState<string | null>(null);
  const [googlePending, setGooglePending] = useState(false);
  const isSignIn = mode === "signin";

  const clearGooglePopupMonitor = useCallback(() => {
    if (googlePopupMonitorRef.current !== null) {
      window.clearInterval(googlePopupMonitorRef.current);
      googlePopupMonitorRef.current = null;
    }
  }, []);

  const triggerLoginEvent = useCallback(() => {
    try {
      localStorage.setItem(LOGIN_EVENT_KEY, String(Date.now()));
    } catch (error) {
      console.warn("login_storage_failed", { message: (error as Error)?.message });
    }
  }, []);

  useEffect(() => {
    const handleAuthSuccess = () => {
      clearGooglePopupMonitor();
      setGooglePending(false);
      triggerLoginEvent();
    };
    window.addEventListener("ob:auth:success", handleAuthSuccess);
    return () => {
      window.removeEventListener("ob:auth:success", handleAuthSuccess);
    };
  }, [clearGooglePopupMonitor, triggerLoginEvent]);

  useEffect(() => {
    return () => {
      clearGooglePopupMonitor();
    };
  }, [clearGooglePopupMonitor]);

  useEffect(() => {
    const active = document.activeElement as HTMLElement | null;
    const container = dialogRef.current;
    const focusables = getFocusableElements(container);
    if (focusables.length > 0) {
      (focusables[0] as HTMLElement).focus();
    } else {
      container?.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!container) return;
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key === "Tab") {
        const items = getFocusableElements(container);
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey) {
          if (document.activeElement === first) {
            event.preventDefault();
            last.focus();
          }
        } else if (document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      active?.focus();
    };
  }, [close]);

  useEffect(() => {
    initialFocusRef.current?.focus();
  }, [isSignIn]);

  const setStatusForIntent = useCallback((intent: PanelMode, status: MagicLinkStatus, message?: string | null) => {
    if (intent === "signin") {
      setSignInStatus(status);
      setSignInMessage(message ?? null);
    } else {
      setSignUpStatus(status);
      setSignUpMessage(message ?? null);
    }
  }, []);

  const requestMagicLink = useCallback(
    async (intent: PanelMode) => {
      const email = intent === "signin" ? signInEmail.trim() : signUpEmail.trim();
      if (!email) {
        setStatusForIntent(intent, "error", "Enter your email to continue.");
        return;
      }
      setStatusForIntent(intent, "pending");
      try {
        const token = await fetchCsrfToken();
        const response = await apiFetch("/auth/magic/start", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-csrf-token": token,
          },
          body: JSON.stringify({
            email,
            intent,
            redirect: buildAbsoluteUrl(getMagicVerifyPath(intent)),
          }),
        });
        if (response.ok) {
          setStatusForIntent(intent, "sent", "Check your email for a secure link to continue.");
          triggerLoginEvent();
          return;
        }
        const payload = await response.json().catch(() => ({}));
        const errorMessage = typeof payload?.message === "string" ? payload.message : "We couldn’t send the link. Try again.";
        setStatusForIntent(intent, "error", errorMessage);
      } catch (error) {
        console.error("magic_link_request_failed", { message: (error as Error)?.message });
        setStatusForIntent(intent, "error", "We couldn’t reach the server. Please try again.");
        invalidateCsrfToken();
      }
    },
    [signInEmail, signUpEmail, setStatusForIntent, triggerLoginEvent],
  );

  const startGoogle = useCallback(
    (intent: "signin" | "signup") => {
      if (googlePending) return;
      const url = buildGoogleStartUrl(intent);
      setActiveAuthFlow(intent === "signup" ? "google-signup" : "google-signin");
      setGooglePending(true);
      clearGooglePopupMonitor();
      const popup = openPopup(url, GOOGLE_POPUP_NAME, { w: 540, h: 680, expectedMessageType: "oauth:success" });
      if (!popup) {
        setGooglePending(false);
        window.location.href = url;
        return;
      }
      googlePopupMonitorRef.current = window.setInterval(() => {
        if (!popup || popup.closed) {
          clearGooglePopupMonitor();
          setGooglePending(false);
        }
      }, 500);
    },
    [clearGooglePopupMonitor, googlePending],
  );

  const GoogleBtn = ({ label, intent }: { label: string; intent: "signin" | "signup" }) => (
    <button
      onClick={() => startGoogle(intent)}
      disabled={googlePending}
      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#DADCE0] bg-white font-medium text-[#3C4043] transition-colors duration-150 hover:bg-white/90 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#4285F4] disabled:opacity-60"
      aria-label={label}
      type="button"
    >
      <OfficialGoogleIcon />
      <span>{googlePending ? "Opening…" : label}</span>
      {googlePending ? (
        <span className="ml-1 inline-flex h-4 w-4 animate-spin rounded-full border-[2px] border-[#c1c3c6] border-t-transparent" aria-hidden />
      ) : null}
    </button>
  );

  const handleSubmitMagic = (event: React.FormEvent, intent: PanelMode) => {
    event.preventDefault();
    if (intent === "signin" && signInStatus === "pending") return;
    if (intent === "signup" && signUpStatus === "pending") return;
    void requestMagicLink(intent);
  };

  useEffect(() => {
    setSignInMessage(null);
    setSignInStatus("idle");
  }, [signInEmail]);

  useEffect(() => {
    setSignUpMessage(null);
    setSignUpStatus("idle");
  }, [signUpEmail]);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#05050b]/80 px-4 py-10 backdrop-blur">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg rounded-3xl border border-white/10 bg-neutral-950 px-6 py-8 text-white shadow-[0_45px_72px_rgba(5,5,11,0.45)] focus:outline-none"
      >
        <div className="flex justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-white/50">EarlyBird AI</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Welcome</h1>
            <p className="mt-1 text-sm text-white/70">
              Use a magic link or Google to sign {isSignIn ? "back in" : "up"} without passwords.
            </p>
          </div>
          <button
            type="button"
            onClick={() => close()}
            aria-label="Close"
            className="h-9 w-9 rounded-full border border-white/15 text-white/60 transition hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M7 7l10 10M17 7 7 17" />
            </svg>
          </button>
        </div>

        <div className="mt-6 flex gap-1 rounded-2xl border border-white/15 bg-white/5 p-1" role="tablist" aria-label="Authentication tabs">
          <button
            onClick={() => setMode("signin")}
            className={`w-1/2 rounded-xl px-4 py-2 text-sm font-medium ${isSignIn ? "bg-white text-black" : "text-white/80 hover:bg-white/10"}`}
            aria-selected={isSignIn}
            aria-controls="panel-login"
            id="tab-login"
            role="tab"
          >
            Sign in
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`w-1/2 rounded-xl px-4 py-2 text-sm font-medium ${!isSignIn ? "bg-white text-black" : "text-white/80 hover:bg-white/10"}`}
            aria-selected={!isSignIn}
            aria-controls="panel-signup"
            id="tab-signup"
            role="tab"
          >
            Create account
          </button>
        </div>

        <div id="panel-login" role="tabpanel" aria-labelledby="tab-login" hidden={!isSignIn} className="mt-8">
          {isSignIn ? (
            <>
              <h2 className="text-2xl font-semibold tracking-tight">Email a magic link</h2>
              <p className="mt-2 text-sm text-white/70">We’ll send a secure link to your inbox. No password required.</p>
              <form onSubmit={(event) => handleSubmitMagic(event, "signin")} className="mt-6 space-y-4" aria-label="Email sign in">
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@business.com"
                  value={signInEmail}
                  onChange={(event) => setSignInEmail(event.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-3 text-white outline-none placeholder-white/40"
                  autoComplete="email"
                  aria-label="Email"
                  ref={initialFocusRef}
                />
                <button
                  type="submit"
                  disabled={signInStatus === "pending"}
                  className="w-full rounded-xl bg-white px-4 py-3 font-medium text-black hover:bg-white/90 disabled:opacity-60"
                  aria-busy={signInStatus === "pending"}
                >
                  {signInStatus === "pending" ? "Sending…" : "Email me a magic link"}
                </button>
                {signInMessage ? (
                  <p className={`text-sm ${signInStatus === "error" ? "text-rose-300" : "text-white/70"}`}>{signInMessage}</p>
                ) : null}
              </form>
              <div className="mt-6">
                <GoogleBtn label="Continue with Google" intent="signin" />
              </div>
              <div className="mt-4 text-xs text-white/60">
                Need help? <Link href="/support" className="underline">Contact support</Link>
              </div>
            </>
          ) : null}
        </div>

        <div id="panel-signup" role="tabpanel" aria-labelledby="tab-signup" hidden={isSignIn} className="mt-8">
          {!isSignIn ? (
            <>
              <h2 className="text-2xl font-semibold tracking-tight">Start your account</h2>
              <p className="mt-2 text-sm text-white/70">Enter your email and we’ll send a magic link to verify ownership.</p>
              <form onSubmit={(event) => handleSubmitMagic(event, "signup")} className="mt-6 space-y-4" aria-label="Email sign up">
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@business.com"
                  value={signUpEmail}
                  onChange={(event) => setSignUpEmail(event.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-3 text-white outline-none placeholder-white/40"
                  autoComplete="email"
                  aria-label="Email"
                />
                <button
                  type="submit"
                  disabled={signUpStatus === "pending"}
                  className="w-full rounded-xl bg-white px-4 py-3 font-medium text-black hover:bg-white/90 disabled:opacity-60"
                  aria-busy={signUpStatus === "pending"}
                >
                  {signUpStatus === "pending" ? "Sending…" : "Send verification link"}
                </button>
                {signUpMessage ? (
                  <p className={`text-sm ${signUpStatus === "error" ? "text-rose-300" : "text-white/70"}`}>{signUpMessage}</p>
                ) : null}
              </form>
              <div className="mt-6">
                <GoogleBtn label="Create with Google" intent="signup" />
              </div>
              <p className="mt-4 text-xs text-white/60">
                After verification we’ll guide you through a short setup to personalize EarlyBird AI.
              </p>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
