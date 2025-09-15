export default function AppointmentsPage() {
  const items = [
    { id: 'a1', when: 'Tue, Sep 16 — 2:00 PM', who: 'Alex R. (415) 555‑0198', note: 'Consultation — booked by AI' },
    { id: 'a2', when: 'Wed, Sep 17 — 9:30 AM', who: 'Mia L. (347) 555‑0101', note: 'Follow-up — confirmed' },
  ];
  const connected = true; // Preview state
  return (
    <section>
      <h1 className="text-xl font-semibold tracking-tight">Appointments</h1>
      {!connected ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="font-medium">Connect your calendar</div>
          <p className="mt-1 text-sm text-white/70">Connect Google or Outlook to enable AI scheduling.</p>
          <div className="mt-3 flex gap-3">
            <a href="/dashboard-preview/integrations" className="rounded-xl bg-white px-4 py-2 text-black text-sm font-medium hover:bg-white/90">Open Integrations</a>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5">
          <div className="flex items-center justify-between p-4">
            <h2 className="font-medium">Upcoming</h2>
          </div>
          <div className="px-4 pb-4">
            {items.map(it => (
              <div key={it.id} className="border-b border-white/10 py-3">
                <div className="text-white/90">{it.when}</div>
                <div className="text-sm text-white/70">{it.who}</div>
                <div className="text-xs text-white/60">{it.note}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

