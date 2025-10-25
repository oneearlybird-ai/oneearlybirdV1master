"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Logo from "@/components/ui/logo";
import OfficialGoogleIcon from "@/components/OfficialGoogleIcon";
import { API_BASE } from "@/lib/config";
import { redirectTo } from "@/lib/clientNavigation";
import { openPopup, resolvePopupMessage } from "@/lib/popup";
import { useAuthModal } from "@/components/auth/AuthModalProvider";
import { apiFetch } from "@/lib/http";
import { buildGoogleStartUrl, getDashboardPath, getMagicVerifyPath } from "@/lib/authPaths";
import { fetchCsrfToken, invalidateCsrfToken } from "@/lib/security";
import { consumeActiveAuthFlow, setActiveAuthFlow } from "@/lib/authFlow";
import { useOAuthFinalizer } from "@/hooks/useOAuthFinalizer";

const LOGIN_EVENT_KEY = "__ob_login";
const GOOGLE_POPUP_NAME = "oauth-google";

type MagicStatus = "idle" | "pending" | "sent" | "error";

type Focusable = HTMLElement & { disabled?: boolean };

function apiUrl(path: string) {
  const base = (API_BASE || "").replace(/\/+/g, "/").replace(/\/$/, "");
  if (base) return `${base}${path}`;
  return `/api/upstream${path}`;
}

