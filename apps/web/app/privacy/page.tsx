export default function PrivacyPage() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white px-6 py-16">
      <section className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="mt-4 text-white/70">
          At EarlyBird, we value your privacy. This page outlines how we handle your data.
        </p>

        <div className="mt-8 space-y-6 text-white/70">
          <div>
            <h2 className="text-xl font-medium text-white">Information We Collect</h2>
            <p>
              We collect account details, usage data, and communication records for service delivery.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium text-white">How We Use Information</h2>
            <p>
              Data is used to provide AI receptionist services, improve reliability, and comply with legal requirements.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium text-white">Your Rights</h2>
            <p>
              You can request data export, correction, or deletion anytime by contacting{" "}
              <a href="mailto:privacy@earlybird.ai" className="underline hover:text-white">
                privacy@earlybird.ai
              </a>.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
