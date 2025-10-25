import type { ReactNode } from "react";
import Image from "next/image";
import Particles from "./particles";

import FeatureImg01 from "@/public/images/feature-image-01.png";

type FeatureItem = {
  title: string;
  description: string;
  icon: ReactNode;
};

const FEATURES: FeatureItem[] = [
  {
    title: "Call routing controls",
    description: "Direct after-hours, overflow, and VIP calls based on business rules—no IVR trees.",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path
          fill="currentColor"
          d="M7.999 2.34a4.733 4.733 0 0 0-6.604 6.778l5.904 5.762a1 1 0 0 0 1.4 0l5.915-5.77a4.733 4.733 0 0 0-6.615-6.77Zm5.208 5.348-5.208 5.079-5.2-5.07a2.734 2.734 0 0 1 3.867-3.864c.182.19.335.404.455.638a1.04 1.04 0 0 0 1.756 0 2.724 2.724 0 0 1 5.122 1.294 2.7 2.7 0 0 1-.792 1.923Z"
        />
      </svg>
    ),
  },
  {
    title: "Calendar sync",
    description: "Two-way sync with Google and Microsoft calendars keeps availability accurate automatically.",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path
          fill="currentColor"
          d="M11 0c1.3 0 2.6.5 3.5 1.5 1 .9 1.5 2.2 1.5 3.5 0 1.3-.5 2.6-1.4 3.5l-1.2 1.2c-.2.2-.5.3-.7.3-.2 0-.5-.1-.7-.3-.4-.4-.4-1 0-1.4l1.1-1.2c.6-.5.9-1.3.9-2.1s-.3-1.6-.9-2.2C12 1.7 10 1.7 8.9 2.8L7.7 4c-.4.4-1 .4-1.4 0-.4-.4-.4-1 0-1.4l1.2-1.1C8.4.5 9.7 0 11 0ZM8.3 12c.4-.4 1-.5 1.4-.1.4.4.4 1 0 1.4l-1.2 1.2C7.6 15.5 6.3 16 5 16c-1.3 0-2.6-.5-3.5-1.5C.5 13.6 0 12.3 0 11c0-1.3.5-2.6 1.5-3.5l1.1-1.2c.4-.4 1-.4 1.4 0 .4.4.4 1 0 1.4L2.9 8.9c-.6.5-.9 1.3-.9 2.1s.3 1.6.9 2.2c1.1 1.1 3.1 1.1 4.2 0L8.3 12Z"
        />
      </svg>
    ),
  },
  {
    title: "CRM logging",
    description: "Push transcripts, tags, and next steps into HubSpot, Salesforce, or Slack with one click.",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path
          fill="currentColor"
          d="M14 0a2 2 0 0 1 2 2v4a1 1 0 0 1-2 0V2H2v12h4a1 1 0 0 1 0 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h12Zm-1.957 10.629 3.664 3.664a1 1 0 0 1-1.414 1.414l-3.664-3.664-.644 2.578a.5.5 0 0 1-.476.379H9.5a.5.5 0 0 1-.48-.362l-2-7a.5.5 0 0 1 .618-.618l7 2a.5.5 0 0 1-.017.965l-2.578.644Z"
        />
      </svg>
    ),
  },
  {
    title: "Voice selection",
    description: "Choose from multiple voices and languages, all tuned to your brand tone.",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path
          fill="currentColor"
          d="M14.3.3c.4-.4 1-.4 1.4 0 .4.4.4 1 0 1.4l-8 8c-.2.2-.4.3-.7.3-.3 0-.5-.1-.7-.3-.4-.4-.4-1 0-1.4l8-8ZM15 7c.6 0 1 .4 1 1 0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8c.6 0 1 .4 1 1s-.4 1-.9 1C4.7 2 2 4.7 2 8s2.7 6 6 6 6-2.7 6-6c0-.6.4-1 1-1Z"
        />
      </svg>
    ),
  },
  {
    title: "Compliance guardrails",
    description: "SOC 2-ready logging, consent prompts, and PII handling give compliance teams confidence.",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path
          fill="currentColor"
          d="M14 0a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h12Zm0 14V2H2v12h12Zm-3-7H5a1 1 0 1 1 0-2h6a1 1 0 0 1 0 2Zm0 4H5a1 1 0 0 1 0-2h6a1 1 0 0 1 0 2Z"
        />
      </svg>
    ),
  },
  {
    title: "Automated follow-up",
    description: "Trigger SMS or email follow-ups so callers always get confirmation without staff time.",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path
          fill="currentColor"
          d="M14.574 5.67a13.292 13.292 0 0 1 1.298 1.842 1 1 0 0 1 0 .98C15.743 8.716 12.706 14 8 14a6.391 6.391 0 0 1-1.557-.2l-1.815-1.815C10.97 11.82 13.06 9.13 13.82 8c-.163-.243-.39-.56-.669-.907l-1.424 1.424ZM.294 15.706a.999.999 0 0 1-.002-1.413l2.53-2.529C1.171 10.291.197 8.615.127 8.49a.998.998 0 0 1-.002-.975C.251 7.29 3.246 2 8 2c1.331 0 2.515.431 3.548 1.038L14.293.293a.999.999 0 1 1 1.414 1.414l-14 14a.997.997 0 0 1-1.414 0ZM2.18 8a12.603 12.603 0 0 0 2.06 2.347l1.833-1.834A1.925 1.925 0 0 1 6 8a2 2 0 0 1 2-2c.178 0 .348.03.512.074l1.566-1.566C9.438 4.201 8.742 4 8 4 5.146 4 2.958 6.835 2.181 8Z"
        />
      </svg>
    ),
  },
];

