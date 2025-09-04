export default function PrivacyPage() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white px-6 py-16">
      <section className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="mt-4 text-white/70">
          We take privacy seriously. This page outlines what we collect and how we use it.
        </p>

        <h2 className="mt-10 text-xl font-medium">Data we collect</h2>
        <ul className="mt-3 list-disc pl-5 text-white/80 space-y-1">
          <li>Account info: name, email, and organization.</li>
          <li>Operational logs for call handling (timestamps, routing outcomes).</li>
          <li>Billing and usage metrics.</li>
        </ul>

        <h2 className="mt-10 text-xl font-medium">How we use data</h2>
        <ul className="mt-3 list-disc pl-5 text-white/80 space-y-1">
          <li>To run the service, troubleshoot, and improve reliability.</li>
          <li>To provide analytics and audit trails for your account.</li>
          <li>To process payments and prevent abuse.</li>
        </ul>

        <h2 className="mt-10 text-xl font-medium">Your choices</h2>
        <p className="mt-3 text-white/70">
          You can request data export or deletion by emailing <a className="underline" href="mailto:privacy@earlybird.ai">privacy@earlybird.ai</a>.
        </p>

        <h2 className="mt-10 text-xl font-medium">Contact</h2>
        <p className="mt-3 text-white/70">Email: privacy@earlybird.ai</p>
      </section>
    </main>
  );
}
