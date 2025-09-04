export default function SupportPage() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white px-6 py-16">
      <section className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Support</h1>
        <p className="mt-4 text-white/70">
          Need help with EarlyBird? We’re here to assist you.
        </p>

        <div className="mt-8 space-y-6">
          <div>
            <h2 className="text-xl font-medium">Documentation</h2>
            <p className="text-white/60">
              Visit our <a href="/docs" className="underline hover:text-white">Docs</a> for setup guides and FAQs.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium">Sales</h2>
            <p className="text-white/60">
              For pricing and enterprise needs, reach out at{" "}
              <a href="mailto:sales@earlybird.ai" className="underline hover:text-white">
                sales@earlybird.ai
              </a>.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium">Technical Support</h2>
            <p className="text-white/60">
              Having issues? Email{" "}
              <a href="mailto:support@earlybird.ai" className="underline hover:text-white">
                support@earlybird.ai
              </a>.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
