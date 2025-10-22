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
                        <div className="absolute -inset-x-8 -top-16 bottom-20 -z-10 rounded-[64px] bg-[radial-gradient(circle_at_top,rgba(147,197,253,0.35),transparent_65%)] blur-[90px] opacity-70" aria-hidden />
                        <div className="relative aspect-[9/19.5] w-full rounded-[56px] border border-white/25 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_70%)] shadow-[0_48px_110px_rgba(5,5,11,0.78)]">
                          <div className="absolute inset-[3px] rounded-[52px] border border-white/20 bg-gradient-to-br from-[#121222] via-[#05050d] to-[#020206] shadow-[inset_0_2px_6px_rgba(255,255,255,0.06)]" />
                          <div className="absolute inset-y-[84px] -left-[4px] w-[4px] rounded-full bg-white/18" aria-hidden />
                          <div className="absolute inset-y-[140px] -right-[3px] w-[3px] rounded-full bg-white/12" aria-hidden />
                          <div className="absolute top-[18px] inset-x-[22px] z-20 flex items-center justify-between px-2 text-[10px] text-white/65">
                            <span className="font-semibold tracking-[0.16em]">9:41</span>
                            <div className="flex items-center gap-2 text-white/45">
                              <span className="inline-flex h-[10px] w-[18px] items-end gap-[2px]">
                                <span className="inline-block h-full w-[3px] rounded bg-white/45" />
                                <span className="inline-block h-[80%] w-[3px] rounded bg-white/35" />
                                <span className="inline-block h-[55%] w-[3px] rounded bg-white/25" />
                                <span className="inline-block h-[35%] w-[3px] rounded bg-white/18" />
                              </span>
                              <span className="inline-flex h-2 w-3 rounded-sm bg-gradient-to-r from-white/45 to-white/15" />
                              <span className="inline-flex h-3 w-4 rounded-sm border border-white/25" />
                            </div>
                          </div>
                          <div className="absolute inset-[14px] overflow-hidden rounded-[38px] border border-white/12 bg-[#05050b] shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]">
                            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_-10%,rgba(147,197,253,0.25),transparent_62%),radial-gradient(circle_at_90%_0%,rgba(192,132,252,0.2),transparent_60%)]" aria-hidden />
                            <div className="pointer-events-none absolute inset-0 animate-[float_12s_ease-in-out_infinite]">
                              <div className="absolute -top-14 -left-12 h-24 w-24 rounded-full border border-white/10 bg-white/10 backdrop-blur-sm" />
                              <div className="absolute top-1/3 -right-14 h-20 w-20 rounded-full border border-white/10 bg-emerald-400/15 backdrop-blur-sm" />
                              <div className="absolute bottom-6 -left-10 h-16 w-16 rounded-full border border-white/10 bg-sky-400/15 backdrop-blur-sm" />
                            </div>
                            <div
                              className="absolute inset-0 flex min-h-[220%] flex-col gap-4 px-4 py-5 text-white/85"
                              style={{ animation: isVisible ? "phone-screen-scroll 24s ease-in-out infinite" : "none" }}
                            >
                              <div className="flex items-center justify-between text-[11px] text-white/55">
                                <span className="font-semibold tracking-[0.12em] text-white">9:41</span>
                                <div className="flex items-center gap-2 text-white/45">
                                  <span className="inline-flex h-2 w-3 rounded-sm bg-gradient-to-r from-white/45 to-white/15" />
                                  <span className="inline-flex h-[8px] w-6 items-end gap-[2px]">
                                    <span className="inline-block h-full w-[3px] rounded bg-white/45" />
                                    <span className="inline-block h-[70%] w-[3px] rounded bg-white/35" />
                                    <span className="inline-block h-[45%] w-[3px] rounded bg-white/25" />
                                    <span className="inline-block h-[25%] w-[3px] rounded bg-white/18" />
                                  </span>
                                  <span className="inline-flex h-3 w-4 rounded-sm border border-white/25" />
                                </div>
                              </div>
                              <div className="rounded-3xl border border-white/12 bg-white/10 p-3 shadow-[0_18px_34px_rgba(99,102,241,0.28)]">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-[10px] uppercase tracking-[0.32em] text-white/40">Today</p>
                                    <p className="mt-2 text-[19px] font-semibold text-white">Morning briefing</p>
                                  </div>
                                  <span className="rounded-full border border-white/15 px-3 py-1 text-[9px] text-white/65">Live sync</span>
                                </div>
                                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px] text-white/60">
                                  <div className="rounded-2xl border border-white/12 bg-white/8 p-3">
                                    <div className="text-xs font-semibold text-white">18</div>
                                    <p>Queued calls</p>
                                  </div>
                                  <div className="rounded-2xl border border-white/12 bg-white/8 p-3">
                                    <div className="text-xs font-semibold text-white">12</div>
                                    <p>Bookings today</p>
                                  </div>
                                  <div className="rounded-2xl border border-white/12 bg-white/8 p-3">
                                    <div className="text-xs font-semibold text-white">4</div>
                                    <p>Escalations</p>
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="rounded-2xl border border-white/12 bg-white/8 p-3 shadow-[0_18px_32px_rgba(99,102,241,0.25)]">
                                  <p className="text-[9px] uppercase tracking-wide text-purple-200/85">Capture rate</p>
                                  <div className="mt-1 text-[20px] font-semibold text-white">98%</div>
                                  <p className="text-[9px] text-white/50">Last 30 days</p>
                                </div>
                                <div className="rounded-2xl border border-white/12 bg-white/8 p-3 shadow-[0_18px_32px_rgba(34,197,94,0.22)]">
                                  <p className="text-[9px] uppercase tracking-wide text-emerald-200/80">Bookings</p>
                                  <div className="mt-1 text-[20px] font-semibold text-white">63</div>
                                  <p className="text-[9px] text-white/50">+12% vs last week</p>
                                </div>
                              </div>
                              {[...activityFeed, ...activityFeed].map((item, idx) => (
                                <div
                                  key={`${item.title}-${idx}`}
                                  className={`flex flex-col rounded-[18px] border px-3 py-3 text-left text-white/80 shadow transition ${toneStyles[item.tone]}`}
                                >
                                  <span className="text-[11px] font-semibold">{item.title}</span>
                                  <span className="mt-1 text-[10px] text-white/60">{item.subtitle}</span>
                                  <span className="mt-2 text-[9px] uppercase tracking-[0.18em] text-white/40">{item.meta}</span>
                                </div>
                              ))}
                              <div className="rounded-2xl border border-white/12 bg-white/8 p-3 shadow-[0_18px_32px_rgba(99,102,241,0.25)]">
                                <div className="flex items-center justify-between text-[10px] text-white/55">
                                  <span>Inbox</span>
                                  <span className="rounded-full border border-white/15 px-2 py-0.5 text-[9px] text-white/70">12 new</span>
                                </div>
                                <div className="mt-3 space-y-2 text-[10px] text-white/60">
                                  <div className="flex justify-between rounded-xl border border-white/10 bg-white/10 px-3 py-2">
                                    <span>Health score</span>
                                    <span className="font-semibold text-white">A+</span>
                                  </div>
                                  <div className="flex justify-between rounded-xl border border-white/10 bg-white/10 px-3 py-2">
                                    <span>SLAs met</span>
                                    <span className="font-semibold text-white">99.5%</span>
                                  </div>
                                </div>
                              </div>
                              <div className="rounded-2xl border border-white/12 bg-white/8 p-3 shadow-[0_18px_32px_rgba(251,191,36,0.22)]">
                                <div className="flex items-center justify-between text-[10px] text-white/55">
                                  <span>Automation queue</span>
                                  <span className="rounded-full border border-white/15 px-2 py-0.5 text-[9px] text-white/70">3 escalations</span>
                                </div>
                                <div className="mt-3 grid gap-2 text-[10px] text-white/60">
                                  <div className="rounded-xl border border-white/10 bg-white/10 px-3 py-2">Transfer to after-hours crew • 2 mins</div>
                                  <div className="rounded-xl border border-white/10 bg-white/10 px-3 py-2">Sync diagnostics to HubSpot • 5 mins</div>
                                  <div className="rounded-xl border border-white/10 bg-white/10 px-3 py-2">SMS follow-up to booked leads • 3 mins</div>
                                </div>
                              </div>
                              <div className="rounded-2xl border border-white/12 bg-white/8 p-3 text-[10px] text-white/60">
                                <div className="flex items-center justify-between">
                                  <span className="text-white/50">Live agents</span>
                                  <span className="text-white font-semibold">4 online</span>
                                </div>
                                <div className="mt-2 flex items-center gap-2 text-white/70">
                                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-[9px] font-semibold">AK</span>
                                  <div>
                                    <p className="text-white">Alex Kim</p>
                                    <p className="text-[9px] text-white/45">On AI assist · SLA 1m</p>
                                  </div>
                                </div>
                                <div className="mt-2 flex items-center gap-2 text-white/70">
                                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-[9px] font-semibold">RJ</span>
                                  <div>
                                    <p className="text-white">Riley Johnson</p>
                                    <p className="text-[9px] text-white/45">Reviewing transcripts · SLA 3m</p>
                                  </div>
                                </div>
                              </div>
                              <div className="mb-10 flex items-center justify-between text-[10px] text-white/50">
                                <span>View queue</span>
                                <button className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-medium text-white/75 transition hover:bg-white/10 hover:text-white">
                                  Open dashboard
                                </button>
                              </div>
                              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#05050b]" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <style jsx>{`
                      @keyframes phone-screen-scroll {
                        0%, 12% {
                          transform: translateY(0);
                        }
                        48%, 60% {
                          transform: translateY(-50%);
                        }
                        88%, 100% {
                          transform: translateY(0);
                        }
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
