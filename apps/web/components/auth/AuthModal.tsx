"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import OfficialGoogleIcon from "@/components/OfficialGoogleIcon";
import { API_BASE } from "@/lib/config";
import { redirectTo } from "@/lib/clientNavigation";
import { openPopup } from "@/lib/popup";
import { useAuthModal } from "@/components/auth/AuthModalProvider";
import { apiFetch } from "@/lib/http";
import { buildGoogleStartUrl, getDashboardPath } from "@/lib/authPaths";

const LOGIN_EVENT_KEY = "__ob_login";
const GOOGLE_POPUP_NAME = "oauth-google";

function apiUrl(path: string) {
  const base = (API_BASE || "").replace(/\/+$/, "");
  if (base) return `${base}${path}`;
  return `/api/upstream${path}`;
}

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

export default function AuthModal() {
  const { close, mode, setMode } = useAuthModal();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const initialFocusRef = useRef<HTMLInputElement | null>(null);
  const googlePopupMonitorRef = useRef<number | null>(null);
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInError, setSignInError] = useState<string | null>(null);
  const [signInPending, setSignInPending] = useState(false);

  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirm, setSignUpConfirm] = useState("");
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [signUpPending, setSignUpPending] = useState(false);

  const [googlePending, setGooglePending] = useState(false);

  const [mobileShell, setMobileShell] = useState(false);

  const isSignIn = mode === "signin";

  useEffect(() => {
    if (typeof document === "undefined") return;
    setMobileShell(document.body.classList.contains("ob-mobile-shell"));
  }, []);

  const warmDashboardData = useCallback(async () => {
    try {
      await Promise.all([
        apiFetch("/tenants/profile", { cache: "no-store" }),
        apiFetch("/usage/summary?window=week", { cache: "no-store" }),
      ]);
    } catch (error) {
      console.warn("auth_refresh_failed", {
        message: (error as Error)?.message,
      });
    }
  }, []);

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
    const handleAuthSuccess = () => {
      clearGooglePopupMonitor();
      setGooglePending(false);
      void warmDashboardData();
      triggerLoginEvent();
      close();
      redirectTo(getDashboardPath());
    };
    window.addEventListener("ob:auth:success", handleAuthSuccess);
    return () => {
      window.removeEventListener("ob:auth:success", handleAuthSuccess);
    };
  }, [clearGooglePopupMonitor, close, triggerLoginEvent, warmDashboardData]);

  useEffect(() => {
    return () => {
      clearGooglePopupMonitor();
    };
  }, [clearGooglePopupMonitor]);

  useEffect(() => {
    setSignInError(null);
  }, [signInEmail]);

  useEffect(() => {
    setSignUpError(null);
  }, [signUpEmail, signUpPassword, signUpConfirm]);

  const attemptSignIn = useCallback(async () => {
    setSignInError(null);
    setSignInPending(true);
    try {
      const response = await fetch(apiUrl("/auth/login"), {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ email: signInEmail, password: signInPassword }),
      });
      if (!response.ok) {
        setSignInError(response.status === 400 || response.status === 401 ? "Invalid email or password" : "Service unavailable");
        return;
      }
      triggerLoginEvent();
      void warmDashboardData();
      close();
      redirectTo(getDashboardPath());
    } catch (error) {
      console.error("signin_request_failed", { message: (error as Error)?.message });
      setSignInError("We could not reach the server. Please try again.");
    } finally {
      setSignInPending(false);
    }
  }, [close, signInEmail, signInPassword, triggerLoginEvent, warmDashboardData]);

  const attemptSignUp = useCallback(
    async () => {
      setSignUpError(null);
      if (!signUpEmail || !signUpPassword) {
        setSignUpError("Please complete all fields.");
        return;
      }
      if (signUpPassword !== signUpConfirm) {
        setSignUpError("Passwords must match.");
        return;
      }
      setSignUpPending(true);
      try {
        const createResponse = await fetch(apiUrl("/auth/signup"), {
          method: "POST",
          credentials: "include",
          cache: "no-store",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ email: signUpEmail, password: signUpPassword }),
        });
        if (!(createResponse.status === 200 || createResponse.status === 201 || createResponse.status === 409)) {
          setSignUpError("We could not create your account. Try again.");
          return;
        }
        const loginResponse = await fetch(apiUrl("/auth/login"), {
          method: "POST",
          credentials: "include",
          cache: "no-store",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ email: signUpEmail, password: signUpPassword }),
        });
        if (!loginResponse.ok) {
          setSignUpError("Account created, but sign-in failed. Please sign in manually.");
          return;
        }
        triggerLoginEvent();
        void warmDashboardData();
        close();
        redirectTo(getDashboardPath());
      } catch (error) {
        console.error("signup_request_failed", { message: (error as Error)?.message });
        setSignUpError("We could not reach the server. Please try again.");
      } finally {
        setSignUpPending(false);
      }
    },
    [close, signUpConfirm, signUpEmail, signUpPassword, triggerLoginEvent, warmDashboardData],
  );

  const onSignInSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (signInPending) return;
      void attemptSignIn();
    },
    [attemptSignIn, signInPending],
  );

  const onSignUpSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (signUpPending) return;
      void attemptSignUp();
    },
    [attemptSignUp, signUpPending],
  );

  const startGoogleAuth = useCallback(() => {
    if (googlePending) return;
    const url = buildGoogleStartUrl();
    setGooglePending(true);
    clearGooglePopupMonitor();
    const popup = openPopup(url, GOOGLE_POPUP_NAME, { w: 540, h: 680 });
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
  }, [clearGooglePopupMonitor, googlePending]);

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
          mobileShell
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
          <button
            type="button"
            onClick={startGoogleAuth}
            disabled={googlePending}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#dadce0] bg-white text-sm font-medium text-[#3c4043] transition hover:bg-white/90 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#4285f4] disabled:opacity-60"
          >
            <OfficialGoogleIcon width={18} height={18} />
            <span>{googlePending ? "Opening…" : "Continue with Google"}</span>
            {googlePending ? (
              <span className="ml-1 inline-flex h-4 w-4 animate-spin rounded-full border-[2px] border-[#c1c3c6] border-t-transparent" aria-hidden />
            ) : null}
          </button>

          <div className="flex items-center gap-3 text-xs text-white/50">
            <span className="h-px flex-1 bg-white/15" />
            or
            <span className="h-px flex-1 bg-white/15" />
          </div>

          {isSignIn ? (
            <form onSubmit={onSignInSubmit} className="space-y-3" aria-label="Sign in with email">
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
              {signInError ? <p className="text-sm text-red-300">{signInError}</p> : null}
              <p className="text-xs text-white/50">
                Forgot your password?{" "}
                <Link href="/support" className="underline hover:text-white">
                  Contact support
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={onSignUpSubmit} className="space-y-3" aria-label="Create account with email">
              <label className="block text-xs font-medium uppercase tracking-wide text-white/60">
                Email
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
              <label className="block text-xs font-medium uppercase tracking-wide text-white/60">
                Password
                <input
                  type="password"
                  autoComplete="new-password"
                  name="password"
                  required
                  value={signUpPassword}
                  onChange={(event) => setSignUpPassword(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-white/40 focus:bg-white/10"
                />
              </label>
              <label className="block text-xs font-medium uppercase tracking-wide text-white/60">
                Confirm password
                <input
                  type="password"
                  autoComplete="new-password"
                  name="confirm"
                  required
                  value={signUpConfirm}
                  onChange={(event) => setSignUpConfirm(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-white/40 focus:bg-white/10"
                />
              </label>
              <button
                type="submit"
                disabled={signUpPending}
                className="mt-2 w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-60"
              >
                {signUpPending ? "Creating account…" : "Create account"}
              </button>
              {signUpError ? <p className="text-sm text-red-300">{signUpError}</p> : null}
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
