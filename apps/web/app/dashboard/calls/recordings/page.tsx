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
    <section>
      <h2 className="text-xl font-semibold tracking-tight mb-2">Recordings</h2>
      <div className="text-sm text-white/60" aria-live="polite">
        {rows.length > 0 ? `${rows.length} recording${rows.length===1?'':'s'}` : 'No recordings available'}
      </div>

      <div className="mt-3 overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
        <table className="w-full text-sm">
          <caption className="sr-only">Recordings list</caption>
          <thead className="text-left text-white/60">
            <tr>
              <th className="px-4 py-3">Started</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Summary</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-t border-white/10">
                <td className="px-4 py-3 whitespace-nowrap">{new Date(r.startedAt).toLocaleString()}</td>
                <td className="px-4 py-3">{Math.floor(r.durationSec/60)}m {r.durationSec%60}s</td>
                <td className="px-4 py-3 text-white/80">{r.summary}</td>
                <td className="px-4 py-3">
                  <Link className="rounded-lg border border-white/20 px-3 py-1 hover:-translate-y-0.5 motion-safe:transition-transform" href={`/dashboard/calls/${encodeURIComponent(r.id)}`}>View</Link>
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-white/60">
                  No recordings yet. After your first calls complete, recordings will appear here.
                  <div className="mt-3 text-xs">
                    Need help? Visit <Link href="/docs" className="underline">Docs</Link> or <Link href="/support" className="underline">Support</Link>.
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
import Link from 'next/link'
