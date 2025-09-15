export default function SettingsPage() {
  return (
    <section>
      <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
      <div className="mt-6 grid gap-4 grid-cols-[repeat(auto-fit,minmax(280px,1fr))]">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="font-medium">Business profile</div>
          <div className="mt-3 space-y-2 text-sm">
            <label className="block">Company name<input className="mt-1 w-full bg-white/5 border border-white/10 rounded-md px-3 py-2" placeholder="Acme Dental"/></label>
            <label className="block">Time zone<input className="mt-1 w-full bg-white/5 border border-white/10 rounded-md px-3 py-2" placeholder="America/Los_Angeles"/></label>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="font-medium">Hours & routing</div>
          <div className="mt-3 text-sm text-white/80">Define business hours and after‑hours routing.</div>
          <div className="mt-3 flex gap-3"><button className="rounded-md border border-white/20 px-3 py-1.5 text-sm text-white/80 hover:text-white">Edit hours</button></div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="font-medium">AI Assistant greeting</div>
          <div className="mt-3 text-sm">Greeting script</div>
          <textarea className="mt-1 w-full h-24 bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm" placeholder="Thanks for calling Acme Dental — how can I help today?" />
          <div className="mt-3 text-sm">FAQs CSV (optional)</div>
          <div className="mt-1"><button className="rounded-md border border-white/20 px-3 py-1.5 text-sm text-white/80 hover:text-white">Upload file</button></div>
        </div>
      </div>
      <div className="mt-6 flex gap-3">
        <button className="rounded-md bg-white text-black px-4 py-2 text-sm font-medium hover:bg-white/90">Save changes</button>
        <button className="rounded-md border border-white/20 px-4 py-2 text-sm text-white/80 hover:text-white">Cancel</button>
      </div>
    </section>
  );
}

