"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import OfficialGoogleIcon from "@/components/OfficialGoogleIcon";
import Link from "next/link";
import { API_BASE } from "@/lib/config";
import { redirectTo } from "@/lib/clientNavigation";
import { openPopup } from "@/lib/popup";
import { useAuthModal } from "@/components/auth/AuthModalProvider";

const LOGIN_EVENT_KEY = "__ob_login";

function isLikelyGoogleEmail(value: string) {
  return value.trim().toLowerCase().endsWith("@gmail.com");
}

export default function AuthClient({ initialTab }: { initialTab: "login" | "signup" }) {
  const router = useRouter();
  const sp = useSearchParams();
  const { open: openModal, isOpen, setMode } = useAuthModal();
  const [tab, setTab] = useState<"login" | "signup">(initialTab);
  const loginEmailRef = useRef<HTMLInputElement | null>(null);
  const signupEmailRef = useRef<HTMLInputElement | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showGooglePrompt, setShowGooglePrompt] = useState(false);

  // Signup-specific state
  const [suEmail, setSuEmail] = useState("");
  const [suPassword, setSuPassword] = useState("");
  const [suConfirm, setSuConfirm] = useState("");
  const [suErr, setSuErr] = useState<string | null>(null);
  const [suLoading, setSuLoading] = useState(false);
  const [googlePending, setGooglePending] = useState(false);

  useEffect(() => {
    const handleAuthSuccess = () => {
      setGooglePending(false);
      setShowGooglePrompt(false);
      try {
        localStorage.setItem(LOGIN_EVENT_KEY, String(Date.now()));
      } catch (error) {
        console.warn("google_login_storage_failed", { message: (error as Error)?.message });
      }
      window.location.href = "/dashboard";
    };
    window.addEventListener("ob:auth:success", handleAuthSuccess);
    return () => {
      window.removeEventListener("ob:auth:success", handleAuthSuccess);
    };
  }, []);

  useEffect(() => {
    const mode = initialTab === "signup" ? "signup" : "signin";
    if (isOpen) {
      setMode(mode);
    } else {
      openModal(mode);
    }
  }, [initialTab, isOpen, openModal, setMode]);

  function switchTab(next: "login" | "signup") {
    setTab(next);
    const entries = typeof (sp as any)?.entries === "function" ? Array.from((sp as any).entries()) : [];
    const q = new URLSearchParams(entries as any);
    if (next === "signup") q.set("tab", "signup");
    else q.delete("tab");
    router.replace(`/login${q.toString() ? `?${q.toString()}` : ""}`);
    // Move focus to the first field of the target panel for better a11y
    setTimeout(() => {
      if (next === "login") loginEmailRef.current?.focus();
      else signupEmailRef.current?.focus();
    }, 0);
  }

  async function attemptLogin(bypassPrompt = false) {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/auth/login"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        if ((res.status === 400 || res.status === 401) && isLikelyGoogleEmail(email) && !bypassPrompt) {
          setShowGooglePrompt(true);
          return;
        }
        setErr(res.status === 400 || res.status === 401 ? "login_failed" : "unavailable");
        return;
      }
      try {
        localStorage.setItem(LOGIN_EVENT_KEY, String(Date.now()));
      } catch (error) {
        console.warn("login_storage_failed", { message: (error as Error)?.message });
      }
      redirectTo("/dashboard");
    } catch (_err) {
      setErr("unavailable");
    } finally {
      setLoading(false);
    }
  }

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    if (isLikelyGoogleEmail(email)) {
      setShowGooglePrompt(true);
      return;
    }
    await attemptLogin();
  }

  function apiUrl(path: string) {
    const base = (API_BASE || "").replace(/\/+$/, "");
    if (base) return `${base}${path}`;
    return `/api/upstream${path}`; // preview/proxy path
  }

  async function onSignup(e: React.FormEvent) {
    e.preventDefault();
    setSuErr(null);
    if (!suEmail || !suPassword) {
      setSuErr("missing_fields");
      return;
    }
    if (suPassword !== suConfirm) {
      setSuErr("passwords_do_not_match");
      return;
    }
    setSuLoading(true);
    try {
      // 1) Create account — accept 200/201 or 409 (already exists)
      const signRes = await fetch(apiUrl("/auth/signup"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({ email: suEmail, password: suPassword }),
      });
      if (!(signRes.status === 200 || signRes.status === 201 || signRes.status === 409)) {
        setSuErr("signup_failed");
        return;
      }
      // 2) Login to set cookies (three httpOnly cookies set by backend)
      const logRes = await fetch(apiUrl("/auth/login"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({ email: suEmail, password: suPassword }),
      });
      if (!logRes.ok) {
        setSuErr("login_failed");
        return;
      }
      // 3) Redirect to authenticated area
      try {
        localStorage.setItem(LOGIN_EVENT_KEY, String(Date.now()));
      } catch (error) {
        console.warn("signup_login_storage_failed", { message: (error as Error)?.message });
      }
      redirectTo("/dashboard");
    } catch (_e) {
      setSuErr("unavailable");
    } finally {
      setSuLoading(false);
    }
  }

  function startGoogleSignIn() {
    if (googlePending) return;
    const base = apiUrl("/oauth/google/start");
    const separator = base.includes("?") ? "&" : "?";
    const url = `${base}${separator}prompt=select_account`;
    setShowGooglePrompt(false);
      const popup = openPopup(url, "oauth-google", {
        expectedMessageType: "auth:success",
        w: 540,
        h: 680,
      });
      if (popup) {
        setGooglePending(true);
    } else {
      window.location.href = url;
    }
  }

  const GoogleBtn = ({ label }: { label: string }) => (
    <button
      onClick={startGoogleSignIn}
      disabled={googlePending}
      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#DADCE0] bg-white font-medium text-[#3C4043] transition-colors duration-150 hover:bg-white/90 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#4285F4] disabled:opacity-60"
      aria-label={label}
      type="button"
    >
      <OfficialGoogleIcon />
      <span>{googlePending ? "Waiting…" : label}</span>
    </button>
  );

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
              <p className="mt-2 text-white/70">Use your email and password, or Google if enabled.</p>

              <form onSubmit={onLogin} className="mt-8 space-y-4" aria-label="Email and password sign-in">
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@business.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-3 text-white outline-none placeholder-white/40"
                  autoComplete="email"
                  aria-label="Email"
                  ref={loginEmailRef}
                />
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="Your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-3 text-white outline-none placeholder-white/40"
                  autoComplete="current-password"
                  aria-label="Password"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-white px-4 py-3 font-medium text-black hover:bg-white/90 disabled:opacity-60"
                  aria-busy={loading}
                >
                  {loading ? "Signing in…" : "Sign in"}
                </button>
              </form>

              <div className="mt-4">
                <GoogleBtn label="Continue with Google" />
              </div>

              <div className="mt-3 text-xs text-white/60">
                <span>Forgot your password? </span>
                <Link href="/support" className="underline">
                  Contact support
                </Link>
              </div>

              {err ? <p className="mt-3 text-sm text-red-300">Error: {err}</p> : null}
            </>
          )}
        </div>

        <div id="panel-signup" role="tabpanel" aria-labelledby="tab-signup" hidden={tab !== "signup"} className="mt-8">
          {tab === "signup" && (
            <>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Create your account</h1>
              <p className="mt-2 text-white/70">Set your email and password to get started.</p>

              <form className="mt-8 space-y-4" onSubmit={onSignup} aria-label="Create account">
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@business.com"
                  className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-3 text-white outline-none placeholder-white/40"
                  autoComplete="email"
                  aria-label="Email"
                  ref={signupEmailRef}
                  value={suEmail}
                  onChange={(event) => setSuEmail(event.target.value)}
                />
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="Create a password"
                  className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-3 text-white outline-none placeholder-white/40"
                  autoComplete="new-password"
                  aria-label="Password"
                  value={suPassword}
                  onChange={(event) => setSuPassword(event.target.value)}
                />
                <input
                  name="confirm"
                  type="password"
                  required
                  placeholder="Confirm password"
                  className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-3 text-white outline-none placeholder-white/40"
                  autoComplete="new-password"
                  aria-label="Confirm password"
                  value={suConfirm}
                  onChange={(event) => setSuConfirm(event.target.value)}
                />
                <button
                  type="submit"
                  disabled={suLoading}
                  className="w-full rounded-xl bg-white px-4 py-3 font-medium text-black hover:bg-white/90 disabled:opacity-60"
                  aria-busy={suLoading}
                >
                  {suLoading ? "Creating account…" : "Create account"}
                </button>
                {suErr ? <p className="text-sm text-red-300">Error: {suErr}</p> : null}
              </form>

              <div className="mt-4">
                <GoogleBtn label="Continue with Google" />
              </div>
            </>
          )}
        </div>
      </section>

      {showGooglePrompt ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          role="presentation"
          onClick={() => setShowGooglePrompt(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="gmail-modal-title"
            className="w-full max-w-sm rounded-2xl bg-white p-6 text-neutral-900 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="gmail-modal-title" className="text-lg font-semibold text-neutral-900">
              Continue with Google?
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              This email often signs in with Google. Choose Google for the fastest sign-in, or continue with your email and password.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <GoogleBtn label="Continue with Google" />
              <button
                type="button"
                onClick={() => {
                  setShowGooglePrompt(false);
                  void attemptLogin(true);
                }}
                disabled={loading}
                className="flex items-center justify-center rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 disabled:opacity-60"
              >
                Continue with email
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowGooglePrompt(false)}
              className="mt-4 text-xs font-medium text-neutral-500 underline-offset-4 hover:underline"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