const CARD_BASE_CLASS =
  "flex h-full flex-col justify-between rounded-3xl border border-slate-800 bg-slate-800/25 px-6 py-6 transition duration-200 hover:-translate-y-1 hover:border-purple-300 hover:bg-purple-500/10 hover:shadow-[0_20px_60px_rgba(102,51,153,0.25)]";

export default function Features02() {
  const leftColumn = FEATURES.slice(0, 3);
  const rightColumn = FEATURES.slice(3);

  return (
    <section className="relative">
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-80 w-80 -translate-x-1/2 -translate-y-24" aria-hidden="true">
        <Particles className="absolute inset-0 -z-10" quantity={6} staticity={30} />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="pt-16 md:pt-32">
          <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,18rem)_minmax(0,1fr)]">
            <div className="flex flex-col gap-6">
              {leftColumn.map((feature, index) => (
                <FeatureCard key={feature.title} feature={feature} animation="fade-right" delay={index * 80} />
              ))}
            </div>

            <div className="flex justify-center" data-aos="zoom-in" data-aos-delay="160">
              <div className="relative mx-auto w-full max-w-[240px] rounded-3xl border border-slate-800 bg-slate-900/40 px-5 py-10 shadow-[0_24px_60px_rgba(15,23,42,0.45)] transition duration-200 hover:border-purple-300 hover:bg-purple-500/10">
                <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-b from-white/10 via-transparent to-transparent" aria-hidden="true" />
                <div className="absolute -top-12 left-1/2 h-44 w-44 -translate-x-1/2 rounded-full bg-purple-500/25 blur-3xl" aria-hidden="true" />
                <div className="relative flex items-center justify-center">
                  <Image src={FeatureImg01} alt="EarlyBird live call preview" className="w-full" priority />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              {rightColumn.map((feature, index) => (
                <FeatureCard key={feature.title} feature={feature} animation="fade-left" delay={index * 80} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  feature,
  animation,
  delay,
}: {
  feature: FeatureItem;
  animation: "fade-left" | "fade-right";
  delay?: number;
}) {
  return (
    <div className={CARD_BASE_CLASS} data-aos={animation} data-aos-delay={delay ?? 0}>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-slate-100">
          {feature.icon}
        </div>
        <h3 className="text-base font-semibold text-slate-100">{feature.title}</h3>
      </div>
      <p className="mt-3 text-sm text-slate-300">{feature.description}</p>
    </div>
  );
}
