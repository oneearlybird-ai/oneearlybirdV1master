export default function Story() {
  return (
    <section className="relative">

      {/* Blurred shape */}
      <div className="absolute top-0 -mt-32 left-1/2 -translate-x-1/2 ml-10 blur-2xl opacity-70 pointer-events-none -z-10" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" width="434" height="427">
          <defs>
            <linearGradient id="bs4-a" x1="19.609%" x2="50%" y1="14.544%" y2="100%">
              <stop offset="0%" stopColor="#A855F7"></stop>
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0"></stop>
            </linearGradient>
          </defs>
          <path fill="url(#bs4-a)" fillRule="evenodd" d="m0 0 461 369-284 58z" transform="matrix(1 0 0 -1 0 427)"></path>
        </svg>
      </div>

      <div className="px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="pb-12 md:pb-20">

            {/* Section header */}
            <div className="max-w-3xl mx-auto text-center pb-12 md:pb-20">
              <h2 className="h2 bg-clip-text text-transparent bg-linear-to-r from-slate-200/60 via-slate-200 to-slate-200/60">Built for operators from day one</h2>
            </div>

            <div className="max-w-3xl mx-auto text-slate-400 space-y-6">
              <p>
                EarlyBird AI was founded in 2025 near Loudoun County, Virginia, the data center capital of the world. Surrounded by massive infrastructure, we saw local home services, healthcare, and logistics teams still juggling ringing phones and missed opportunities. We knew AI could close that gap without sacrificing the personal touch customers expect.
              </p>
              <p>
                The first version of EarlyBird answered a single HVAC line. Within days it was booking jobs after hours, sending summaries to Slack, and giving the owner proof of every conversation. Word spread and more businesses asked for the same superpower: a receptionist that never sleeps, speaks like the brand, and respects their existing workflows.
              </p>
              <p>
                Today EarlyBird powers thousands of conversations every week. We focus on three principles: <strong className="text-slate-50 font-medium">sound human, integrate deeply, and provide evidence</strong>. Every transcript, tag, and booking is auditable so operators can trust the AI they deploy.
              </p>
              <p>
                We remain a small, product-obsessed company dedicated to the operators who keep phones ringing and calendars full. If your team is stretched thin or you simply refuse to miss another call, EarlyBird is for you.
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
