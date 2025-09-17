export const dynamic = 'force-static';

import PortingFormClient from "./PortingFormClient";
function MailtoButton() {
  const subject = encodeURIComponent('Port my number to EarlyBird');
  const href = `mailto:support@earlybird.ai?subject=${subject}`;
  return (
    <a
      href={href}
      className="inline-flex items-center rounded-xl bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90"
    >
      Start porting via email
    </a>
  );
}

export default function PortingPage() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white px-6 py-16">
      <section className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Port your phone number</h1>
        <p className="mt-4 text-white/70">
          Bring your existing number to EarlyBird. We operate managed telephony and route calls to your AI receptionist.
          Billing is all-in-one via Stripe; no separate carrier account required.
        </p>

        <h2 className="mt-10 text-xl font-medium">What we need</h2>
        <ul className="mt-3 list-disc pl-5 text-white/80 space-y-2">
          <li>Company/Organization name and primary contact (name, email, phone)</li>
          <li>Number(s) to port (local or toll‑free), each with current carrier</li>
          <li>Account number and Port‑out PIN/Passcode (if applicable)</li>
          <li>Service address for LOA (letter of authorization) and E911 address per number</li>
          <li>Preferred CNAM display (outbound caller ID name), if applicable</li>
          <li>SMS/MMS enablement needs (optional)</li>
          <li>Desired port date/time window and timezone</li>
        </ul>

        <div className="mt-6">
          <MailtoButton />
          <a href="/support" className="ml-3 inline-flex items-center rounded-xl border border-white/20 px-4 py-2 text-sm text-white/80 hover:text-white">Back to Support</a>
        </div>

        <h2 className="mt-10 text-xl font-medium">Notes</h2>
        <ul className="mt-3 list-disc pl-5 text-white/70 space-y-2">
          <li>Typical local porting completes in 2–10 business days; toll‑free may vary.</li>
          <li>We coordinate to avoid downtime. Keep your current service active until the port is confirmed.</li>
          <li>We’ll provide a pre‑filled LOA for e‑signature and keep you updated on status (FOC date/time).</li>
        </ul>

        <PortingFormClient />
      </section>
    </main>
  );
}
