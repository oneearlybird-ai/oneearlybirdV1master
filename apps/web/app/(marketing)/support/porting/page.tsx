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
      "Activate your plan inside Settings → Billing. We send a short verification call to confirm the forwarding destination is live.",
  },
  {
    title: "Toggle forwarding",
    description:
      "Log in to your carrier (or dial their *72 forwarding code) and point your main line at the EarlyBird connect number you just verified.",
  },
  {
    title: "Test & go live",
    description:
      "Place a test call to confirm routing, then flip the dashboard toggle to announce EarlyBird as your receptionist. We keep monitoring call quality.",
  },
];

const requirements = [
  "Your existing business number(s) that customers already call.",
  "Access to the carrier portal or forwarding codes (*72 / *73 for most providers).",
  "The EarlyBird connect number shown in Dashboard → Numbers → Forwarding.",
  "5 minutes to place a verification call and update voicemail greetings if needed.",
];

const resources = [
  {
    title: "Wireless & VoIP carriers",
    entries: [
      "AT&T, Verizon, T-Mobile, Spectrum: log in → Features → Call Forwarding → enter EarlyBird connect number → save.",
      "Grasshopper, RingCentral, Zoom Phone: update the primary call handling rule to forward to the EarlyBird connect number.",
      "Legacy PBXs: dial *72 + EarlyBird connect number from the desk phone, or ask the carrier to apply permanent forwarding.",
    ],
  },
  {
    title: "Need hands-on help?",
    entries: [
      "We’ll hop on a quick screen share to walk through the carrier portal.",
      "If your carrier requires a letter, we’ll draft it and email it on your behalf.",
      "Forwarded calls continue to show your caller ID and record in EarlyBird analytics.",
    ],
  },
];

export default function ForwardingPage() {
  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden px-5 pt-20 pb-12 sm:px-6 md:pt-28">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/5 via-transparent to-transparent" aria-hidden="true" />
        <div className="mx-auto max-w-3xl text-center">
          <span className="stellar-pill">Number forwarding</span>
          <h1 className="mt-6 text-4xl font-semibold text-white md:text-5xl">Keep your numbers. Route every call to EarlyBird.</h1>
          <p className="mt-6 text-base text-white/70 md:text-lg">
            Instead of porting, we use carrier forwarding. You stay in control of your lines, and callers reach EarlyBird instantly without downtime.
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

      <Section eyebrow="Forwarding playbook" title="Enable EarlyBird in four quick steps">
        <div className="grid gap-6 md:grid-cols-2">
          {steps.map((step, index) => (
            <article
              key={step.title}
              data-aos="fade-up"
              data-aos-delay={index * 80}
              className="relative overflow-hidden rounded-3xl border border-white/12 bg-white/5 p-6 shadow-[0_24px_70px_rgba(9,9,22,0.35)] transition hover:border-white/20 hover:bg-white/8"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-sm font-semibold text-white/80">
                  {(index + 1).toString().padStart(2, "0")}
                </span>
                <h3 className="text-lg font-semibold text-white">{step.title}</h3>
              </div>
              <p className="mt-3 text-sm text-white/75">{step.description}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section eyebrow="What to gather" title="Forwarding checklist">
        <div className="stellar-grid-card bg-white/5">
          <ul className="list-disc space-y-2 pl-5 text-sm text-white/80">
            {requirements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </Section>

      <Section eyebrow="Provider notes" title="Where to toggle forwarding" className="pt-0">
        <div className="grid gap-6 md:grid-cols-2">
          {resources.map((resource) => (
            <article key={resource.title} className="stellar-grid-card bg-white/5">
              <h3 className="text-lg font-semibold text-white">{resource.title}</h3>
              <ul className="mt-3 space-y-2 text-sm text-white/75">
                {resource.entries.map((entry) => (
                  <li key={entry} className="flex gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-purple-400/70" />
                    <span>{entry}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Need a hand?"
        title="We’ll configure it with you"
        description="Share the details and we’ll schedule a quick session to turn on forwarding, test routing, and confirm SMS behavior."
        className="pt-0"
      >
        <div className="rounded-3xl border border-white/12 bg-white/5 p-6 md:p-8">
          <ForwardingFormClient />
        </div>
      </Section>
    </div>
  );
}
