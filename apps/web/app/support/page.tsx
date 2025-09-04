export default function SupportPage() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight">Support</h1>
        <p className="mt-4 text-white/70">
          Need help with EarlyBird? Reach out and we’ll get you back on track.
        </p>

        <div className="mt-12 space-y-8">
          <div>
            <h2 className="text-xl font-medium">Email Support</h2>
            <p className="mt-2 text-white/70">
              Send us your questions at{" "}
              <a href="mailto:support@earlybird.ai" className="underline hover:text-white">
                support@earlybird.ai
              </a>
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium">Documentation</h2>
            <p className="mt-2 text-white/70">
              Visit our <a href="/docs" className="underline hover:text-white">Docs</a> for setup guides and FAQs.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium">System Status</h2>
            <p className="mt-2 text-white/70">
              Check real-time uptime and incident reports at{" "}
              <a href="https://status.earlybird.ai" className="underline hover:text-white" target="_blank">
                status.earlybird.ai
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
