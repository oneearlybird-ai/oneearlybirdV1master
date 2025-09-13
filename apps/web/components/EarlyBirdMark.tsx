import React from 'react'

// Decorative bird mark sized to the cap-height. If a raster mark is present
// at /brand/bird.png, we prefer it for exact shape; otherwise a simple
// inline SVG fallback renders.
export default function EarlyBirdMark({ className = 'inline-block h-[1em] w-auto align-text-bottom' }: { className?: string }) {
  return (
    <picture>
      <source srcSet="/brand/bird@3x.png 3x, /brand/bird@2x.png 2x, /brand/bird.png 1x" />
      <img
        src="/brand/bird.png"
        className={className}
        alt=""
        aria-hidden="true"
        style={{ display: 'inline-block' }}
        onError={(e) => {
          // Fallback to inline SVG path if the raster is missing
          const el = e.currentTarget
          const svg = encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 40"><path fill="#F2C230" d="M19 6c7 0 13 4 15 9.4l6.2.1c1.1 0 1.8 1.3 1 2.2l-3.7 4.1c-.5.6-.5 1.5 0 2.1l3.7 4.1c.8.9.1 2.2-1 2.2h-6.2C32 35 26 39 19 39 9.6 39 2 31.9 2 21.8 2 11.7 9.6 6 19 6z"/><path fill="#F2C230" d="M45.5 17.3l2.8 2.7-2.8 2.7c-.7.7-1.9.2-1.9-.8v-3.8c0-1 1.2-1.5 1.9-.8z"/><circle cx="14.5" cy="18.5" r="1.8" fill="#111111"/></svg>'
          )
          el.src = `data:image/svg+xml;charset=utf8,${svg}`
        }}
      />
    </picture>
  )
}
