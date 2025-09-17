export default function SupportPage() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white px-6 py-16">
      <section className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Support</h1>
        <p className="mt-4 text-white/70">
          Need help with EarlyBird? We’re here for you.
        </p>

        <h2 className="mt-10 text-xl font-medium">Contact us</h2>
        <ul className="mt-4 space-y-2 text-white/80">
          <li>Email: <a href="mailto:support@earlybird.ai" className="underline">support@earlybird.ai</a></li>
          <li>Docs: <a href="/docs" className="underline">Developer documentation</a></li>
        </ul>

        <h2 className="mt-10 text-xl font-medium">Email templates</h2>
        <ul className="mt-3 list-disc pl-5 text-white/80 space-y-1">
          <li>
            <a
              className="underline"
              href="mailto:support@earlybird.ai?subject=Support%20request&body=Describe%20the%20issue%20you%E2%80%99re%20seeing%3A%0A%0AExpected%20result%3A%0AActual%20result%3A%0A%0AOrg%20name%3A%0APhone%20number%20(porting%20only)%3A%0A"
            >
              General support request (prefilled email)
            </a>
          </li>
        </ul>

        <h2 id="telephony" className="mt-10 text-xl font-medium">Telephony</h2>
        <p className="mt-3 text-white/70">We provide managed telephony. No separate carrier account is needed.</p>
        <ul className="mt-3 list-disc pl-5 text-white/80 space-y-1">
          <li>Request new numbers or port existing ones — <a className="underline" href="/support/porting">start here</a>.</li>
          <li>All telephony charges are included on your single Stripe invoice.</li>
        </ul>

        <h2 id="porting-status" className="mt-10 text-xl font-medium">Porting status</h2>
        <p className="mt-3 text-white/70">
          After you start a port request, we’ll confirm receipt and share an estimated FOC (firm order commit) date/time.
          You’ll receive email updates at each step. Keep your current service active until the port completes.
        </p>

        <h2 className="mt-10 text-xl font-medium">FAQ</h2>
        <p className="mt-3 text-white/70">
          Common issues and how to fix them are available in our Docs.
          If you can’t find what you’re looking for, please reach out.
        </p>
      </section>
    </main>
  );
}
