export default function TermsPage() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white px-6 py-16">
      <section className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Terms of Service</h1>
        <p className="mt-4 text-white/70">
          By using EarlyBird services, you agree to the following terms.
        </p>

        <div className="mt-8 space-y-6 text-white/70">
          <div>
            <h2 className="text-xl font-medium text-white">Use of Service</h2>
            <p>
              You are granted a limited, non-transferable license to use EarlyBird for business
              telephony automation in compliance with applicable law.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium text-white">Accounts & Access</h2>
            <p>
              You are responsible for safeguarding login credentials and activity under your account.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium text-white">Limitations</h2>
            <p>
              EarlyBird is provided “as is”. We are not liable for outages, indirect damages,
              or losses arising from use.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium text-white">Termination</h2>
            <p>
              Accounts may be suspended or terminated for violation of these terms or abuse of service.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
