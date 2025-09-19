import React from 'react'

// Decorative bird mark sized to the cap-height. If a raster mark is present
// at /brand/bird.png, we prefer it for exact shape; otherwise a simple
// inline SVG fallback renders.
export default function EarlyBirdMark({ className = 'inline-block h-[1em] w-auto align-text-bottom' }: { className?: string }) {
  return (
    <img
      srcSet="/brand/bird.png 1x, /brand/bird@2x.png 2x, /brand/bird@3x.png 3x"
      src="/brand/bird.png"
      className={className}
      alt=""
      aria-hidden="true"
      style={{ display: 'inline-block' }}
    />
  )
}
