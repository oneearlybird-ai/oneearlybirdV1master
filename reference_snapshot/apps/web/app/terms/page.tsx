export default function TermsPage() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white px-6 py-16">
      <section className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Terms of Service</h1>
        <p className="mt-4 text-white/70">
          By using EarlyBird, you agree to these terms.
        </p>

        <h2 className="mt-10 text-xl font-medium">Use of service</h2>
        <ul className="mt-3 list-disc pl-5 text-white/80 space-y-1">
          <li>No unlawful, harmful, or abusive use.</li>
          <li>Respect applicable call-recording consent laws.</li>
        </ul>

        <h2 className="mt-10 text-xl font-medium">Billing</h2>
        <p className="mt-3 text-white/70">
          Usage-based fees are billed monthly via Stripe. Taxes may apply.
        </p>

        <h2 className="mt-10 text-xl font-medium">Disclaimers</h2>
        <p className="mt-3 text-white/70">
          Service is provided “as is” without warranties. We limit liability to fees paid in the last 3 months.
        </p>

        <h2 className="mt-10 text-xl font-medium">Contact</h2>
        <p className="mt-3 text-white/70">Email: legal@earlybird.ai</p>
      </section>
    </main>
  );
}
