import Link from 'next/link'

export default function Logo() {
  return (
    <Link className="inline-flex items-center gap-2" href="/" aria-label="EarlyBird AI">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(99,102,241,0.25)]">
        EB
      </span>
      <span className="text-lg font-semibold tracking-tight text-white sm:text-xl">
        EarlyBird <span className="text-purple-300">AI</span>
      </span>
    </Link>
  )
}