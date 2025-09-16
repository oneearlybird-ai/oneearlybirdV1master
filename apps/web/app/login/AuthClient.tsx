"use client";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import OfficialGoogleIcon from "@/components/OfficialGoogleIcon";

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
    const res = await signIn("credentials", { email, password, redirect: false, callbackUrl: "/dashboard" });
    setLoading(false);
    if (!res) return setErr("unavailable");
    if (res.error) return setErr(res.error || "invalid");
    if (res.ok && res.url) window.location.href = res.url;
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
    </div>
  );
}
