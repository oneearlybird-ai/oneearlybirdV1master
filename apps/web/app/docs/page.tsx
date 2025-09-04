export default function Docs() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="text-3xl font-semibold tracking-tight">Documentation</h1>
      <p className="mt-4 text-white/70">
        Welcome to the EarlyBird docs. Here you’ll find guides and references to get started quickly.
      </p>
      <ul className="mt-6 space-y-3 text-white/80 list-disc pl-5">
        <li>Setup your account</li>
        <li>Integrate your calendar</li>
        <li>Connect telephony (Twilio, Plivo, Vonage)</li>
        <li>Configure FAQs and call routing</li>
      </ul>
    </main>
  );
}
