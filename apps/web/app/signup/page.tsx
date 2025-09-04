export default function Signup() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white">
      <section className="mx-auto max-w-xl px-6 py-24">
        <h1 className="text-3xl font-semibold tracking-tight">Create your EarlyBird account</h1>
        <p className="mt-4 text-white/70">Email/password, Google OAuth, or magic link — wired in next steps.</p>
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-white/70 text-sm">
            Placeholder signup screen. In production this connects to the real auth + Stripe billing flow.
          </p>
        </div>
      </section>
    </main>
  );
}
