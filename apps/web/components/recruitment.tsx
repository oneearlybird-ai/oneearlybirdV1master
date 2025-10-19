const steps = [
  {
    title: 'Gather your playbook',
    description: 'Share call flows, FAQs, calendars, and integrations. Our team loads everything into EarlyBird and sets up test numbers within 24 hours.',
  },
  {
    title: 'Train & preview',
    description: 'Review sample conversations, tune answers, and confirm routing rules. Invite teammates to listen in and leave feedback.',
  },
  {
    title: 'Go live with confidence',
    description: 'Flip the switch on a schedule, monitor in real time, and adjust in the dashboard. We stay on-call to support your launch.',
  },
];

const assurances = [
  {
    title: 'Security baked in',
    body: 'Tenant isolation, encryption in transit and at rest, and detailed access logs keep every conversation under your control.',
  },
  {
    title: 'Human partnership',
    body: 'Product specialists help configure, monitor quality, and surface coaching opportunities so you always know how the receptionist is performing.',
  },
  {
    title: 'Iteration speed',
    body: 'Update answers, hours, or integrations in minutes. Ship new skills without code and roll back instantly if something changes.',
  },
];

export default function Recruitment() {
  return (
    <section className="relative">
      {/* Blurred shape */}
      <div className="absolute top-0 -translate-y-1/3 left-1/2 -translate-x-1/2 ml-24 blur-2xl opacity-50 pointer-events-none -z-10" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" width="434" height="427">
          <defs>
            <linearGradient id="about-launch-a" x1="19.609%" x2="50%" y1="14.544%" y2="100%">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path fill="url(#about-launch-a)" fillRule="evenodd" d="m410 0 461 369-284 58z" transform="matrix(1 0 0 -1 -410 427)" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="py-12 md:py-20 border-t [border-image:linear-gradient(to_right,transparent,var(--color-slate-800),transparent)1]">
          {/* Section header */}
          <div className="max-w-3xl mx-auto text-center pb-12 md:pb-16">
            <h2 className="h2 bg-clip-text text-transparent bg-linear-to-r from-slate-200/60 via-slate-200 to-slate-200/60 pb-4">
              Launch in days, not months
            </h2>
            <p className="text-lg text-slate-400">
              EarlyBird’s rollout playbook ensures your AI receptionist sounds like your best operator from the first live call.
            </p>
          </div>

          <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-10">
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div key={step.title} className="rounded-3xl border border-white/10 bg-white/[0.05] p-6">
                  <div className="flex items-center gap-3 text-sm font-semibold text-white/80">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70">{index + 1}</span>
                    {step.title}
                  </div>
                  <p className="mt-3 text-sm text-white/65">{step.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 space-y-4 lg:mt-0">
              {assurances.map((item) => (
                <div key={item.title} className="rounded-3xl border border-white/10 bg-white/[0.08] p-6 shadow-[0_18px_38px_rgba(15,14,32,0.45)]">
                  <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-xs text-white/60 md:text-sm">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
