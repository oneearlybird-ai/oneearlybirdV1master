"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  const inputBase = {
    width: "100%",
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ddd",
    marginBottom: 12,
    color: "#111",
    caretColor: "#111"
  } as React.CSSProperties;

  return (
    <main style={{ maxWidth: 420, margin: "6rem auto", padding: 24, border: "1px solid #eee", borderRadius: 12 }}>
      <h2 style={{ marginBottom: 12 }}>Sign in</h2>
      <p style={{ fontSize: 12, opacity: 0.7, marginBottom: 16 }}>
        Demo login. Use any valid email and password <b>demo</b>, or Google if enabled.
      </p>
      <form onSubmit={onSubmit}>
        <label style={{ display: "block", fontSize: 12, marginBottom: 6 }}>Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} required type="email" placeholder="you@example.com" style={inputBase}/>
        <label style={{ display: "block", fontSize: 12, marginBottom: 6 }}>Password</label>
        <input value={password} onChange={e=>setPassword(e.target.value)} required type="password" placeholder="demo" style={{ ...inputBase, marginBottom: 16 }}/>
        <button disabled={loading} type="submit" style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd", cursor: loading ? "wait" : "pointer" }}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <div style={{ marginTop: 16 }}>
        <button onClick={() => signIn("google", { callbackUrl: "/dashboard/billing" })} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd" }}>
          Sign in with Google
        </button>
      </div>
      {err && <p style={{ color: "#b00", marginTop: 8, fontSize: 12 }}>Error: {err}</p>}
    </main>
  );
}
