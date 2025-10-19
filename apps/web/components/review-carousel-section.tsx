import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import Section from "@/components/marketing/Section";

const REVIEWS = [
  {
    q: "“The AI picks up every call on the first ring and books clean jobs without handholding. Our ops chat is now just dispatch updates.”",
    a: "Sonia Patel · Operations Lead, BrightRoute HVAC",
  },
  {
    q: "“We cut missed calls from 27% to under 2%. EarlyBird syncs transcripts into HubSpot so reps pick up right where the AI left off.”",
    a: "Leo Martinez · RevOps, Harbor Clinics",
  },
  {
    q: "“Weekend emergencies used to wake up three managers. Now the AI triages, schedules our on-call tech, and emails a summary automatically.”",
    a: "Maya Chen · COO, RapidRestore Plumbing",
  },
  {
    q: "“It handles insurance verifications, directions, even Spanish callers. Patients think they’re speaking with our front desk.”",
    a: "Dr. Alana Brooks · Practice Owner, Cascade Dental",
  },
  {
    q: "“We ship the AI our FAQ doc and call tree. Within an hour it was quoting rates, qualifying leads, and escalating VIPs to my cell.”",
    a: "Nate Ellis · Founder, Ellis Security",
  },
  {
    q: "“The transcripts, tags, and audio drop right into Slack after every conversation. Coaching the AI is faster than training new hires.”",
    a: "Courtney James · CX Director, Beacon Storage",
  },
];

export default function ReviewCarouselSection() {
  return (
    <Section
      eyebrow="Customer proof"
      title="Teams hand off their phones and keep control of the experience"
      description="Facilities, healthcare, field services, and retail leaders trust EarlyBird AI to greet every caller, qualify leads, and sync context into their workflow."
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-3xl border border-white/12 bg-white/5 p-6 md:p-8">
          <TestimonialsCarousel items={REVIEWS} interval={6000} />
        </div>
        <aside className="flex flex-col gap-6">
          <div className="rounded-3xl border border-white/12 bg-white/5 p-5 text-white/80">
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-amber-300">
                <path
                  fill="currentColor"
                  d="M12 3.5 14.6 9l5.4.6-4 3.9 1 5.5-4.8-2.6-4.8 2.6 1-5.5-4-3.9L9.4 9 12 3.5Z"
                />
              </svg>
              <span>4.9 / 5 average satisfaction</span>
            </div>
            <p className="mt-3 text-sm">
              Measured across 1,200+ post-call surveys pulled from HVAC, medical, legal, and property management teams.
            </p>
          </div>
          <div className="rounded-3xl border border-white/12 bg-white/5 p-5 text-white/80">
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
              <span>93% handled without human takeover</span>
            </div>
            <p className="mt-3 text-sm">
              The AI routes urgent issues instantly, and everything else is answered, scheduled, and logged with transcripts and audio.
            </p>
          </div>
          <div className="rounded-3xl border border-white/12 bg-white/5 p-5 text-sm text-white/70">
            <p className="font-medium text-white">Security-first by default</p>
            <ul className="mt-3 space-y-2">
              <li>Verified callers get OTPs before the AI discusses account details.</li>
              <li>No data hits marketing surfaces—dashboards stay cookie-auth only.</li>
              <li>Signed transcripts and recordings flow via secure webhooks.</li>
            </ul>
          </div>
        </aside>
      </div>
    </Section>
  );
}