function getFocusableElements(container: HTMLElement | null): Focusable[] {
  if (!container) return [];
  const selectors = [
    "a[href]",
    "button:not([disabled])",
    "textarea:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ];
  return Array.from(container.querySelectorAll<Focusable>(selectors.join(","))).filter(
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
  const popupRef = useRef<Window | null>(null);

  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInError, setSignInError] = useState<string | null>(null);
  const [signInPending, setSignInPending] = useState(false);

  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpStatus, setSignUpStatus] = useState<MagicStatus>("idle");
  const [signUpMessage, setSignUpMessage] = useState<string | null>(null);

  const [googlePending, setGooglePending] = useState(false);

  const isSignIn = mode === "signin";
  const finalizeOAuth = useOAuthFinalizer();

  const warmDashboardData = useCallback(async () => {
    try {
      await Promise.all([
        apiFetch("/api/dashboard/profile", { cache: "no-store", suppressAuthRedirect: true }),
        apiFetch("/api/dashboard/usage?window=week", { cache: "no-store", suppressAuthRedirect: true }),
      ]);
    } catch (error) {
      console.warn("auth_refresh_failed", { message: (error as Error)?.message });
    }
  }, []);

  const triggerLoginEvent = useCallback(() => {
    try {
      localStorage.setItem(LOGIN_EVENT_KEY, String(Date.now()));
    } catch (error) {
      console.warn("login_storage_failed", { message: (error as Error)?.message });
    }
  }, []);

const clearGooglePopupMonitor = useCallback(() => {
  if (googlePopupMonitorRef.current !== null) {
    window.clearInterval(googlePopupMonitorRef.current);
    googlePopupMonitorRef.current = null;
  }
}, []);

  useEffect(() => {
    const allowedOrigins = new Set<string>([
      "https://oneearlybird.ai",
      "https://m.oneearlybird.ai",
      "https://www.oneearlybird.ai",
      "https://api.oneearlybird.ai",
    ]);
    if (typeof window !== "undefined") {
      allowedOrigins.add(window.location.origin);
      try {
        if (document.referrer) {
          const refOrigin = new URL(document.referrer).origin;
          allowedOrigins.add(refOrigin);
        }
      } catch {
        /* ignore */
      }
    }

    const handleMessage = (event: MessageEvent) => {
      if (!allowedOrigins.has(event.origin)) return;
      const payload = typeof event.data === "object" ? (event.data as Record<string, unknown>) : {};
      const type =
        typeof payload?.type === "string"
          ? payload.type
          : typeof event.data === "string"
            ? event.data
            : undefined;
      if (type !== "oauthResult") return;
      resolvePopupMessage("oauthResult");
      consumeActiveAuthFlow();
      popupRef.current = null;
      clearGooglePopupMonitor();
      setGooglePending(false);
      triggerLoginEvent();
      const needsAccountCreate =
        typeof payload?.needsAccountCreate === "boolean"
          ? (payload.needsAccountCreate as boolean)
          : payload?.needsAccountCreate === "1";
      const redirectPath =
        typeof payload?.redirectPath === "string" ? (payload.redirectPath as string) : undefined;
      void finalizeOAuth({
        needsAccountCreate,
        redirectPath,
      });
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [clearGooglePopupMonitor, finalizeOAuth, triggerLoginEvent]);

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
      focusables[0].focus();
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

  useEffect(() => {
    setSignInError(null);
  }, [signInEmail, signInPassword]);

  useEffect(() => {
    if (signUpStatus !== "pending") {
      setSignUpStatus("idle");
      setSignUpMessage(null);
    }
  }, [signUpEmail]);

  const attemptSignIn = useCallback(async () => {
    const email = signInEmail.trim().toLowerCase();
    if (!email || !signInPassword) {
      setSignInError("Enter your email and password to continue.");
      return;
    }
    setSignInPending(true);
    setSignInError(null);
    try {
      const response = await fetch(apiUrl("/auth/login"), {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password: signInPassword }),
      });
      if (!response.ok) {
        setSignInError(response.status === 400 || response.status === 401 ? "Invalid email or password." : "Service unavailable. Try again.");
        return;
      }
      triggerLoginEvent();
      void warmDashboardData();
      close();
      redirectTo(getDashboardPath());
    } catch (error) {
      console.error("signin_request_failed", { message: (error as Error)?.message });
      setSignInError("We couldn’t reach the server. Please try again.");
    } finally {
      setSignInPending(false);
    }
  }, [close, signInEmail, signInPassword, triggerLoginEvent, warmDashboardData]);

  const handleSignInSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (signInPending) return;
      void attemptSignIn();
    },
    [attemptSignIn, signInPending],
  );

  const sendSignupLink = useCallback(async () => {
    const email = signUpEmail.trim().toLowerCase();
    if (!email) {
      setSignUpStatus("error");
      setSignUpMessage("Enter your email to continue.");
      return;
    }
    setSignUpStatus("pending");
    setSignUpMessage(null);
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
          intent: "signup",
          redirect: buildAbsoluteUrl(getMagicVerifyPath("signup")),
        }),
      });
      if (response.ok) {
        setActiveAuthFlow("email-signup", { email });
        setSignUpStatus("sent");
        setSignUpMessage("Check your email for a secure link to finish setup.");
        triggerLoginEvent();
        return;
      }
      const payload = await response.json().catch(() => ({}));
      const message =
        typeof payload?.message === "string" && payload.message.length > 0
          ? payload.message
          : "We couldn’t send the link. Please try again.";
      setSignUpStatus("error");
      setSignUpMessage(message);
    } catch (error) {
      console.error("signup_magic_link_failed", { message: (error as Error)?.message });
      setSignUpStatus("error");
      setSignUpMessage("We couldn’t reach the server. Please try again.");
      invalidateCsrfToken();
    }
  }, [signUpEmail, triggerLoginEvent]);

  const handleSignUpSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (signUpStatus === "pending") return;
      void sendSignupLink();
    },
    [sendSignupLink, signUpStatus],
  );

  const startGoogle = useCallback(
    (intent: "signin" | "signup") => {
      if (googlePending) return;
      const url = buildGoogleStartUrl(intent);
      setActiveAuthFlow(intent === "signup" ? "google-signup" : "google-signin");
      setGooglePending(true);
      clearGooglePopupMonitor();
      const popup = openPopup(url, GOOGLE_POPUP_NAME, { w: 540, h: 680, expectedMessageType: "oauthResult" });
      if (!popup) {
        setGooglePending(false);
        window.location.href = url;
        return;
      }
      popupRef.current = popup;
      googlePopupMonitorRef.current = window.setInterval(() => {
        if (!popup || popup.closed) {
          clearGooglePopupMonitor();
          setGooglePending(false);
          popupRef.current = null;
        }
      }, 500);
    },
    [clearGooglePopupMonitor, googlePending],
  );

  const GoogleBtn = ({ intent }: { intent: "signin" | "signup" }) => (
    <button
      type="button"
      onClick={() => startGoogle(intent)}
      disabled={googlePending}
      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#dadce0] bg-white text-sm font-medium text-[#3c4043] transition hover:bg-white/90 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#4285f4] disabled:opacity-60"
    >
      <OfficialGoogleIcon width={18} height={18} />
      <span>{googlePending ? "Opening…" : intent === "signin" ? "Continue with Google" : "Create account with Google"}</span>
      {googlePending ? (
        <span className="ml-1 inline-flex h-4 w-4 animate-spin rounded-full border-[2px] border-[#c1c3c6] border-t-transparent" aria-hidden />
      ) : null}
    </button>
  );

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/65 px-4 backdrop-blur-sm"
      role="presentation"
      onClick={close}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className={`relative border border-white/10 bg-neutral-950/95 shadow-2xl outline-none backdrop-blur-xl ${
          typeof document !== "undefined" && document.body.classList.contains("ob-mobile-shell")
            ? "flex h-full w-full max-w-none flex-col rounded-none p-6 pb-[calc(env(safe-area-inset-bottom)+2rem)]"
            : "w-full max-w-[420px] rounded-3xl p-6"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          className="absolute right-4 top-4 rounded-full border border-white/15 bg-white/10 p-1.5 text-white/70 transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          aria-label="Close authentication modal"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <div className="mb-5 flex justify-center">
          <Logo />
        </div>
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            role="tab"
            aria-selected={isSignIn}
            className={`w-1/2 rounded-xl px-4 py-2 text-sm font-medium transition ${isSignIn ? "bg-white text-black shadow" : "text-white/80 hover:bg-white/10"}`}
            onClick={() => setMode("signin")}
          >
            Sign in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={!isSignIn}
            className={`w-1/2 rounded-xl px-4 py-2 text-sm font-medium transition ${!isSignIn ? "bg-white text-black shadow" : "text-white/80 hover:bg-white/10"}`}
            onClick={() => setMode("signup")}
          >
            Create account
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <GoogleBtn intent={isSignIn ? "signin" : "signup"} />

          <div className="flex items-center gap-3 text-xs text-white/50">
            <span className="h-px flex-1 bg-white/15" />
            or
            <span className="h-px flex-1 bg-white/15" />
          </div>

          {isSignIn ? (
            <form onSubmit={handleSignInSubmit} className="space-y-3" aria-label="Sign in with email and password">
              <label className="block text-xs font-medium uppercase tracking-wide text-white/60">
                Email
                <input
                  ref={initialFocusRef}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  name="email"
                  required
                  value={signInEmail}
                  onChange={(event) => setSignInEmail(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-white/40 focus:bg-white/10"
                />
              </label>
              <label className="block text-xs font-medium uppercase tracking-wide text-white/60">
                Password
                <input
                  type="password"
                  autoComplete="current-password"
                  name="password"
                  required
                  value={signInPassword}
                  onChange={(event) => setSignInPassword(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-white/40 focus:bg-white/10"
                />
              </label>
              <button
                type="submit"
                disabled={signInPending}
                className="mt-2 w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-60"
              >
                {signInPending ? "Signing in…" : "Sign in"}
              </button>
              {signInError ? <p className="text-sm text-rose-300">{signInError}</p> : null}
              <p className="text-xs text-white/50">
                Forgot your password?{" "}
                <Link href="/support" className="underline hover:text-white">
                  Contact support
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignUpSubmit} className="space-y-3" aria-label="Create account with email">
              <label className="block text-xs font-medium uppercase tracking-wide text-white/60">
                Work email
                <input
                  ref={initialFocusRef}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  name="email"
                  required
                  value={signUpEmail}
                  onChange={(event) => setSignUpEmail(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-white/40 focus:bg-white/10"
                />
              </label>
              <button
                type="submit"
                disabled={signUpStatus === "pending"}
                className="mt-2 w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-60"
              >
                {signUpStatus === "pending" ? "Sending…" : "Email me a magic link"}
              </button>
              {signUpMessage ? (
                <p className={`text-sm ${signUpStatus === "error" ? "text-rose-300" : "text-emerald-300"}`}>{signUpMessage}</p>
              ) : (
                <p className="text-xs text-white/50">We’ll send a secure link to verify your email before you finish setup.</p>
              )}
            </form>
          )}

          <p className="text-center text-xs text-white/50">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-white">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-white">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
