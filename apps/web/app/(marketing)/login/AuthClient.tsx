"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import OfficialGoogleIcon from "@/components/OfficialGoogleIcon";
import Link from "next/link";
import { openPopup } from "@/lib/popup";
import { buildGoogleStartUrl, getMagicVerifyPath } from "@/lib/authPaths";
import { apiFetch } from "@/lib/http";
import { fetchCsrfToken, invalidateCsrfToken } from "@/lib/security";
import { setActiveAuthFlow } from "@/lib/authFlow";

const LOGIN_EVENT_KEY = "__ob_login";
const GOOGLE_POPUP_NAME = "oauth-google";

type MagicLinkStatus = "idle" | "pending" | "sent" | "error";

type PanelMode = "login" | "signup";

function buildAbsoluteUrl(path: string): string {
  if (typeof window === "undefined") {
    return `https://oneearlybird.ai${path}`;
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
  const [loginEmail, setLoginEmail] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [loginStatus, setLoginStatus] = useState<MagicLinkStatus>("idle");
  const [signupStatus, setSignupStatus] = useState<MagicLinkStatus>("idle");
  const [loginMessage, setLoginMessage] = useState<string | null>(null);
  const [signupMessage, setSignupMessage] = useState<string | null>(null);
  const [googlePending, setGooglePending] = useState(false);

  useEffect(() => {
    const handleAuthSuccess = () => {
      if (googlePopupMonitorRef.current !== null) {
        window.clearInterval(googlePopupMonitorRef.current);
        googlePopupMonitorRef.current = null;
      }
      setGooglePending(false);
      try {
        localStorage.setItem(LOGIN_EVENT_KEY, String(Date.now()));
      } catch (error) {
        console.warn("google_login_storage_failed", { message: (error as Error)?.message });
      }
    };
    window.addEventListener("ob:auth:success", handleAuthSuccess);
    return () => {
      window.removeEventListener("ob:auth:success", handleAuthSuccess);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (googlePopupMonitorRef.current !== null) {
        window.clearInterval(googlePopupMonitorRef.current);
        googlePopupMonitorRef.current = null;
      }
    };
  }, []);

  function switchTab(next: PanelMode) {
    setTab(next);
    const entries = typeof (sp as any)?.entries === "function" ? Array.from((sp as any).entries()) : [];
    const q = new URLSearchParams(entries as any);
    if (next === "signup") q.set("tab", "signup");
    else q.delete("tab");
    router.replace(`/login${q.toString() ? `?${q.toString()}` : ""}`);
    setTimeout(() => {
      if (next === "login") loginEmailRef.current?.focus();
      else signupEmailRef.current?.focus();
    }, 0);
  }

  const setStatusForIntent = useCallback((intent: PanelMode, status: MagicLinkStatus, message?: string | null) => {
    if (intent === "login") {
      setLoginStatus(status);
      setLoginMessage(message ?? null);
    } else {
      setSignupStatus(status);
      setSignupMessage(message ?? null);
    }
  }, []);

  const requestMagicLink = useCallback(
    async (intent: PanelMode) => {
      const email = intent === "login" ? loginEmail.trim() : signupEmail.trim();
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
            intent: intent === "login" ? "signin" : "signup",
            redirect: buildAbsoluteUrl(getMagicVerifyPath(intent === "login" ? "signin" : "signup")),
          }),
        });
        if (response.ok) {
          setStatusForIntent(intent, "sent", "Check your email for a secure link.");
          try {
            localStorage.setItem(LOGIN_EVENT_KEY, String(Date.now()));
          } catch (error) {
            console.warn("magic_link_storage_failed", { message: (error as Error)?.message });
          }
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
    [loginEmail, signupEmail, setStatusForIntent],
  );

  const startGoogle = useCallback(
    (intent: "signin" | "signup") => {
      if (googlePending) return;
      const url = buildGoogleStartUrl(intent);
      setActiveAuthFlow(intent === "signup" ? "google-signup" : "google-signin");
      setGooglePending(true);
      if (googlePopupMonitorRef.current !== null) {
        window.clearInterval(googlePopupMonitorRef.current);
      }
      const popup = openPopup(url, GOOGLE_POPUP_NAME, { w: 540, h: 680, expectedMessageType: "oauth:success" });
      if (!popup) {
        setGooglePending(false);
        window.location.href = url;
        return;
      }
      googlePopupMonitorRef.current = window.setInterval(() => {
        if (!popup || popup.closed) {
          if (googlePopupMonitorRef.current !== null) {
            window.clearInterval(googlePopupMonitorRef.current);
            googlePopupMonitorRef.current = null;
          }
          setGooglePending(false);
        }
      }, 500);
    },
    [googlePending],
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
    if (intent === "login" && loginStatus === "pending") return;
    if (intent === "signup" && signupStatus === "pending") return;
    void requestMagicLink(intent);
  };

  useEffect(() => {
    setLoginMessage(null);
    setLoginStatus("idle");
  }, [loginEmail]);

  useEffect(() => {
    setSignupMessage(null);
    setSignupStatus("idle");
  }, [signupEmail]);

  return (
    <div className="bg-neutral-950 text-white">
      <section className="mx-auto max-w-lg px-6 py-16 md:py-24">
        <div className="flex gap-1 rounded-2xl border border-white/15 bg-white/5 p-1" role="tablist" aria-label="Authentication tabs">
          <button
            onClick={() => switchTab("login")}
            className={`w-1/2 rounded-xl px-4 py-2 text-sm font-medium ${tab === "login" ? "bg-white text-black" : "text-white/80 hover:bg-white/10"}`}
            aria-selected={tab === "login"}
            aria-controls="panel-login"
            id="tab-login"
            role="tab"
          >
            Sign in
          </button>
          <button
            onClick={() => switchTab("signup")}
            className={`w-1/2 rounded-xl px-4 py-2 text-sm font-medium ${tab === "signup" ? "bg-white text-black" : "text-white/80 hover:bg-white/10"}`}
            aria-selected={tab === "signup"}
            aria-controls="panel-signup"
            id="tab-signup"
            role="tab"
          >
            Create account
          </button>
        </div>

        <div id="panel-login" role="tabpanel" aria-labelledby="tab-login" hidden={tab !== "login"} className="mt-8">
          {tab === "login" && (
            <>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Welcome back</h1>
              <p className="mt-2 text-white/70">We’ll email you a magic link to sign in.</p>

              <form onSubmit={(event) => handleSubmitMagic(event, "login") } className="mt-8 space-y-4" aria-label="Magic link sign-in">
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@business.com"
                  value={loginEmail}
                  onChange={(event) => setLoginEmail(event.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-3 text-white outline-none placeholder-white/40"
                  autoComplete="email"
                  aria-label="Email"
                  ref={loginEmailRef}
                />
                <button
                  type="submit"
                  disabled={loginStatus === "pending"}
                  className="w-full rounded-xl bg-white px-4 py-3 font-medium text-black hover:bg-white/90 disabled:opacity-60"
                  aria-busy={loginStatus === "pending"}
                >
                  {loginStatus === "pending" ? "Sending…" : "Email me a magic link"}
                </button>
                {loginMessage ? (
                  <p className={`text-sm ${loginStatus === "error" ? "text-rose-300" : "text-white/70"}`}>{loginMessage}</p>
                ) : null}
              </form>

              <div className="mt-4">
                <GoogleBtn label="Continue with Google" intent="signin" />
              </div>

              <div className="mt-3 text-xs text-white/60">
                <span>Need a hand? </span>
                <Link href="/support" className="underline">
                  Contact support
                </Link>
              </div>
            </>
          )}
        </div>

        <div id="panel-signup" role="tabpanel" aria-labelledby="tab-signup" hidden={tab !== "signup"} className="mt-8">
          {tab === "signup" && (
            <>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Create your account</h1>
              <p className="mt-2 text-white/70">Start with your email. We’ll send a magic link to verify it.</p>

              <form className="mt-8 space-y-4" onSubmit={(event) => handleSubmitMagic(event, "signup")} aria-label="Create account">
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@business.com"
                  className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-3 text-white outline-none placeholder-white/40"
                  autoComplete="email"
                  aria-label="Email"
                  ref={signupEmailRef}
                  value={signupEmail}
                  onChange={(event) => setSignupEmail(event.target.value)}
                />
                <button
                  type="submit"
                  disabled={signupStatus === "pending"}
                  className="w-full rounded-xl bg-white px-4 py-3 font-medium text-black hover:bg-white/90 disabled:opacity-60"
                  aria-busy={signupStatus === "pending"}
                >
                  {signupStatus === "pending" ? "Sending…" : "Send verification link"}
                </button>
                {signupMessage ? (
                  <p className={`text-sm ${signupStatus === "error" ? "text-rose-300" : "text-white/70"}`}>{signupMessage}</p>
                ) : null}
              </form>

              <div className="mt-4">
                <GoogleBtn label="Create with Google" intent="signup" />
              </div>
              <p className="mt-4 text-xs text-white/60">
                After you verify your email, we’ll walk you through a quick setup to personalize EarlyBird AI.
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
