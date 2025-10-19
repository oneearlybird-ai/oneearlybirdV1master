import Image from 'next/image'
import Team from '@/public/images/team.jpg'

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
              <h2 className="h2 bg-clip-text text-transparent bg-linear-to-r from-slate-200/60 via-slate-200 to-slate-200/60">Our story (so far)</h2>
            </div>

            <div className="md:flex justify-between space-x-6 md:space-x-8 lg:space-x-14">
              <figure className="min-w-[240px]">
                <Image className="sticky top-8 mx-auto mb-12 md:mb-0 rounded-lg -rotate-[4deg]" src={Team} width={420} height={280} alt="Team" />
              </figure>
              <div className="max-w-[548px] mx-auto">
                <div className="text-slate-400 space-y-6">
                  <p>
                    EarlyBird AI started as a small experiment inside a service business that could never keep up with the phone. Missed calls meant missed revenue, so we built an assistant that sounds like our best operator and never sleeps.
                  </p>
                  <p>
                    Today that assistant powers hundreds of support and sales teams. <strong className="text-slate-50 font-medium">We combine natural conversation, live CRM context, and booking automations</strong> so every caller is greeted, qualified, and routed in seconds.
                  </p>
                  <p>
                    The product keeps learning from every interaction. Customers can review recordings, tweak flows, and launch new skills without touching a line of code. EarlyBird AI becomes a true teammate that scales with your business.
                  </p>
                  <p>
                    Our team ships fast, listens obsessively, and treats reliability as a feature. Whether you run a boutique agency or a national home services brand, EarlyBird AI gives you the confidence that someone trustworthy is always answering.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}