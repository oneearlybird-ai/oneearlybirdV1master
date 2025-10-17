export const dynamic = "force-dynamic";

import Section from "@/components/stellar/Section";

type Probe = { ok: boolean; status: number };

async function probe(path: string): Promise<Probe> {
  try {
    const res = await fetch(path, { cache: "no-store" });
    return { ok: res.ok, status: res.status };
  } catch {
    return { ok: false, status: 0 };
  }
}

const STATUS_LABELS: Record<number, string> = {
  0: "Unavailable",
  200: "OK",
  401: "Unauthorized",
  403: "Forbidden",
  500: "Server error",
};

function pill(probe: Probe) {
  const base = "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold";
  if (probe.ok) {
    return (
      <span className={`${base} border border-emerald-400/30 bg-emerald-400/15 text-emerald-100`}>
        <span className="h-2 w-2 rounded-full bg-emerald-300" aria-hidden />
        {STATUS_LABELS[probe.status] ?? probe.status}
      </span>
    );
  }
  return (
    <span className={`${base} border border-rose-400/40 bg-rose-400/15 text-rose-100`}>
      <span className="h-2 w-2 rounded-full bg-rose-300" aria-hidden />
      {STATUS_LABELS[probe.status] ?? "Unavailable"}
    </span>
  );
}

export default async function StatusPage() {
  const [health, statusProbe, providers] = await Promise.all([
    probe("/api/health"),
    probe("/api/status"),
    fetch("/api/auth/providers", { cache: "no-store" })
      .then(async (res) => (res.ok ? res.json() : {}))
      .catch(() => ({})),
  ]);

  const env = process.env.VERCEL_ENV ?? "local";
  const commit = (process.env.VERCEL_GIT_COMMIT_SHA ?? "").slice(0, 7) || "unknown";
  const buildId = process.env.NEXT_BUILD_ID ?? "unknown";

  return (
    <div className="flex flex-col">
      <section className="px-5 pt-20 pb-12 sm:px-6 md:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="stellar-pill">Status</span>
          <h1 className="mt-6 text-4xl font-semibold text-white md:text-5xl">Live system checks</h1>
          <p className="mt-6 text-base text-white/70 md:text-lg">
            All probes run against the current environment with cache disabled. Use this page to verify uptime and release metadata.
          </p>
          <div className="mt-6 inline-flex items-center gap-4 rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/70">
            <span>Env: {env}</span>
            <span>Build: {buildId}</span>
            <span>Commit: {commit}</span>
          </div>
        </div>
      </section>

      <Section className="pt-0">
        <div className="mx-auto flex max-w-4xl flex-col gap-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="stellar-grid-card bg-white/5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-white">/api/health</h2>
                {pill(health)}
              </div>
              <p className="mt-3 text-sm text-white/70">Liveness probe. Confirms the app and database are reachable.</p>
            </div>
            <div className="stellar-grid-card bg-white/5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-white">/api/status</h2>
                {pill(statusProbe)}
              </div>
              <p className="mt-3 text-sm text-white/70">Readiness probe. Ensures upstream services and secrets are wired correctly.</p>
            </div>
          </div>

          <div className="stellar-grid-card bg-white/5">
            <header className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Auth providers</h2>
              <span className="text-xs uppercase tracking-[0.18em] text-white/50">Server output • safe to share</span>
            </header>
            <pre className="mt-4 max-h-64 overflow-auto rounded-2xl bg-[#111018] p-4 text-xs text-white/80">
{JSON.stringify(providers, null, 2)}
            </pre>
          </div>

          <div className="stellar-grid-card bg-white/5">
            <h2 className="text-lg font-semibold text-white">Security headers</h2>
            <p className="mt-3 text-sm text-white/70">
              Marketing and auth routes emit: CSP (report-only), HSTS (includeSubDomains), X-Content-Type-Options: nosniff, Referrer-Policy: strict-origin-when-cross-origin,
              Permissions-Policy: minimal, X-Frame-Options: DENY, Vary: Origin. APIs continue to echo Access-Control-Allow-Origin for apex + m. origins with
              Access-Control-Allow-Credentials: true and Cache-Control: no-store.
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}
