export default function ChangelogPage() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight">Changelog</h1>
        <p className="mt-4 text-white/70">
          Stay up to date with the latest improvements and fixes.
        </p>

        <div className="mt-12 space-y-10">
          <div>
            <h2 className="text-xl font-medium">v1.0.1 — Initial Release</h2>
            <p className="text-white/70 mt-2">
              EarlyBird launched with landing, pricing, signup, login, docs, support, privacy, and terms pages.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-medium">Upcoming</h2>
            <p className="text-white/70 mt-2">
              AI receptionist integrations with Twilio/Plivo, Google Calendar sync, billing dashboard, and analytics.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
