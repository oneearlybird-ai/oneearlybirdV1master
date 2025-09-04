export default function TermsPage() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-white/70">
          Please read these Terms of Service ("Terms") carefully before using
          EarlyBird. By accessing or using our services, you agree to be bound
          by these Terms.
        </p>

        <div className="mt-10 space-y-8">
          <div>
            <h2 className="text-xl font-medium">Use of Service</h2>
            <p className="mt-2 text-white/70">
              You may use EarlyBird only in compliance with these Terms and all
              applicable laws. Misuse or unauthorized access is prohibited.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium">Accounts</h2>
            <p className="mt-2 text-white/70">
              When you create an account, you must provide accurate information
              and safeguard your login credentials. You are responsible for all
              activity under your account.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium">Termination</h2>
            <p className="mt-2 text-white/70">
              We may suspend or terminate access if you violate these Terms or
              engage in harmful behavior. You may also stop using EarlyBird at
              any time.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium">Contact Us</h2>
            <p className="mt-2 text-white/70">
              For questions about these Terms, please contact us at
              support@earlybird.ai.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
