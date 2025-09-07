"use client";
import { useEffect, useMemo, useState } from "react";
import { signIn } from "next-auth/react";

type Providers = Record<string, { id: string; name: string }>;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<Providers | null>(null);

  useEffect(() => {
    fetch("/api/auth/providers")
      .then(r => r.ok ? r.json() : {})
      .then((p: Providers) => setProviders(p || {}))
      .catch(() => setProviders({}));
  }, []);

  const googleEnabled = useMemo(() => !!(providers && providers["google"]), [providers]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false, callbackUrl: "/dashboard/billing" });
    setLoading(false);
    if (!res) return setErr("unavailable");
    if (res.error) return setErr(res.error || "invalid");
    if (res.ok && res.url) window.location.href = res.url;
  }

  const inputBase: React.CSSProperties = {
    width: "100%",
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ddd",
    marginBottom: 12,
    color: "#111",
    caretColor: "#111"
  };

  const googleBtnStyle: React.CSSProperties = {
    width: "100%",
    height: 40,
    border: "1px solid #DADCE0",
    borderRadius: 4,
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    cursor: "pointer"
  };

  const googleLabelStyle: React.CSSProperties = {
    color: "#3C4043",
    fontSize: 14,
    lineHeight: "20px",
    fontWeight: 500
  };

  const containerStyle: React.CSSProperties = { maxWidth: 420, margin: "6rem auto", padding: 24, border: "1px solid #eee", borderRadius: 12 };

  return (
    <main style={containerStyle}>
      <h2 style={{ marginBottom: 12 }}>Sign in</h2>
      <p style={{ fontSize: 12, opacity: 0.7, marginBottom: 16 }}>
        Demo login. Use any valid email and password <b>demo</b>. Google sign-in appears when configured.
      </p>

      <form onSubmit={onSubmit} aria-label="Email and password sign-in">
        <label style={{ display: "block", fontSize: 12, marginBottom: 6 }}>Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} required type="email" placeholder="you@example.com" style={inputBase} aria-label="Email" autoComplete="email" />
        <label style={{ display: "block", fontSize: 12, marginBottom: 6 }}>Password</label>
        <input value={password} onChange={e=>setPassword(e.target.value)} required type="password" placeholder="demo" style={{ ...inputBase, marginBottom: 16 }} aria-label="Password" autoComplete="current-password" />
        <button disabled={loading} type="submit" style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd", cursor: loading ? "wait" : "pointer" }} aria-busy={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      {googleEnabled && (
        <div style={{ marginTop: 16 }}>
          <button onClick={() => signIn("google", { callbackUrl: "/dashboard/billing" })} style={googleBtnStyle} aria-label="Sign in with Google">
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.64 0 6.9 1.25 9.47 3.71l7.1-7.1C36.66 2.14 30.83 0 24 0 14.62 0 6.4 5.38 2.53 13.2l8.9 6.9C13.3 14.64 18.2 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.5 24c0-1.64-.15-3.21-.44-4.71H24v9.01h12.68c-.55 2.97-2.24 5.48-4.76 7.17l7.29 5.66C43.95 36.89 46.5 30.9 46.5 24z"/>
              <path fill="#FBBC05" d="M11.43 28.1c-.57-1.7-.9-3.5-.9-5.35s.33-3.64.9-5.34l-8.9-6.9C.9 13.74 0 18.74s.9 9.99 2.53 13.24l8.9-6.88z"/>
              <path fill="#34A853" d="M24 47.5c6.3 0 11.6-2.08 15.46-5.66l-7.29-5.66c-2.02 1.37-4.62 2.18-8.17 2.18-5.8 0-10.7-5.14-12.57-10.6l-8.9 6.88C6.4 42.62 14.62 47.5 24 47.5z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            <span style={googleLabelStyle}>Sign in with Google</span>
          </button>
        </div>
      )}

      {err && <p style={{ color: "#b00", marginTop: 8, fontSize: 12 }}>Error: {err}</p>}
    </main>
  );
}
