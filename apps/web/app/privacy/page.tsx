export default function PrivacyPage() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-white/70">
          Your privacy is important to us. This policy explains how EarlyBird
          collects, uses, and safeguards your information.
        </p>

        <div className="mt-10 space-y-8">
          <div>
            <h2 className="text-xl font-medium">Information We Collect</h2>
            <p className="mt-2 text-white/70">
              We collect personal information you provide such as name, email,
              and account details, along with usage data for analytics.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium">How We Use Information</h2>
            <p className="mt-2 text-white/70">
              Information is used to provide and improve the service, process
              transactions, communicate with you, and ensure security.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium">Data Security</h2>
            <p className="mt-2 text-white/70">
              We apply industry-standard measures to protect your data from
              unauthorized access, disclosure, alteration, or destruction.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium">Contact Us</h2>
            <p className="mt-2 text-white/70">
              If you have questions about this policy, please reach out at
              privacy@earlybird.ai.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
