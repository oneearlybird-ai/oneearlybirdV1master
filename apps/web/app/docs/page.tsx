export const dynamic = 'force-static';

export default function Docs() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white">
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">EarlyBird Docs</h1>
        <p className="mt-4 max-w-2xl text-white/70">
          Set up your AI voice receptionist: connect telephony, configure rules, and go live.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <a href="#getting-started" className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10">
            <div className="text-lg font-medium">Getting Started</div>
            <p className="mt-2 text-sm text-white/70">Project structure, environments, and first run.</p>
          </a>
          <a href="#telephony" className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10">
            <div className="text-lg font-medium">Telephony</div>
            <p className="mt-2 text-sm text-white/70">Connect Twilio/Plivo/Vonage, SIP, and routing.</p>
          </a>
          <a href="#scheduling" className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10">
            <div className="text-lg font-medium">Scheduling</div>
            <p className="mt-2 text-sm text-white/70">Google/Microsoft Calendar integrations.</p>
          </a>
          <a href="#security" className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10">
            <div className="text-lg font-medium">Security</div>
            <p className="mt-2 text-sm text-white/70">Privacy, consent/recording, and compliance posture.</p>
          </a>
        </div>

        <div id="getting-started" className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight">Getting Started</h2>
          <ol className="mt-4 list-decimal pl-6 text-white/80 space-y-2">
            <li>Sign up at <span className="text-white">/signup</span> and log in at <span className="text-white">/login</span>.</li>
            <li>Open <span className="text-white">/pricing</span> to choose a plan (or start free).</li>
            <li>Follow Telephony setup to connect your phone number.</li>
          </ol>
        </div>

        <div id="telephony" className="mt-12">
          <h2 className="text-2xl font-semibold tracking-tight">Telephony</h2>
          <p className="mt-3 text-white/80">
            Point your provider webhook/SIP to EarlyBird. Configure routing rules for hours, overflow, and transfers.
          </p>
        </div>

        <div id="scheduling" className="mt-12">
          <h2 className="text-2xl font-semibold tracking-tight">Scheduling</h2>
          <p className="mt-3 text-white/80">
            Connect calendars to enable booking, rescheduling, and reminders.
          </p>
        </div>

        <div id="security" className="mt-12">
          <h2 className="text-2xl font-semibold tracking-tight">Security</h2>
          <p className="mt-3 text-white/80">
            Encryption in transit/at rest, least-privilege access, and audit logging. Configurable consent & recording.
          </p>
        </div>
      </section>
    </main>
  );
}
