export const dynamic = "force-dynamic";

type CallRow = {
  id: string;
  time: string;
  caller: string;
  outcome: "booked" | "qualified" | "voicemail" | "missed";
  sentiment: "pos" | "neu" | "neg";
  duration: string;
  cost: string;
};

const SAMPLE: CallRow[] = [
  { id: "c_1001", time: "Today 10:14", caller: "+1 (415) •••• 2214", outcome: "booked", sentiment: "pos", duration: "03:12", cost: "$0.42" },
  { id: "c_1000", time: "Today 09:58", caller: "+1 (510) •••• 8821", outcome: "qualified", sentiment: "neu", duration: "02:06", cost: "$0.31" },
  { id: "c_0999", time: "Yesterday 17:41", caller: "+1 (212) •••• 4470", outcome: "voicemail", sentiment: "neg", duration: "00:18", cost: "$0.03" },
];

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
  const rows = SAMPLE; // TODO: replace with server fetch when backend endpoint is ready
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
                <td className="px-4 py-3 whitespace-nowrap">{r.time}</td>
                <td className="px-4 py-3">{r.caller}</td>
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
                <td className="px-4 py-3">{r.duration}</td>
                <td className="px-4 py-3">{r.cost}</td>
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

