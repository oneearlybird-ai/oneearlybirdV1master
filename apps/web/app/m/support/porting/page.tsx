export const dynamic = "force-static";

import Link from "next/link";
import Section from "@/components/stellar/Section";
import PortingFormClient from "./PortingFormClient";

export const metadata = {
  title: "Port your numbers to EarlyBird",
  description: "Start a managed porting request. We coordinate with your carrier and keep you updated at every step.",
};

const requirements = [
  "Organization name and primary contact (name, email, phone).",
  "Numbers to port (local or toll-free) with current carrier information.",
  "Account number, port-out PIN/passcode, and service address for LOA.",
  "Preferred caller ID name (CNAM) and whether SMS/MMS should stay enabled.",
  "Desired port window and timezone — we’ll coordinate to avoid downtime.",
];

const notes = [
  "Local ports typically complete within 2–10 business days; toll-free can vary by carrier.",
  "Keep your existing service active until we confirm the firm order commit (FOC) date.",
  "We provide a pre-filled LOA for e-signature and send status updates at each milestone.",
];

export default function PortingPage() {
  return (
    <div className="flex flex-col">
      <section className="px-5 pt-20 pb-12 sm:px-6 md:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="stellar-pill">Number porting</span>
          <h1 className="mt-6 text-4xl font-semibold text-white md:text-5xl">Bring your existing phone numbers to EarlyBird.</h1>
          <p className="mt-6 text-base text-white/70 md:text-lg">
            We operate managed telephony and route calls directly to your AI receptionist. Billing stays on a single Stripe invoice — no separate
            carrier to manage.
          </p>
        </div>
      </section>

      <Section className="pt-0">
        <div className="mx-auto flex max-w-3xl flex-col gap-8">
          <article className="stellar-grid-card bg-white/5">
            <h2 className="text-xl font-semibold text-white">What we need</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-white/80">
              {requirements.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="mailto:support@earlybird.ai?subject=Port%20my%20number%20to%20EarlyBird"
                className="inline-flex items-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                Start via email
              </a>
              <Link
                href="/support"
                className="inline-flex items-center rounded-2xl border border-white/20 px-5 py-3 text-sm font-semibold text-white/80 transition hover:text-white"
              >
                Back to Support
              </Link>
            </div>
          </article>

          <article className="stellar-grid-card bg-white/5">
            <h2 className="text-xl font-semibold text-white">Notes</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-white/80">
              {notes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="rounded-3xl border border-white/12 bg-white/5 p-6 md:p-8">
            <PortingFormClient />
          </article>
        </div>
      </Section>
    </div>
  );
}
