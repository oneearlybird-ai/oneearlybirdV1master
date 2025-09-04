export default function PrivacyPage() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="mt-4 text-white/70">
          Your privacy is important to us. This policy explains how EarlyBird collects,
          uses, and protects your data.
        </p>

        <div className="mt-12 space-y-8">
          <div>
            <h2 className="text-xl font-medium">Information We Collect</h2>
            <p className="mt-2 text-white/70">
              We collect basic account details, call transcripts, and usage analytics
              to provide and improve our services.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium">How We Use Data</h2>
            <p className="mt-2 text-white/70">
              Data is used to operate the EarlyBird platform, provide customer support,
              and deliver insights into performance.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium">Your Rights</h2>
            <p className="mt-2 text-white/70">
              You may request access, corrections, or deletion of your data at any time
              by contacting{" "}
              <a href="mailto:privacy@earlybird.ai" className="underline hover:text-white">
                privacy@earlybird.ai
              </a>.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
