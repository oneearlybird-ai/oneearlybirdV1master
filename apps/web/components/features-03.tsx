"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import Highlighter, { HighlighterItem } from "./highlighter";

type ActivityItem = {
  title: string;
  subtitle: string;
  meta: string;
  tone: "lavender" | "emerald" | "sky" | "amber";
};

const toneStyles: Record<ActivityItem["tone"], string> = {
  lavender: "border-white/10 bg-white/[0.10] shadow-[0_16px_32px_rgba(139,92,246,0.25)]",
  emerald: "border-emerald-400/30 bg-emerald-400/10 shadow-[0_16px_32px_rgba(16,185,129,0.20)]",
  sky: "border-sky-400/20 bg-sky-400/10 shadow-[0_16px_32px_rgba(56,189,248,0.18)]",
  amber: "border-amber-300/25 bg-amber-300/10 shadow-[0_16px_32px_rgba(251,191,36,0.22)]",
};

export default function Features03() {
  const phoneRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = phoneRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const activityFeed = useMemo<ActivityItem[]>(
    () => [
      {
        title: "Booked · Emergency duct repair",
        subtitle: "Confirmed with Amy Chen · Sunrise Heating",
        meta: "Added to ServiceTitan · 4h follow-up",
        tone: "lavender",
      },
      {
        title: "Voicemail escalated",
        subtitle: "Flagged as VIP · Dr. Patel (Dental Studio)",
        meta: "Forwarded to on-call line at 9:12am",
        tone: "emerald",
      },
      {
        title: "Transcript ready",
        subtitle: "Hot lead asking for pricing bundle",
        meta: "Shared with Sales Slack channel",
        tone: "sky",
      },
      {
        title: "Calendar sync",
        subtitle: "Reschedule for Smith Pediatrics · Tomorrow 2:45pm",
        meta: "Google Workspace + HubSpot updated",
        tone: "amber",
      },
    ],
    []
  );

  return (
    <section className="relative">
      {/* Blurred shape */}
      <div className="absolute top-0 -translate-y-1/4 left-1/2 -translate-x-1/2 blur-2xl opacity-50 pointer-events-none -z-10" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" width="434" height="427">
          <defs>
            <linearGradient id="bs3-a" x1="19.609%" x2="50%" y1="14.544%" y2="100%">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path fill="url(#bs3-a)" fillRule="evenodd" d="m410 0 461 369-284 58z" transform="matrix(1 0 0 -1 -410 427)" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-16 pb-12 md:pt-32 md:pb-20 border-b border-slate-800">
          {/* Section header */}
          <div className="max-w-3xl mx-auto text-center pb-12 md:pb-20">
            <h2 className="h2 bg-clip-text text-transparent bg-linear-to-r from-slate-200/60 via-slate-200 to-slate-200/60 pb-4">
              Command your front desk from one dashboard
            </h2>
            <p className="text-lg text-slate-400">
              Review live calls, transcripts, bookings, and health scores in one place—so you always know who called, what they needed, and what happens next.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div data-aos="fade-down">
              <Highlighter className="group">
                <HighlighterItem>
                  <div className="relative h-full bg-slate-900 rounded-[inherit] z-20 overflow-hidden px-6 py-10">
                    {/* Radial gradient */}
                    <div className="absolute bottom-0 translate-y-1/2 left-1/2 -translate-x-1/2 pointer-events-none -z-10 w-1/2 aspect-square" aria-hidden="true">
                      <div className="absolute inset-0 translate-z-0 bg-purple-500 rounded-full blur-[120px]" />
                    </div>
                    <div
                      ref={phoneRef}
                      className={`mx-auto w-[220px] md:w-[300px] transition-all duration-700 ease-out will-change-transform ${
                        isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
                      }`}
                    >
                      <div className="relative">
                        <div className="absolute -inset-x-6 -top-12 bottom-14 -z-10 rounded-[52px] bg-[radial-gradient(circle_at_top,rgba(147,197,253,0.25),transparent_60%)] blur-[80px] opacity-70" aria-hidden />
                        <div className="relative aspect-[9/19.5] rounded-[48px] border border-white/25 bg-gradient-to-br from-[#1e1f2b] via-[#080811] to-[#010104] shadow-[0_42px_96px_rgba(5,5,11,0.72)]">
                          <div className="absolute inset-[4px] rounded-[43px] bg-gradient-to-br from-[#0b0b14] via-[#050507] to-[#090915] shadow-[inset_0_3px_6px_rgba(255,255,255,0.08)]" />
                          <div className="absolute inset-y-[74px] -left-[3px] w-[3.5px] rounded-full bg-white/15" aria-hidden />
                          <div className="absolute inset-y-[124px] -right-[3px] w-[2.5px] rounded-full bg-white/12" aria-hidden />
                          <div className="absolute top-[18px] left-1/2 z-10 flex h-[36px] w-[132px] -translate-x-1/2 items-center justify-between rounded-full bg-black/75 px-6 shadow-[0_12px_32px_rgba(0,0,0,0.55)]">
                            <span className="h-[7px] w-[72px] rounded-full bg-white/25" />
                            <span className="flex h-2 w-6 items-center justify-between">
                              <span className="h-1.5 w-1.5 rounded-full bg-white/35" />
                              <span className="h-1.5 w-1.5 rounded-full bg-white/35" />
                            </span>
                          </div>
                          <div className="absolute inset-[16px] overflow-hidden rounded-[34px] border border-white/12 bg-gradient-to-br from-[#171728] via-[#090913] to-[#05050b] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_-12%,rgba(147,197,253,0.18),transparent_62%),radial-gradient(circle_at_90%_-5%,rgba(192,132,252,0.16),transparent_60%)]" aria-hidden />
                            <div className="relative flex h-full flex-col gap-4 px-4 py-5 text-white/85">
                              <div className="flex items-center justify-between text-[11px] text-white/55">
                                <span className="font-semibold tracking-[0.08em] text-white">9:41</span>
                                <div className="flex items-center gap-2 text-white/45">
                                  <span className="inline-flex h-2 w-3 rounded-sm bg-gradient-to-r from-white/50 to-white/20" />
                                  <span className="inline-flex h-[7px] w-5 items-end gap-[2px]">
                                    <span className="inline-block h-full w-[3px] rounded bg-white/45" />
                                    <span className="inline-block h-[70%] w-[3px] rounded bg-white/35" />
                                    <span className="inline-block h-[50%] w-[3px] rounded bg-white/25" />
                                    <span className="inline-block h-[30%] w-[3px] rounded bg-white/18" />
                                  </span>
                                  <span className="inline-flex h-3 w-4 rounded-sm border border-white/25" />
                                </div>
                              </div>
                              <div className="rounded-[26px] border border-white/12 bg-white/10 p-3 shadow-[0_18px_34px_rgba(76,29,149,0.28)]">
                                <p className="text-[11px] uppercase tracking-[0.32em] text-white/40">Today</p>
                                <p className="mt-2 text-[18px] font-semibold text-white">Welcome back, Taylor</p>
                                <p className="text-[11px] text-white/60">3 live calls • 18 awaiting review</p>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="rounded-2xl border border-white/12 bg-white/8 p-3 shadow-[0_14px_28px_rgba(76,29,149,0.25)]">
                                  <p className="text-[10px] uppercase tracking-wide text-purple-200/85">Capture rate</p>
                                  <div className="mt-1 text-xl font-semibold text-white">98%</div>
                                  <p className="text-[10px] text-white/55">Last 30 days</p>
                                </div>
                                <div className="rounded-2xl border border-white/12 bg-white/7 p-3 shadow-[0_14px_28px_rgba(56,189,248,0.22)]">
                                  <p className="text-[10px] uppercase tracking-wide text-purple-200/85">Bookings</p>
                                  <div className="mt-1 text-xl font-semibold text-white">63</div>
                                  <p className="text-[10px] text-white/55">+12% vs last week</p>
                                </div>
                              </div>
                              <div className="relative mt-1 flex-1 overflow-hidden rounded-[22px] border border-white/12 bg-white/6">
                                <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-[#171728] via-[#171728]/40 to-transparent" />
                                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#171728] via-[#171728]/50 to-transparent" />
                                <div
                                  className="flex flex-col gap-3 px-3 py-4"
                                  style={{ animation: isVisible ? "phoneScroll 18s ease-in-out infinite" : "none" }}
                                >
                                  {[...activityFeed, ...activityFeed.slice(0, 2)].map((item, idx) => (
                                    <button
                                      key={`${item.title}-${idx}`}
                                      type="button"
                                      className={`flex flex-col rounded-[18px] border border-white/10 px-3 py-3 text-left transition hover:border-white/20 hover:bg-white/14 ${toneStyles[item.tone]}`}
                                    >
                                      <span className="text-[11px] font-semibold text-white/80">{item.title}</span>
                                      <span className="mt-1 text-[10px] text-white/60">{item.subtitle}</span>
                                      <span className="mt-2 text-[9px] uppercase tracking-[0.18em] text-white/45">{item.meta}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div className="mt-auto flex items-center justify-between text-[10px] text-white/45">
                                <span>Inbox • 12 new</span>
                                <button className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-medium text-white/75 transition hover:bg-white/10 hover:text-white">
                                  View queue
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <style>{`
                      @keyframes phoneScroll {
                        0%, 12% { transform: translateY(0); }
                        46%, 58% { transform: translateY(-148px); }
                        90%, 100% { transform: translateY(0); }
                      }
                    `}</style>
                  </div>
                </HighlighterItem>
              </Highlighter>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
