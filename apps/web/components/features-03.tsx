import Highlighter, { HighlighterItem } from './highlighter'

export default function Features03() {
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
            <h2 className="h2 bg-clip-text text-transparent bg-linear-to-r from-slate-200/60 via-slate-200 to-slate-200/60 pb-4">Command your front desk from one dashboard</h2>
            <p className="text-lg text-slate-400">Review live calls, transcripts, bookings, and health scores in one place—so you always know who called, what they needed, and what happens next.</p>
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
                    <div className="mx-auto w-[260px] md:w-[280px] rounded-[34px] border border-white/10 bg-slate-950/80 p-[14px] shadow-[0_25px_60px_rgba(76,29,149,0.35)] backdrop-blur">
                      <div className="relative">
                        <div className="absolute inset-x-10 -top-3 h-5 rounded-full bg-slate-800/80" aria-hidden />
                        <div className="rounded-[24px] border border-white/10 bg-slate-900/95 p-4 space-y-4 text-slate-100">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-slate-400">Today</p>
                            <p className="mt-1 text-lg font-semibold text-slate-50">Welcome back, Taylor</p>
                            <p className="text-xs text-slate-400">3 calls in progress · 18 awaiting review</p>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-2xl border border-white/10 bg-white/\[0.04\] p-3">
                              <p className="text-[11px] uppercase tracking-wide text-purple-200">Call capture</p>
                              <div className="mt-1 text-xl font-semibold text-white">98%</div>
                              <p className="text-[11px] text-slate-400">Last 30 days</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/\[0.02\] p-3">
                              <p className="text-[11px] uppercase tracking-wide text-purple-200">Bookings</p>
                              <div className="mt-1 text-xl font-semibold text-white">63</div>
                              <p className="text-[11px] text-slate-400">+12% vs last week</p>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-white/\[0.02\] p-3 space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-[11px] uppercase tracking-wide text-purple-200">Next follow-up</p>
                                <p className="text-sm font-medium text-white">Hot lead · 4:30pm today</p>
                              </div>
                              <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2 py-1 text-[10px] font-semibold text-emerald-300">
                                High intent
                              </span>
                            </div>
                            <div className="space-y-2 text-[12px] text-slate-300">
                              <div className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/\[0.03\] px-3 py-2">
                                <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-300" />
                                <div>
                                  <p className="font-medium text-slate-100">Transcript & summary</p>
                                  <p className="text-slate-400">“Caller asked about emergency availability, ready to start trial tomorrow.”</p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/\[0.02\] px-3 py-2">
                                <span className="text-slate-200">Send hand-off email</span>
                                <span className="text-xs text-slate-400">Assigned to Maya</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </HighlighterItem>
              </Highlighter>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
