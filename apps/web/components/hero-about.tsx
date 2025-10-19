import Particles from './particles'

export default function HeroAbout() {
  return (
  <section className="relative">

    {/* Radial gradient */}
    <div className="absolute flex items-center justify-center top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 pointer-events-none -z-10 w-[800px] aspect-square" aria-hidden="true">
      <div className="absolute inset-0 translate-z-0 bg-purple-500 rounded-full blur-[120px] opacity-30"></div>
      <div className="absolute w-64 h-64 translate-z-0 bg-purple-400 rounded-full blur-[80px] opacity-70"></div>
    </div>

    {/* Particles animation */}
    <Particles className="absolute inset-0 h-96 -z-10" quantity={10} />

    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <div className="pt-32 pb-10 md:pt-40">

        {/* Hero content */}
        <div className="text-center">
          <div className="inline-flex font-medium bg-clip-text text-transparent bg-linear-to-r from-purple-500 to-purple-200 pb-3">Who we are</div>
          <h1 className="h1 bg-clip-text text-transparent bg-linear-to-r from-slate-200/60 via-slate-200 to-slate-200/60 pb-6">AI infrastructure for every service business</h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-white/70 md:text-lg">
            EarlyBird AI was founded in 2025 in Loudoun County, Virginia, the heart of the world’s data center corridor. We started with a simple belief: reliable, human-sounding AI reception should be accessible to any company, from solo operators to national brands. Today we build the platform that keeps phones answered, calendars synced, and teams informed.
          </p>
        </div>

      </div>
    </div>

  </section>
  )
}
