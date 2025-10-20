import type { SVGProps } from 'react'

export default function BirdMark({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path
        d="M47 17.25c-7.2-3.6-18.1-2.15-24.75 4.55C15.6 28.4 13.5 37.35 18.7 44.25l-6.25 7.5c-1.02 1.22.38 3.02 1.86 2.56l9.95-3.04 5.82 7.03c.84 1.01 2.53.46 2.68-.84l.56-9.83 10.9 4.36c1.37.55 2.59-.98 1.88-2.21L41 41.5c5.72-1.64 10.64-5.73 12.08-11.39 1.04-3.87.21-7.72-2.51-10.86"
        stroke="currentColor"
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22.75 32.25c5.5-5.3 13.1-8.4 21.5-8.4L33.5 36l14.75 3.7"
        stroke="currentColor"
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
