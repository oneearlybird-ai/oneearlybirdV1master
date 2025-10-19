export default function Faqs() {
  return (
  <section className="relative">

    {/* Blurred shape */}
    <div className="absolute top-0 -translate-y-1/3 left-1/2 -translate-x-1/2 ml-24 blur-2xl opacity-50 pointer-events-none -z-10" aria-hidden="true">
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
      <div className="py-12 md:py-20 border-t [border-image:linear-gradient(to_right,transparent,var(--color-slate-800),transparent)1]">

        {/* Section header */}
        <div className="max-w-3xl mx-auto text-center pb-12 md:pb-20">
          <div>
            <div className="inline-flex font-medium bg-clip-text text-transparent bg-linear-to-r from-purple-500 to-purple-200 pb-3">Getting started with EarlyBird AI</div>
          </div>
          <h2 className="h2 bg-clip-text text-transparent bg-linear-to-r from-slate-200/60 via-slate-200 to-slate-200/60 pb-4">Everything you need to know</h2>
        </div>

        {/* Columns */}
        <div className="md:flex md:space-x-12 space-y-8 md:space-y-0">

          {/* Column */}
          <div className="w-full md:w-1/2 space-y-8">

            {/* Item */}
            <div className="space-y-2">
              <h4 className="font-semibold">What is EarlyBird AI?</h4>
              <p className="text-slate-400">EarlyBird AI is a virtual front-desk teammate that answers every call with human-like clarity. We equip service-focused teams with an AI receptionist that can greet callers, qualify opportunities, and keep schedules full without adding headcount.</p>
            </div>

            {/* Item */}
            <div className="space-y-2">
              <h4 className="font-semibold">How quickly can I launch EarlyBird AI?</h4>
              <p className="text-slate-400">You can be live in minutes. Create your account, choose the plan that matches your call volume, and toggle call forwarding inside the dashboard. Flip it on when you want coverage, switch it off when your team is available, and never miss a lead again.</p>
            </div>

            {/* Item */}
            <div className="space-y-2">
              <h4 className="font-semibold">Can I customize the EarlyBird AI experience?</h4>
              <p className="text-slate-400">Absolutely. Set operating hours for 24/7 coverage or business-hour routing, upload service menus and pricing, and plug into the CRMs and calendars your team already uses. EarlyBird AI follows your brand voice while booking, rescheduling, or canceling appointments on cue.</p>
            </div>

          </div>

          {/* Column */}
          <div className="w-full md:w-1/2 space-y-8">

            {/* Item */}
            <div className="space-y-2">
              <h4 className="font-semibold">How does EarlyBird AI safeguard caller information?</h4>
              <p className="text-slate-400">We only gather the essentials needed to help each caller, store every interaction securely, and surface it back to you as clean call summaries. Role-based access and audit trails keep your team informed while protecting sensitive details.</p>
            </div>

            {/* Item */}
            <div className="space-y-2">
              <h4 className="font-semibold">Can I trial EarlyBird AI for free?</h4>
              <p className="text-slate-400">Yes, start with a 14-day trial that includes 100 minutes of talk time. Explore the dashboard, fine-tune your agent, and if you cancel before the window closes—or before you exceed the minutes—you will not be charged.</p>
            </div>

            {/* Item */}
            <div className="space-y-2">
              <h4 className="font-semibold">Is EarlyBird AI affordable for small businesses?</h4>
              <p className="text-slate-400">Definitely. EarlyBird AI captures calls, books revenue-generating appointments, and handles routine questions so your in-person staff can focus on walk-ins. Predictable pricing delivers a return that beats the cost of missed calls or additional hires.</p>
            </div>

          </div>

        </div>

      </div>
    </div>
  </section>
  )
}
