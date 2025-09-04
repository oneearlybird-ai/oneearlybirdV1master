export default function TermsPage() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight">Terms of Service</h1>
        <p className="mt-4 text-white/70">
          Please read these Terms of Service carefully before using EarlyBird.
        </p>

        <div className="mt-12 space-y-8">
          <div>
            <h2 className="text-xl font-medium">Acceptance of Terms</h2>
            <p className="mt-2 text-white/70">
              By accessing or using EarlyBird, you agree to be bound by these Terms.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium">Use of Service</h2>
            <p className="mt-2 text-white/70">
              You agree to use EarlyBird in compliance with all applicable laws and
              not for any unlawful purpose.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium">Limitation of Liability</h2>
            <p className="mt-2 text-white/70">
              EarlyBird shall not be held liable for any damages resulting from the
              use or inability to use the service.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
