export const dynamic = "force-dynamic";
import CallsTableClient from "./CallsTableClient";

type ApiCall = {
  id: string;
  startedAt: string;
  callerMasked: string;
  outcome: "booked" | "qualified" | "voicemail" | "missed";
  sentiment: "pos" | "neu" | "neg";
  durationSec: number;
  costCents: number;
};

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

      <CallsTableClient rows={rows} />
    </section>
  );
}
