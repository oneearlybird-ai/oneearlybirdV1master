export const dynamic = "force-static";

import Link from "next/link";
import Section from "@/components/marketing/Section";

export const metadata = {
  title: "Forward calls to EarlyBird",
  description: "Keep your business numbers. Forward them to EarlyBird in minutes so every caller hits the AI receptionist.",
};

const timeline = [
  {
    title: "Sign up & create your workspace",
    copy: "Start your EarlyBird account with a work email. Invite any teammates who will help manage calls.",
  },
  {
    title: "Activate billing",
    copy: "Pick the plan that fits your call volume. Once billing is active we unlock the connect number for forwarding.",
  },
  {
    title: "Verify your connect number",
    copy: "From Dashboard → Numbers → Forwarding, place the short verification call so we know the destination is live.",
  },
  {
    title: "Enable forwarding at your carrier",
    copy: "Update your carrier portal or dial their *72 code. Point your main line at the verified EarlyBird connect number.",
  },
  {
    title: "Toggle EarlyBird live",
    copy: "Flip the dashboard switch to announce EarlyBird as your receptionist and watch transcripts roll in instantly.",
  },
];

const checklist = [
  "Existing business number(s) your customers already call.",
  "Carrier portal access or forwarding codes (*72 to enable, *73 to disable for most providers).",
  "The connect number that appears after you verify inside Dashboard → Numbers → Forwarding.",
  "A few minutes to place the dashboard verification call and a live test once forwarding is enabled.",
];

const providerTips = [
  {
    title: "Wireless & VoIP",
    notes: [
      "AT&T, Verizon, T-Mobile, Spectrum: Features → Call Forwarding → add the EarlyBird connect number → save.",
      "RingCentral, Zoom Phone, Grasshopper: edit the main call handling rule and forward to the connect number.",
      "Teams Phone, 8x8, Dialpad: route the main auto-attendant or hunt group to the connect number.",
    ],
  },
  {
    title: "PBX / on-prem",
    notes: [
      "Desk phones: dial *72 + connect number to enable, *73 to disable.",
      "Older PBXs: add a permanent forward or ask the carrier to apply it for you.",
      "Need SIP trunk help? Open a support ticket from the dashboard and we’ll hop on a quick call.",
    ],
  },
];

const postForwarding = [
  "Keep your carrier account active — forwarding works without moving billing away from them.",
  "Analytics, recordings, and transcripts land inside EarlyBird as soon as forwarding is on.",
  "You can add more connect numbers anytime for departmental routing or after-hours flows.",
];

export default function ForwardingPage() {
  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden px-5 pt-20 pb-12 sm:px-6 md:pt-28">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/5 via-transparent to-transparent" aria-hidden="true" />
        <div className="mx-auto max-w-3xl text-center">
          <span className="stellar-pill">Number forwarding</span>
          <h1 className="mt-6 text-4xl font-semibold text-white md:text-5xl">Keep your number. Forward every caller to EarlyBird.</h1>
          <p className="mt-6 text-base text-white/70 md:text-lg">
            Forwarding lets you stay with the carrier you already trust. Once your workspace is live, it takes just a few minutes to point calls at EarlyBird.
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

      <Section eyebrow="Forwarding playbook" title="Your path to go live">
        <div className="grid gap-6 md:grid-cols-2">
          {timeline.map((step, index) => (
            <article
              key={step.title}
              data-aos="fade-up"
              data-aos-delay={index * 70}
              className="relative overflow-hidden rounded-3xl border border-white/12 bg-white/5 p-6 shadow-[0_24px_70px_rgba(9,9,22,0.35)] transition hover:border-white/20 hover:bg-white/8"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-sm font-semibold text-white/80">
                  {(index + 1).toString().padStart(2, "0")}
                </span>
                <h3 className="text-lg font-semibold text-white">{step.title}</h3>
              </div>
              <p className="mt-3 text-sm text-white/75">{step.copy}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section eyebrow="What to gather" title="Forwarding checklist" className="pt-0">
        <div className="stellar-grid-card bg-white/5">
          <ul className="list-disc space-y-2 pl-5 text-sm text-white/80">
            {checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </Section>

      <Section eyebrow="Carrier quick reference" title="Where to toggle forwarding" className="pt-0">
        <div className="grid gap-6 md:grid-cols-2">
          {providerTips.map((provider) => (
            <article key={provider.title} className="stellar-grid-card bg-white/5">
              <h3 className="text-lg font-semibold text-white">{provider.title}</h3>
              <ul className="mt-3 space-y-2 text-sm text-white/75">
                {provider.notes.map((note) => (
                  <li key={note} className="flex gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-purple-400/70" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>

      <Section eyebrow="After forwarding" title="What happens next" className="pt-0">
        <div className="stellar-grid-card bg-white/5">
          <ul className="list-disc space-y-2 pl-5 text-sm text-white/80">
            {postForwarding.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/docs#forwarding"
              className="inline-flex items-center rounded-2xl border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/35 hover:text-white"
            >
              Read the dashboard guide
            </Link>
            <a
              href="mailto:support@earlybird.ai"
              className="inline-flex items-center rounded-2xl border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/35 hover:text-white"
            >
              Contact support
            </a>
          </div>
        </div>
      </Section>
    </div>
  );
}
