export const dynamic = 'force-dynamic';

type Probe = { ok: boolean; status: number };

async function probe(path: string): Promise<Probe> {
  try {
    const res = await fetch(path, { cache: 'no-store' });
    return { ok: res.ok, status: res.status };
  } catch {
    return { ok: false, status: 0 };
  }
}

export default async function StatusPage() {
  const [health, statusProbe, providers] = await Promise.all([
    probe('/api/health'),
    probe('/api/status'),
    fetch('/api/auth/providers', { cache: 'no-store' }).then(r => r.json()).catch(() => ({}))
  ]);

  const env = process.env.VERCEL_ENV ?? 'local';
  const commit = (process.env.VERCEL_GIT_COMMIT_SHA ?? '').slice(0,7) || 'unknown';
  const buildId = process.env.NEXT_BUILD_ID ?? 'unknown';

  const pill = (p: Probe) =>
    p.ok
      ? <span className="inline-flex items-center rounded-full bg-green-600/10 px-2 py-0.5 text-xs font-medium text-green-700">✅ {p.status}</span>
      : <span className="inline-flex items-center rounded-full bg-red-600/10 px-2 py-0.5 text-xs font-medium text-red-700">❌ {p.status || 'ERR'}</span>;

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-6">
      <section>
        <h1 className="text-2xl font-semibold">Service Status</h1>
        <p className="text-sm text-gray-600">Environment: <strong>{env}</strong> · Commit: <strong>{commit}</strong> · Build: <strong>{buildId}</strong></p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">/api/health</h2>
            {pill(health)}
          </div>
          <p className="text-sm text-gray-600">Liveness probe</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">/api/status</h2>
            {pill(statusProbe)}
          </div>
          <p className="text-sm text-gray-600">Readiness / app wiring</p>
        </div>
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="font-medium mb-2">Auth Providers</h2>
        <pre className="text-xs whitespace-pre-wrap break-words bg-gray-50 border rounded p-2">
{JSON.stringify(providers, null, 2)}
        </pre>
        <p className="text-xs text-gray-600 mt-1">This is safe to show; no secrets are included.</p>
      </section>

      <section className="text-xs text-gray-500">
        <p>Security headers enforced (CSP, HSTS, XCTO, XFO, RP, COOP/COEP, Permissions-Policy). Preview is non-indexable.</p>
      </section>
    </main>
  );
}
