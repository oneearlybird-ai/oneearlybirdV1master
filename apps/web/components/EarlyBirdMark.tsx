import React from 'react'

// Decorative mark sized to the cap-height for inline brand accents.
export default function EarlyBirdMark({ className = 'inline-flex h-[1em] min-w-[1.75em] items-center justify-center rounded-md bg-purple-500/20 px-1 text-xs font-semibold text-purple-200 align-text-bottom' }: { className?: string }) {
  return (
    <span className={className} aria-hidden="true">
      EB
    </span>
  )
}
