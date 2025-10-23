export const dynamic = "force-static";

import Link from "next/link";

const STEPS = [
  "Sign up with your work email and create your workspace.",
  "Activate billing to unlock the connect number in Dashboard → Numbers → Forwarding.",
  "Place the verification call so we know the destination is live.",
  "Update your carrier portal or dial *72 to forward to the connect number.",
  "Test a live call, then toggle EarlyBird as your receptionist.",
];

const CHECKLIST = [
  "Existing business number(s) and carrier access.",
  "Forwarding codes (*72 / *73) or portal login.",
  "EarlyBird connect number after verification.",
  "A few minutes to verify and test.",
];

const TIP_ITEMS = [
  "AT&T, Verizon, T-Mobile: Features → Call Forwarding → add the connect number.",
  "RingCentral, Zoom Phone, Grasshopper: edit the main call handling rule and forward to EarlyBird.",
  "Desk phones / PBX: dial *72 + connect number; use *73 to revert.",
];

export default function ForwardingPage() {
  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden px-5 pt-20 pb-12 sm:px-6 md:pt-28">
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.32),_transparent_70%)]" />
          <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.12),_transparent_62%)] blur-2xl" />
        </div>
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Number forwarding</span>
          <h1 className="mt-6 text-4xl font-semibold text-white md:text-5xl">Keep your numbers. Route calls to EarlyBird.</h1>
          <p className="mt-6 text-base text-white/70 md:text-lg">Forwarding keeps your carrier in place. After billing and verification you can point every call at EarlyBird in minutes.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href="/signup" className="inline-flex items-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90">Create your account</a>
            <Link href="/login?tab=signin" className="inline-flex items-center rounded-2xl border border-white/20 px-5 py-3 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white">Sign in to dashboard</Link>
          </div>
        </div>
      </section>

      <section className="relative px-5 pb-16 sm:px-6 md:pb-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-20 flex justify-center" aria-hidden="true">
          <div className="h-full w-full max-w-4xl bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_75%)]" />
        </div>
        <div className="mx-auto flex max-w-3xl flex-col gap-8">
          <article className="rounded-3xl border border-white/12 bg-white/5 p-5">
            <h2 className="text-lg font-semibold text-white">Forwarding playbook</h2>
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              {STEPS.map((step, index) => (
                <li key={step} className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-purple-400/70" />
                  <span><strong className="text-white/70">Step {index + 1}.</strong> {step}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-3xl border border-white/12 bg-white/5 p-5">
            <h2 className="text-lg font-semibold text-white">Checklist</h2>
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              {CHECKLIST.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-purple-400/70" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-3xl border border-white/12 bg-white/5 p-5">
            <h2 className="text-lg font-semibold text-white">Carrier tips</h2>
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              {TIP_ITEMS.map((tip) => (
                <li key={tip} className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-purple-400/70" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-3xl border border-white/12 bg-white/5 p-5">
            <h2 className="text-lg font-semibold text-white">Need help?</h2>
            <p className="mt-2 text-sm text-white/75">Message us from the dashboard support drawer after you sign in or email support@earlybird.ai. We’ll hop on a quick call if you want a walk-through.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/docs#forwarding" className="inline-flex items-center rounded-2xl border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/35 hover:text-white">Read the guide</Link>
              <a href="mailto:support@earlybird.ai" className="inline-flex items-center rounded-2xl border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/35 hover:text-white">Email support</a>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
