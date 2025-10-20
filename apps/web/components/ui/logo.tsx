import Link from 'next/link'
import BirdMark from './BirdMark'

export default function Logo() {
  return (
    <Link className="inline-flex items-center gap-2" href="/" aria-label="EarlyBird AI">
      <BirdMark className="h-9 w-9 text-purple-300" />
      <span className="text-lg font-semibold tracking-tight text-white sm:text-xl">
        EarlyBird <span className="text-purple-300">AI</span>
      </span>
    </Link>
  )
}
