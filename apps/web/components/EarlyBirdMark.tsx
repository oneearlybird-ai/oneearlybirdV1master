import React from 'react'

// EarlyBird bird mark — solid, no background. Dimensions scale with height.
// The geometry is tuned to match the brand raster provided (ratio ~1.25:1).
// Color: brand yellow (#F2C230). Eye: near-black.
export default function EarlyBirdMark({ className = 'inline-block h-[1em] w-auto align-text-bottom' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 50 40"
      aria-hidden="true"
      focusable="false"
      role="img"
    >
      {/* Body */}
      <path
        fill="#F2C230"
        d="M19 6c7 0 13 4 15 9.4l6.2 0.1c1.1 0 1.8 1.3 1 2.2l-3.7 4.1c-0.5 0.6-0.5 1.5 0 2.1l3.7 4.1c0.8 0.9 0.1 2.2-1 2.2h-6.2C32 35 26 39 19 39 9.6 39 2 31.9 2 21.8 2 11.7 9.6 6 19 6z"
      />
      {/* Beak */}
      <path fill="#F2C230" d="M45.5 17.3l2.8 2.7-2.8 2.7c-0.7 0.7-1.9 0.2-1.9-0.8v-3.8c0-1 1.2-1.5 1.9-0.8z" />
      {/* Eye */}
      <circle cx="14.5" cy="18.5" r="1.8" fill="#111111" />
      {/* Wing (subtle) */}
      <circle cx="22.5" cy="22.5" r="4.2" fill="#E7B820" />
    </svg>
  )
}
