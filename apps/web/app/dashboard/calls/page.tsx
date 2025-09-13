export const dynamic = "force-dynamic";

type ApiCall = {
  id: string;
  startedAt: string;
  callerMasked: string;
  outcome: "booked" | "qualified" | "voicemail" | "missed";
  sentiment: "pos" | "neu" | "neg";
  durationSec: number;
  costCents: number;
};

function Badge({ children, tone = "default" as const }: { children: React.ReactNode; tone?: "default" | "success" | "warn" | "danger" }) {
  const tones: Record<string, string> = {
    default: "bg-white/10 text-white/80",
    success: "bg-green-600/15 text-green-400",
    warn: "bg-amber-600/15 text-amber-300",
    danger: "bg-red-600/15 text-red-300",
  };
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${tones[tone]}`}>{children}</span>;
}

export default async function CallsPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/calls/list`, { cache: 'no-store' }).catch(() => null);
  const data = res && res.ok ? await res.json() : { rows: [] };
  const rows: ApiCall[] = Array.isArray(data?.rows) ? data.rows : [];
  return (
    <section>
      <h2 className="text-xl font-semibold tracking-tight mb-4">Calls</h2>
      <div className="mb-3 grid gap-3 md:grid-cols-3">
        <input
          aria-label="Search calls"
          placeholder="Search caller, outcome, sentiment"
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder-white/40 outline-none focus:border-white/20"
        />
        <select aria-label="Filter status" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm">
          <option value="">All outcomes</option>
          <option>Booked</option>
          <option>Qualified</option>
          <option>Voicemail</option>
          <option>Missed</option>
        </select>
        <select aria-label="Filter sentiment" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm">
          <option value="">All sentiment</option>
          <option>Positive</option>
          <option>Neutral</option>
          <option>Negative</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
        <table className="w-full text-sm">
          <thead className="text-left text-white/60">
            <tr>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Caller</th>
              <th className="px-4 py-3">Outcome</th>
              <th className="px-4 py-3">Sentiment</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Cost</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-white/10">
                <td className="px-4 py-3 whitespace-nowrap">{new Date(r.startedAt).toLocaleString()}</td>
                <td className="px-4 py-3">{r.callerMasked}</td>
                <td className="px-4 py-3">
                  {r.outcome === "booked" ? (
                    <Badge tone="success">Booked</Badge>
                  ) : r.outcome === "qualified" ? (
                    <Badge>Qualified</Badge>
                  ) : r.outcome === "voicemail" ? (
                    <Badge tone="warn">Voicemail</Badge>
                  ) : (
                    <Badge tone="danger">Missed</Badge>
                  )}
                </td>
                <td className="px-4 py-3">
                  {r.sentiment === "pos" ? <Badge tone="success">Positive</Badge> : r.sentiment === "neg" ? <Badge tone="danger">Negative</Badge> : <Badge>Neutral</Badge>}
                </td>
                <td className="px-4 py-3">{String(Math.floor(r.durationSec/60)).padStart(2,'0')}:{String(r.durationSec%60).padStart(2,'0')}</td>
                <td className="px-4 py-3">${(r.costCents/100).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <a className="rounded-lg border border-white/20 px-3 py-1 hover:-translate-y-0.5 motion-safe:transition-transform" href={`#`}>View</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-white/50">Transcript and recording viewer will open in a drawer; wiring pending backend endpoints. PHI-zero here.</p>
    </section>
  );
}
