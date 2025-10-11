"use client";
import { useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import OfficialGoogleIcon from "@/components/OfficialGoogleIcon";
import Link from "next/link";
import { API_BASE } from "@/lib/config";

type Providers = Record<string, { id: string; name: string }>;

export default function AuthClient({
  providers,
  initialTab
}: {
  providers: Providers;
  initialTab: "login" | "signup";
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [tab, setTab] = useState<"login" | "signup">(initialTab);
  const loginEmailRef = useRef<HTMLInputElement | null>(null);
  const signupEmailRef = useRef<HTMLInputElement | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Signup-specific state
  const [suEmail, setSuEmail] = useState("");
  const [suPassword, setSuPassword] = useState("");
  const [suConfirm, setSuConfirm] = useState("");
  const [suErr, setSuErr] = useState<string | null>(null);
  const [suLoading, setSuLoading] = useState(false);

  const googleEnabled = useMemo(() => !!providers && !!providers["google"], [providers]);

  function switchTab(next: "login" | "signup") {
    setTab(next);
    const entries = typeof (sp as any)?.entries === 'function' ? Array.from((sp as any).entries()) : [];
    const q = new URLSearchParams(entries as any);
    if (next === "signup") q.set("tab", "signup"); else q.delete("tab");
    router.replace(`/login${q.toString() ? `?${q.toString()}` : ""}`);
    // Move focus to the first field of the target panel for better a11y
    setTimeout(() => {
      if (next === "login") loginEmailRef.current?.focus();
      else signupEmailRef.current?.focus();
    }, 0);
  }

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false, callbackUrl: "/dashboard" });
    setLoading(false);
    if (!res) return setErr("unavailable");
    if (res.error) return setErr(res.error || "invalid");
    if (res.ok && res.url) window.location.href = res.url;
  }

  function apiUrl(path: string) {
    const base = (API_BASE || "").replace(/\/+$/, "");
    if (base) return `${base}${path}`;
    return `/api/upstream${path}`; // preview/proxy path
  }

  async function onSignup(e: React.FormEvent) {
    e.preventDefault();
    setSuErr(null);
    if (!suEmail || !suPassword) { setSuErr("missing_fields"); return; }
    if (suPassword !== suConfirm) { setSuErr("passwords_do_not_match"); return; }
    setSuLoading(true);
    try {
      // 1) Create account — accept 200/201 or 409 (already exists)
      const signRes = await fetch(apiUrl('/auth/signup'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: suEmail, password: suPassword })
      });
      if (!(signRes.status === 200 || signRes.status === 201 || signRes.status === 409)) {
        setSuErr('signup_failed'); setSuLoading(false); return;
      }
      // 2) Login to set cookies (three httpOnly cookies set by backend)
      const logRes = await fetch(apiUrl('/auth/login'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: suEmail, password: suPassword })
      });
      if (!logRes.ok) { setSuErr('login_failed'); setSuLoading(false); return; }
      // 3) Redirect to authenticated area
      router.push('/dashboard');
    } catch (_e) {
      setSuErr('unavailable');
    } finally {
      setSuLoading(false);
    }
  }

  const GoogleBtn = ({ label }: { label: string }) => (
    <button
      onClick={() => signIn("google", {callbackUrl: "/dashboard",prompt: "select_account"})}
      className="w-full h-11 rounded-xl border border-[#DADCE0] bg-white text-[#3C4043] font-medium flex items-center justify-center gap-2 hover:bg-white/90 hover:shadow-sm transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#4285F4]"
      aria-label={label}
      type="button"
    >
      <OfficialGoogleIcon />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="bg-neutral-950 text-white">
      <section className="mx-auto max-w-lg px-6 py-16 md:py-24">
        <div className="flex gap-1 rounded-2xl border border-white/15 bg-white/5 p-1" role="tablist" aria-label="Authentication tabs">
          <button
            onClick={() => switchTab("login")}
            className={`w-1/2 rounded-xl px-4 py-2 text-sm font-medium ${tab==="login" ? "bg-white text-black" : "text-white/80 hover:bg-white/10"}`}
            aria-selected={tab==="login"}
            aria-controls="panel-login"
            id="tab-login"
            role="tab"
          >
            Sign in
          </button>
          <button
            onClick={() => switchTab("signup")}
            className={`w-1/2 rounded-xl px-4 py-2 text-sm font-medium ${tab==="signup" ? "bg-white text-black" : "text-white/80 hover:bg-white/10"}`}
            aria-selected={tab==="signup"}
            aria-controls="panel-signup"
            id="tab-signup"
            role="tab"
          >
            Create account
          </button>
        </div>

        <div
          id="panel-login"
          role="tabpanel"
          aria-labelledby="tab-login"
          hidden={tab !== "login"}
          className="mt-8"
        >
          {tab === "login" && (
            <>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Welcome back</h1>
            <p className="mt-2 text-white/70">Use your email and password, or Google if enabled.</p>

            <form onSubmit={onLogin} className="mt-8 space-y-4" aria-label="Email and password sign-in">
              <input
                name="email"
                type="email"
                required
                placeholder="you@business.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-3 outline-none placeholder-white/40 text-white"
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
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-3 outline-none placeholder-white/40 text-white"
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

            {googleEnabled && (
              <div className="mt-4">
                <GoogleBtn label="Continue with Google" />
              </div>
            )}

            <div className="mt-3 text-xs text-white/60">
              <span>Forgot your password? </span>
              <Link href="/support" className="underline">Contact support</Link>
            </div>

            {err && <p className="mt-3 text-sm text-red-300">Error: {err}</p>}
            </>
          )}
        </div>

        <div
          id="panel-signup"
          role="tabpanel"
          aria-labelledby="tab-signup"
          hidden={tab !== "signup"}
          className="mt-8"
        >
          {tab === "signup" && (
            <>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Create your account</h1>
            <p className="mt-2 text-white/70">Set your email and password to get started.</p>

            <form className="mt-8 space-y-4" onSubmit={onSignup} aria-label="Create account">
              <input
                name="email"
                type="email"
                required
                placeholder="you@business.com"
                className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-3 outline-none placeholder-white/40 text-white"
                autoComplete="email"
                aria-label="Email"
                ref={signupEmailRef}
                value={suEmail}
                onChange={e => setSuEmail(e.target.value)}
              />
              <input
                name="password"
                type="password"
                required
                placeholder="Create a password"
                className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-3 outline-none placeholder-white/40 text-white"
                autoComplete="new-password"
                aria-label="Password"
                value={suPassword}
                onChange={e => setSuPassword(e.target.value)}
              />
              <input
                name="confirm"
                type="password"
                required
                placeholder="Confirm password"
                className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-3 outline-none placeholder-white/40 text-white"
                autoComplete="new-password"
                aria-label="Confirm password"
                value={suConfirm}
                onChange={e => setSuConfirm(e.target.value)}
              />
              <button
                type="submit"
                disabled={suLoading}
                className="w-full rounded-xl bg-white px-4 py-3 font-medium text-black hover:bg-white/90 disabled:opacity-60"
                aria-busy={suLoading}
              >
                {suLoading ? "Creating account…" : "Create account"}
              </button>
              {suErr && <p className="text-sm text-red-300">Error: {suErr}</p>}
            </form>

            {googleEnabled && (
              <div className="mt-4">
                <GoogleBtn label="Continue with Google" />
              </div>
            )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
