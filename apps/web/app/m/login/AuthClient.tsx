"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/ui/logo";
import OfficialGoogleIcon from "@/components/OfficialGoogleIcon";
import { API_BASE } from "@/lib/config";
import { redirectTo } from "@/lib/clientNavigation";
import { openPopup } from "@/lib/popup";
import {
  buildGoogleStartUrl,
  getDashboardPath,
  getMagicVerifyPath,
  getProfileCapturePath,
} from "@/lib/authPaths";
import { fetchCsrfToken, invalidateCsrfToken } from "@/lib/security";
import { apiFetch } from "@/lib/http";
import { setActiveAuthFlow } from "@/lib/authFlow";
import { useAuthSession } from "@/components/auth/AuthSessionProvider";
import { hasCompletedName } from "@/lib/profile";

const LOGIN_EVENT_KEY = "__ob_login";
const GOOGLE_POPUP_NAME = "oauth-google";

type PanelMode = "login" | "signup";
type MagicStatus = "idle" | "pending" | "sent" | "error";

function apiUrl(path: string): string {
  const base = (API_BASE || "").replace(/\/+/g, "/").replace(/\/$/, "");
  if (base) return `${base}${path}`;
  return `/api/upstream${path}`;
}

function buildAbsoluteUrl(path: string): string {
  if (typeof window === "undefined") {
    return `https://m.oneearlybird.ai${path}`;
  }
  const origin = window.location.origin.replace(/\/$/, "");
  return `${origin}${path}`;
}

