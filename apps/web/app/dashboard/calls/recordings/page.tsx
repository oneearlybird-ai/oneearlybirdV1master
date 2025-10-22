export const dynamic = "force-dynamic";

type Rec = { id: string; startedAt: string; durationSec: number; summary: string }

async function fetchList(): Promise<Rec[]> {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL || ''
    const res = await fetch(`${base}/api/recordings/list`, { cache: 'no-store' })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data?.rows) ? data.rows : []
  } catch { return [] }
}

export default async function RecordingsPage() {
  const rows = await fetchList()
  return (
    <section className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold tracking-tight text-white">Recordings</h1>
      <div className="mt-1 text-sm text-white/70" aria-live="polite">
        {rows.length > 0 ? `${rows.length} recording${rows.length===1?'':'s'}` : 'No recordings available'}
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_24px_70px_rgba(5,8,20,0.45)] backdrop-blur">
        <table className="w-full text-sm text-white/80">
          <caption className="sr-only">Recordings list</caption>
          <thead className="bg-white/10 text-left text-white/60">
            <tr>
              <th className="px-5 py-3">Started</th>
              <th className="px-5 py-3">Duration</th>
              <th className="px-5 py-3">Summary</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-t border-white/10 transition hover:bg-white/10">
                <td className="whitespace-nowrap px-5 py-3">{new Date(r.startedAt).toLocaleString()}</td>
                <td className="px-5 py-3">{Math.floor(r.durationSec/60)}m {r.durationSec%60}s</td>
                <td className="px-5 py-3 text-white/80">{r.summary}</td>
                <td className="px-5 py-3 text-right">
                  <a
                    className="inline-flex rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition hover:text-white"
                    href={`/dashboard/calls/${encodeURIComponent(r.id)}`}
                  >
                    View
                  </a>
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-white/70">
                  No recordings yet. After your first calls complete, recordings will appear here.
                  <div className="mt-3 text-xs text-white/50">
                    Need help? Visit <a href="/docs" className="underline">Docs</a> or <a href="/support" className="underline">Support</a>.
                  </div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  )
}
