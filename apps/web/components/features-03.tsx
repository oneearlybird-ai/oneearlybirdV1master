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
                    <div className="mx-auto w-[216px] md:w-[288px]">
                      <div className="relative">
                        <div className="absolute -inset-x-6 -top-10 bottom-12 -z-10 rounded-[48px] bg-gradient-to-br from-purple-500/25 via-blue-500/10 to-indigo-500/25 blur-3xl opacity-60" aria-hidden />
                        <div className="relative aspect-[9/19.5] rounded-[46px] border border-white/15 bg-gradient-to-br from-[#1c1c2e] via-[#090914] to-[#02020a] shadow-[0_36px_88px_rgba(5,5,11,0.65)]">
                          <div className="absolute inset-[3.5px] rounded-[42px] bg-[#05050b] shadow-[inset_0_2px_6px_rgba(255,255,255,0.06)]" />
                          <div className="absolute inset-y-[72px] -left-1 w-[3px] rounded-full bg-white/12" aria-hidden />
                          <div className="absolute inset-y-[128px] -right-1 w-[2px] rounded-full bg-white/12" aria-hidden />
                          <div className="absolute top-[15px] left-1/2 z-10 flex h-[34px] w-[124px] -translate-x-1/2 items-center justify-center gap-3 rounded-full bg-black/75 px-6 shadow-[0_10px_28px_rgba(0,0,0,0.45)]">
                            <span className="h-2 w-16 rounded-full bg-white/25" />
                            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                          </div>
                          <div className="absolute inset-[14px] overflow-hidden rounded-[34px] border border-white/12 bg-gradient-to-br from-[#161625] via-[#090914] to-[#05050b] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(99,102,241,0.28),transparent_55%),radial-gradient(circle_at_80%_0%,rgba(129,140,248,0.18),transparent_55%)]" aria-hidden />
                            <div className="relative flex h-full flex-col gap-4 px-4 py-5 text-white/85">
                              <div className="flex items-center justify-between text-[11px] text-white/60">
                                <span className="font-semibold tracking-[0.08em] text-white">9:41</span>
                                <div className="flex items-center gap-2 text-white/45">
                                  <span className="inline-flex h-2 w-3 rounded-sm bg-gradient-to-r from-white/40 to-white/20" />
                                  <span className="inline-flex h-[7px] w-5 items-end gap-[2px]">
                                    <span className="inline-block h-full w-[3px] rounded bg-white/40" />
                                    <span className="inline-block h-[75%] w-[3px] rounded bg-white/40" />
                                    <span className="inline-block h-[55%] w-[3px] rounded bg-white/25" />
                                    <span className="inline-block h-[35%] w-[3px] rounded bg-white/20" />
                                  </span>
                                  <span className="inline-flex h-3 w-4 rounded-sm border border-white/30" />
                                </div>
                              </div>
                              <div className="rounded-3xl border border-white/10 bg-white/10 p-3 shadow-[0_16px_30px_rgba(67,56,202,0.25)]">
                                <p className="text-xs uppercase tracking-[0.3em] text-white/35">Today</p>
                                <p className="mt-2 text-[18px] font-semibold text-white">Welcome back, Taylor</p>
                                <p className="text-[11px] text-white/55">3 live calls • 18 awaiting review</p>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="rounded-2xl border border-white/12 bg-white/10 p-3 shadow-[0_10px_26px_rgba(76,29,149,0.22)]">
                                  <p className="text-[10px] uppercase tracking-wide text-purple-200/85">Capture rate</p>
                                  <div className="mt-1 text-xl font-semibold text-white">98%</div>
                                  <p className="text-[10px] text-white/55">Last 30 days</p>
                                </div>
                                <div className="rounded-2xl border border-white/12 bg-white/5 p-3 shadow-[0_10px_26px_rgba(14,165,233,0.12)]">
                                  <p className="text-[10px] uppercase tracking-wide text-purple-200/85">Bookings</p>
                                  <div className="mt-1 text-xl font-semibold text-white">63</div>
                                  <p className="text-[10px] text-white/55">+12% vs last week</p>
                                </div>
                              </div>
                              <div className="space-y-2.5 rounded-2xl border border-white/12 bg-white/10 p-3">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-[10px] uppercase tracking-wide text-purple-200/85">Next follow-up</p>
                                    <p className="mt-1 text-sm font-medium text-white">Hot lead · 4:30pm today</p>
                                  </div>
                                  <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2 py-1 text-[10px] font-semibold text-emerald-200">
                                    High intent
                                  </span>
                                </div>
                                <div className="space-y-2 text-[11px] text-white/70">
                                  <div className="flex items-start gap-2 rounded-2xl border border-white/12 bg-white/10 px-3 py-2">
                                    <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-300" />
                                    <div>
                                      <p className="font-medium text-white">Summary</p>
                                      <p className="text-white/60">“Caller ready to start trial tomorrow after emergency consult.”</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                                    <span className="text-white/80">Send hand-off email</span>
                                    <span className="text-[10px] text-white/55">Assigned to Maya</span>
                                  </div>
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