export default function AuthClient({ initialTab }: { initialTab: PanelMode }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [tab, setTab] = useState<PanelMode>(initialTab);
  const loginEmailRef = useRef<HTMLInputElement | null>(null);
  const signupEmailRef = useRef<HTMLInputElement | null>(null);
  const googlePopupMonitorRef = useRef<number | null>(null);
  const popupRef = useRef<Window | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginPending, setLoginPending] = useState(false);

  const [signupEmail, setSignupEmail] = useState("");
  const [signupStatus, setSignupStatus] = useState<MagicStatus>("idle");
  const [signupMessage, setSignupMessage] = useState<string | null>(null);

  const [googlePending, setGooglePending] = useState(false);
  const { refresh } = useAuthSession();

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
      popupRef.current = null;
      try {
        localStorage.setItem(LOGIN_EVENT_KEY, String(Date.now()));
      } catch (error) {
        console.warn("google_login_storage_failed", { message: (error as Error)?.message });
      }
      void refresh({ showLoading: true, retryOnUnauthorized: true });
    };
    window.addEventListener("ob:auth:success", handleAuthSuccess);
    return () => {
      window.removeEventListener("ob:auth:success", handleAuthSuccess);
    };
  }, [clearGooglePopupMonitor, refresh]);

  useEffect(() => {
    const allowedOrigins = new Set<string>(["https://oneearlybird.ai", "https://m.oneearlybird.ai", "https://www.oneearlybird.ai"]);
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
      const type = typeof event.data === "string" ? event.data : (event.data as { type?: string } | null)?.type;
      if (type !== "auth-success" && type !== "oauth:success") return;
      try {
        const popup = popupRef.current;
        if (popup && !popup.closed) {
          popup.close();
        }
      } catch (error) {
        console.warn("mobile_auth_popup_close_failed", { message: (error as Error)?.message });
      } finally {
        popupRef.current = null;
      }
      clearGooglePopupMonitor();
      setGooglePending(false);
      try {
        localStorage.setItem(LOGIN_EVENT_KEY, String(Date.now()));
      } catch (error) {
        console.warn("google_login_storage_failed", { message: (error as Error)?.message });
      }
      void refresh({ showLoading: true, retryOnUnauthorized: true });
    };
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [clearGooglePopupMonitor, refresh]);

  useEffect(() => {
    return () => {
      clearGooglePopupMonitor();
      popupRef.current = null;
    };
  }, [clearGooglePopupMonitor]);

  function switchTab(next: PanelMode) {
    setTab(next);
    const entries = typeof (sp as any)?.entries === "function" ? Array.from((sp as any).entries()) : [];
    const q = new URLSearchParams(entries as any);
    if (next === "signup") q.set("tab", "signup");
    else q.delete("tab");
    router.replace(`/m/login${q.toString() ? `?${q.toString()}` : ""}`);
    setTimeout(() => {
      if (next === "login") loginEmailRef.current?.focus();
      else signupEmailRef.current?.focus();
    }, 0);
  }

  useEffect(() => {
    setLoginError(null);
  }, [email, password]);

  useEffect(() => {
    if (signupStatus !== "pending") {
      setSignupStatus("idle");
      setSignupMessage(null);
    }
  }, [signupEmail]);

  async function resolvePostAuthPath(): Promise<string> {
    try {
      const response = await fetch(apiUrl("/tenants/profile"), {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: { "cache-control": "no-store" },
      });
      if (response.ok) {
        const data = (await response.json()) as { firstName?: string | null; lastName?: string | null };
        if (!hasCompletedName(data)) {
          return getProfileCapturePath();
        }
      }
    } catch (error) {
      console.warn("post_auth_profile_failed", { message: (error as Error)?.message });
    }
    return getDashboardPath();
  }

  const attemptLogin = useCallback(async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      setLoginError("Enter your email and password to continue.");
      return;
    }
    setLoginPending(true);
    setLoginError(null);
    try {
      const response = await fetch(apiUrl("/auth/login"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: trimmedEmail, password }),
      });
      if (!response.ok) {
        setLoginError(response.status === 400 || response.status === 401 ? "Invalid email or password." : "Service unavailable. Try again.");
        return;
      }
      try {
        localStorage.setItem(LOGIN_EVENT_KEY, String(Date.now()));
      } catch (storageError) {
        console.warn("login_storage_failed", { message: (storageError as Error)?.message });
      }
      const nextPath = await resolvePostAuthPath();
      redirectTo(nextPath);
    } catch (error) {
      console.error("login_request_failed", { message: (error as Error)?.message });
      setLoginError("We couldn’t reach the server. Please try again.");
    } finally {
      setLoginPending(false);
    }
  }, [email, password]);

  const handleLoginSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (loginPending) return;
      void attemptLogin();
    },
    [attemptLogin, loginPending],
  );

  const sendSignupLink = useCallback(async () => {
    const normalized = signupEmail.trim().toLowerCase();
    if (!normalized) {
      setSignupStatus("error");
      setSignupMessage("Enter your email to continue.");
      return;
    }
    setSignupStatus("pending");
    setSignupMessage(null);
    try {
      const token = await fetchCsrfToken();
      const response = await apiFetch("/auth/magic/start", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-csrf-token": token,
        },
        body: JSON.stringify({
          email: normalized,
          intent: "signup",
          redirect: buildAbsoluteUrl(getMagicVerifyPath("signup")),
        }),
      });
      if (response.ok) {
        setActiveAuthFlow("email-signup", { email: normalized });
        setSignupStatus("sent");
        setSignupMessage("Check your email for a secure link to finish setup.");
        try {
          localStorage.setItem(LOGIN_EVENT_KEY, String(Date.now()));
        } catch (storageError) {
          console.warn("signup_link_storage_failed", { message: (storageError as Error)?.message });
        }
        return;
      }
      const payload = await response.json().catch(() => ({}));
      const message =
        typeof payload?.message === "string" && payload.message.length > 0
          ? payload.message
          : "We couldn’t send the link. Please try again.";
      setSignupStatus("error");
      setSignupMessage(message);
    } catch (error) {
      console.error("signup_magic_link_failed", { message: (error as Error)?.message });
      setSignupStatus("error");
      setSignupMessage("We couldn’t reach the server. Please try again.");
      invalidateCsrfToken();
    }
  }, [signupEmail]);

  const handleSignupSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (signupStatus === "pending") return;
      void sendSignupLink();
    },
    [sendSignupLink, signupStatus],
  );

  const startGoogle = useCallback(
    (intent: "signin" | "signup") => {
      if (googlePending) return;
      const url = buildGoogleStartUrl(intent);
      setActiveAuthFlow(intent === "signup" ? "google-signup" : "google-signin");
      setGooglePending(true);
      clearGooglePopupMonitor();
      const popup = openPopup(url, GOOGLE_POPUP_NAME, { w: 540, h: 680, expectedMessageType: "auth-success" });
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
      onClick={() => startGoogle(intent)}
      disabled={googlePending}
      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#DADCE0] bg-white font-medium text-[#3C4043] transition-colors duration-150 hover:bg-white/90 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#4285F4] disabled:opacity-60"
      aria-label={intent === "signin" ? "Continue with Google" : "Create account with Google"}
      type="button"
    >
      <OfficialGoogleIcon />
      <span>{googlePending ? "Opening…" : "Continue with Google"}</span>
      {googlePending ? (
        <span className="ml-1 inline-flex h-4 w-4 animate-spin rounded-full border-[2px] border-[#c1c3c6] border-t-transparent" aria-hidden />
      ) : null}
    </button>
  );

  return (
    <div className="bg-neutral-950 text-white">
      <section className="mx-auto max-w-md px-4 py-12">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <div className="flex gap-1 rounded-2xl border border-white/15 bg-white/5 p-1" role="tablist" aria-label="Authentication tabs">
          <button
            onClick={() => switchTab("login")}
            className={`w-1/2 rounded-xl px-4 py-2 text-sm font-medium transition ${tab === "login" ? "bg-white text-black shadow" : "text-white/80 hover:bg-white/10"}`}
            aria-selected={tab === "login"}
            aria-controls="panel-login"
            id="tab-login"
            role="tab"
          >
            Sign in
          </button>
          <button
            onClick={() => switchTab("signup")}
            className={`w-1/2 rounded-xl px-4 py-2 text-sm font-medium transition ${tab === "signup" ? "bg-white text-black shadow" : "text-white/80 hover:bg-white/10"}`}
            aria-selected={tab === "signup"}
            aria-controls="panel-signup"
            id="tab-signup"
            role="tab"
          >
            Create account
          </button>
        </div>

        <div id="panel-login" role="tabpanel" aria-labelledby="tab-login" hidden={tab !== "login"} className="mt-6">
          {tab === "login" && (
            <>
              <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
              <p className="mt-2 text-white/70">Use your email and password, or continue with Google.</p>

              <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4" aria-label="Email and password sign-in">
                <label className="block text-xs font-medium uppercase tracking-wide text-white/60">
                  Email
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="you@business.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/20 bg-transparent px-4 py-3 text-white outline-none placeholder-white/40 focus:border-white/40 focus:bg-white/10"
                    autoComplete="email"
                    aria-label="Email"
                    ref={loginEmailRef}
                  />
                </label>
                <label className="block text-xs font-medium uppercase tracking-wide text-white/60">
                  Password
                  <input
                    name="password"
                    type="password"
                    required
                    placeholder="Your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/20 bg-transparent px-4 py-3 text-white outline-none placeholder-white/40 focus:border-white/40 focus:bg-white/10"
                    autoComplete="current-password"
                    aria-label="Password"
                  />
                </label>
                <button
                  type="submit"
                  disabled={loginPending}
                  className="w-full rounded-xl bg-white px-4 py-3 font-medium text-black hover:bg-white/90 disabled:opacity-60"
                  aria-busy={loginPending}
                >
                  {loginPending ? "Signing in…" : "Sign in"}
                </button>
              </form>

              {loginError ? <p className="mt-3 text-sm text-rose-300">{loginError}</p> : null}

              <div className="mt-4">
                <GoogleBtn intent="signin" />
              </div>

              <div className="mt-3 text-xs text-white/60">
                Forgot your password?{" "}
                <Link href="/m/support" className="underline">
                  Contact support
                </Link>
              </div>
            </>
          )}
        </div>

        <div id="panel-signup" role="tabpanel" aria-labelledby="tab-signup" hidden={tab !== "signup"} className="mt-6">
          {tab === "signup" && (
            <>
              <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
              <p className="mt-2 text-white/70">We’ll send a secure link to verify your email. No password required yet.</p>

              <form className="mt-6 space-y-4" onSubmit={handleSignupSubmit} aria-label="Create account">
                <label className="block text-xs font-medium uppercase tracking-wide text-white/60">
                  Work email
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="you@business.com"
                    className="mt-1 w-full rounded-xl border border-white/20 bg-transparent px-4 py-3 text-white outline-none placeholder-white/40 focus:border-white/40 focus:bg-white/10"
                    autoComplete="email"
                    aria-label="Work email"
                    ref={signupEmailRef}
                    value={signupEmail}
                    onChange={(event) => setSignupEmail(event.target.value)}
                  />
                </label>
                <button
                  type="submit"
                  disabled={signupStatus === "pending"}
                  className="w-full rounded-xl bg-white px-4 py-3 font-medium text-black hover:bg-white/90 disabled:opacity-60"
                  aria-busy={signupStatus === "pending"}
                >
                  {signupStatus === "pending" ? "Sending…" : "Email me a magic link"}
                </button>
              </form>

              {signupMessage ? (
                <p className={`mt-3 text-sm ${signupStatus === "error" ? "text-rose-300" : "text-emerald-300"}`}>{signupMessage}</p>
              ) : null}

              <div className="mt-4">
                <GoogleBtn intent="signup" />
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
