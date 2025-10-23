export const dynamic = "force-static";

import Link from "next/link";
import Section from "@/components/marketing/Section";
import ForwardingFormClient from "./ForwardingFormClient";

export const metadata = {
  title: "Forward calls to EarlyBird",
  description: "Keep your existing phone numbers. Forward them to EarlyBird in minutes and let the AI receptionist handle every call.",
};

const steps = [
  {
    title: "Create your workspace",
    description:
      "Sign up with your business email, invite teammates, and generate your EarlyBird connect number from the dashboard.",
  },
  {
    title: "Add billing & verify",
    description:
      "Activate your plan inside Settings → Billing. We place a short verification call to confirm the forwarding destination is live.",
  },
  {
    title: "Toggle forwarding",
    description:
      "Log in to your carrier (or dial *72) and point your main line at the EarlyBird connect number you just verified.",
  },
  {
    title: "Test & go live",
    description:
      "Place a test call, then flip the dashboard toggle so EarlyBird answers every caller.",
  },
];

const requirements = [
  "Existing business number(s) your customers already call.",
  "Carrier portal access or forwarding codes (*72 / *73).",
  "EarlyBird connect number from Dashboard → Numbers → Forwarding.",
  "Five minutes to verify and test the updated routing.",
];

const resources = [
  {
    title: "Where to change forwarding",
    entries: [
      "Wireless carriers (AT&T, Verizon, T-Mobile): Features → Call Forwarding → EarlyBird connect number.",
      "VoIP systems (RingCentral, Zoom Phone, Grasshopper): update the main call handling rule to forward to EarlyBird.",
      "Desk phones / PBX: dial *72 + EarlyBird connect number, or ask your carrier to apply permanent forwarding.",
    ],
  },
];

export default function ForwardingPage() {
  return (
    <div className="flex flex-col">
      <section className="px-5 pt-20 pb-12 sm:px-6 md:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="stellar-pill">Number forwarding</span>
          <h1 className="mt-6 text-4xl font-semibold text-white md:text-5xl">Keep your numbers. Route every call to EarlyBird.</h1>
          <p className="mt-6 text-base text-white/70 md:text-lg">
            Instead of porting, we simply forward your lines. You stay in control of the carrier, and callers land with EarlyBird instantly.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/signup"
              className="inline-flex items-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              Create your account
            </a>
            <Link
              href="/support"
              className="inline-flex items-center rounded-2xl border border-white/20 px-5 py-3 text-sm font-semibold text-white/80 transition hover:text-white"
            >
              Talk with support
            </Link>
          </div>
        </div>
      </section>

      <Section eyebrow="Forwarding playbook" title="Turn it on in four quick steps" className="pt-0">
        <div className="flex flex-col gap-4">
          {steps.map((step, index) => (
            <article key={step.title} className="rounded-3xl border border-white/12 bg-white/5 p-5">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-sm font-semibold text-white/80">
                  {(index + 1).toString().padStart(2, "0")}
                </span>
                <h3 className="text-base font-semibold text-white">{step.title}</h3>
              </div>
              <p className="mt-2 text-sm text-white/75">{step.description}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section eyebrow="What to gather" title="Forwarding checklist" className="pt-0">
        <div className="stellar-grid-card bg-white/5">
          <ul className="list-disc space-y-2 pl-5 text-sm text-white/80">
            {requirements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </Section>

      <Section eyebrow="Quick reference" title="Provider tips" className="pt-0">
        <div className="stellar-grid-card bg-white/5">
          <ul className="space-y-2 text-sm text-white/75">
            {resources[0].entries.map((entry) => (
              <li key={entry} className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-purple-400/70" />
                <span>{entry}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section
        eyebrow="Need a hand?"
        title="We’ll configure it with you"
        description="Share the basics and we’ll schedule a quick session to confirm forwarding and test live calls."
        className="pt-0"
      >
        <div className="rounded-3xl border border-white/12 bg-white/5 p-6 md:p-8">
          <ForwardingFormClient />
        </div>
      </Section>
    </div>
  );
}
