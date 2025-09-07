"use client";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

type Providers = Record<string, { id: string; name: string }>;

function GoogleIcon(props: { className?: string; width?: number; height?: number }) {
  const { className, width = 18, height = 18 } = props;
  return (
    <svg width={width} height={height} viewBox="0 0 48 48" aria-hidden="true" className={className}>
      <path fill="#EA4335" d="M24 9.5c3.64 0 6.9 1.25 9.47 3.71l7.1-7.1C36.66 2.14 30.83 0 24 0 14.62 0 6.4 5.38 2.53 13.2l8.9 6.9C13.3 14.64 18.2 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.5 24c0-1.64-.15-3.21-.44-4.71H24v9.01h12.68c-.55 2.97-2.24 5.48-4.76 7.17l7.29 5.66C43.95 36.89 46.5 30.9 46.5 24z"/>
      <path fill="#FBBC05" d="M11.43 28.1c-.57-1.7-.9-3.5-.9-5.35s.33-3.64.9-5.34l-8.9-6.9C.9 13.74 0 18.74s.9 9.99 2.53 13.24l8.9-6.88z"/>
      <path fill="#34A853" d="M24 47.5c6.3 0 11.6-2.08 15.46-5.66l-7.29-5.66c-2.02 1.37-4.62 2.18-8.17 2.18-5.8 0-10.7-5.14-12.57-10.6l-8.9 6.88C6.4 42.62 14.62 47.5 24 47.5z"/>
      <path fill="none" d="M0 0h48v48H0z"/>
    </svg>
  );
}

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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const googleEnabled = useMemo(() => !!providers && !!providers["google"], [providers]);

  function switchTab(next: "login" | "signup") {
    setTab(next);
    const q = new URLSearchParams(Array.from(sp.entries()));
    if (next === "signup") q.set("tab", "signup"); else q.delete("tab");
    router.replace(`/login${q.toString() ? `?${q.toString()}` : ""}`);
  }

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false, callbackUrl: "/dashboard/billing" });
    setLoading(false);
    if (!res) return setErr("unavailable");
    if (res.error) return setErr(res.error || "invalid");
    if (res.ok && res.url) window.location.href = res.url;
  }

  const GoogleBtn = ({ label }: { label: string }) => (
    <button
      onClick={() => signIn("google", { callbackUrl: "/dashboard/billing" })}
      className="w-full h-11 rounded-xl border border-[#DADCE0] bg-white text-[#3C4043] font-medium flex items-center justify-center gap-2 hover:bg-white/90 hover:shadow-sm transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#4285F4]"
      aria-label={label}
      type="button"
    >
      <GoogleIcon />
      <span>{label}</span>
    </button>
  );

  return (
    <main className="min-h-dvh bg-neutral-950 text-white">
      <section className="mx-auto max-w-lg px-6 py-16 md:py-24">
        <div className="flex gap-1 rounded-2xl border border-white/15 bg-white/5 p-1">
          <button
            onClick={() => switchTab("login")}
            className={`w-1/2 rounded-xl px-4 py-2 text-sm font-medium ${tab==="login" ? "bg-white text-black" : "text-white/80 hover:bg-white/10"}`}
            aria-selected={tab==="login"}
            role="tab"
          >
            Sign in
          </button>
          <button
            onClick={() => switchTab("signup")}
            className={`w-1/2 rounded-xl px-4 py-2 text-sm font-medium ${tab==="signup" ? "bg-white text-black" : "text-white/80 hover:bg-white/10"}`}
            aria-selected={tab==="signup"}
            role="tab"
          >
            Create account
          </button>
        </div>

        {tab === "login" && (
          <div className="mt-8">
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

            {err && <p className="mt-3 text-sm text-red-300">Error: {err}</p>}
          </div>
        )}

        {tab === "signup" && (
          <div className="mt-8">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Create your account</h1>
            <p className="mt-2 text-white/70">Set your email and password to get started.</p>

            <form className="mt-8 space-y-4" onSubmit={(e)=>e.preventDefault()} aria-label="Create account">
              <input
                name="email"
                type="email"
                required
                placeholder="you@business.com"
                className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-3 outline-none placeholder-white/40 text-white"
                autoComplete="email"
                aria-label="Email"
              />
              <input
                name="password"
                type="password"
                required
                placeholder="Create a password"
                className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-3 outline-none placeholder-white/40 text-white"
                autoComplete="new-password"
                aria-label="Password"
              />
              <input
                name="confirm"
                type="password"
                required
                placeholder="Confirm password"
                className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-3 outline-none placeholder-white/40 text-white"
                autoComplete="new-password"
                aria-label="Confirm password"
              />
              <button
                type="submit"
                disabled
                className="w-full rounded-xl bg-white/30 px-4 py-3 font-medium text-white/80 cursor-not-allowed"
                aria-disabled="true"
              >
                Create account (coming soon)
              </button>
            </form>

            {googleEnabled && (
              <div className="mt-4">
                <GoogleBtn label="Continue with Google" />
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
