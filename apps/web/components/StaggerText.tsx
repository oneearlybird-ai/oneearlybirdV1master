type Props = {
  text: string
  className?: string
  totalSteps?: number // number of delay slots available in CSS (defaults to 60)
}

export default function StaggerText({ text, className = '', totalSteps = 60 }: Props) {
  const chars = Array.from(text)
  const n = Math.max(1, chars.length)
  return (
    <span className={`eb-stagger ${className}`} aria-label={text}>
      {chars.map((ch, i) => {
        // Map to delay slot 0..totalSteps
        const slot = Math.min(totalSteps, Math.round((i / n) * totalSteps))
        const key = `${i}-${ch === ' ' ? 'space' : ch}`
        return (
          <span key={key} className={`eb-i-${slot}`}>
            {ch === ' ' ? '\u00A0' : ch}
          </span>
        )
      })}
    </span>
  )
}

