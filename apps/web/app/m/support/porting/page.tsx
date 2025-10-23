export const dynamic = "force-static";

import Link from "next/link";
import Section from "@/components/marketing/Section";

export const metadata = {
  title: "Forward calls to EarlyBird",
  description: "Forward the numbers you already own. Once your workspace is active, EarlyBird picks up every caller.",
};

const steps = [
  "Sign up with your work email and create your workspace.",
  "Activate billing so the connect number unlocks in Dashboard → Numbers → Forwarding.",
  "Place the verification call from the dashboard to confirm the destination.",
  "Update your carrier portal or dial *72 to forward to the connect number.",
  "Flip the dashboard toggle so EarlyBird greets every caller.",
];

const checklist = [
  "Existing business number(s) and carrier account access.",
  "Forwarding codes (*72 to enable, *73 to disable) or portal login.",
  "EarlyBird connect number shown after verification.",
  "Five minutes to verify and test a live call.",
];

const providerTips = [
  "AT&T, Verizon, T-Mobile: Features → Call Forwarding → add the connect number.",
  "RingCentral, Zoom Phone, Grasshopper: edit the main call handling rule and route to EarlyBird.",
  "Desk phones / PBX: dial *72 + connect number; use *73 to revert.",
];

export default function ForwardingPage() {
  return (
    <div className="flex flex-col">
      <section className="px-5 pt-20 pb-12 sm:px-6 md:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="stellar-pill">Number forwarding</span>
          <h1 className="mt-6 text-4xl font-semibold text-white md:text-5xl">Keep your numbers. Route calls to EarlyBird.</h1>
          <p className="mt-6 text-base text-white/70 md:text-lg">
            Forwarding keeps your carrier in place. Once you verify your connect number, you can point every call at EarlyBird in minutes.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/signup"
              className="inline-flex items-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              Create your account
            </a>
            <Link
              href="/login?tab=signin"
              className="inline-flex items-center rounded-2xl border border-white/20 px-5 py-3 text-sm font-semibold text-white/80 transition hover:text-white"
            >
              Sign in to dashboard
            </Link>
          </div>
        </div>
      </section>

      <Section eyebrow="Forwarding playbook" title="Do this right after signup" className="pt-0">
        <div className="flex flex-col gap-4">
          {steps.map((step, index) => (
            <article key={step} className="rounded-3xl border border-white/12 bg-white/5 p-5">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-sm font-semibold text-white/80">
                  {(index + 1).toString().padStart(2, "0")}
                </span>
                <h3 className="text-base font-semibold text-white">Step {index + 1}</h3>
              </div>
              <p className="mt-2 text-sm text-white/75">{step}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section eyebrow="What to gather" title="Checklist" className="pt-0">
        <div className="stellar-grid-card bg-white/5">
          <ul className="list-disc space-y-2 pl-5 text-sm text-white/80">
            {checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </Section>

      <Section eyebrow="Carrier tips" title="Where to toggle forwarding" className="pt-0">
        <div className="stellar-grid-card bg-white/5">
          <ul className="space-y-2 text-sm text-white/75">
            {providerTips.map((tip) => (
              <li key={tip} className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-purple-400/70" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section
        eyebrow="Need help?"
        title="Message us from the dashboard"
        description="Support can join a quick call after you sign in — just open the help drawer and start a ticket."
        className="pt-0"
      >
        <div className="flex flex-wrap gap-3">
          <Link
            href="/docs#forwarding"
            className="inline-flex items-center rounded-2xl border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/35 hover:text-white"
          >
            Read the guide
          </Link>
          <a
            href="mailto:support@earlybird.ai"
            className="inline-flex items-center rounded-2xl border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/35 hover:text-white"
          >
            Email support
          </a>
        </div>
      </Section>
    </div>
  );
}
