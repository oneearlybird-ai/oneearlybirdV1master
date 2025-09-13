export const dynamic = "force-dynamic";

async function getItem(id: string) {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL || ''
    const res = await fetch(`${base}/api/recordings/item?id=${encodeURIComponent(id)}`, { cache: 'no-store' })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export default async function CallDetail({ params }: { params: { id: string } }) {
  const data = await getItem(params.id)
  const started = data?.startedAt ? new Date(data.startedAt).toLocaleString() : '—'
  const dur = typeof data?.durationSec === 'number' ? `${Math.floor(data.durationSec/60)}m ${data.durationSec%60}s` : '—'

  return (
    <section>
      <h2 className="text-xl font-semibold tracking-tight mb-2">Call detail</h2>
      <div className="text-white/70 text-sm mb-4">ID: {params.id} · Started: {started} · Duration: {dur}</div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="font-medium">Recording</div>
        {data?.audioUrl ? (
          <audio className="mt-2 w-full" controls src={data.audioUrl} />
        ) : (
          <div className="mt-2 text-xs text-white/60">Audio not available in preview.</div>
        )}
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="font-medium mb-2">Transcript (masked)</div>
        <pre className="whitespace-pre-wrap text-sm text-white/80">{data?.transcript || '—'}</pre>
        <div className="mt-2 text-[11px] text-white/50">PII is masked (emails, phone numbers). No PHI stored or shown here.</div>
      </div>
    </section>
  )
}

