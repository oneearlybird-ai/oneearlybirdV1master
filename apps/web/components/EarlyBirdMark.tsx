import BirdMark from '@/components/ui/BirdMark'

// Decorative mark sized to the cap-height for inline brand accents.
export default function EarlyBirdMark({ className = 'inline-flex h-[1.1em] w-[1.1em] align-text-bottom' }: { className?: string }) {
  return <BirdMark className={className} size={28} alt="EarlyBird AI bird mark" />
}
