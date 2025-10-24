import Image from 'next/image'

type BirdMarkProps = {
  className?: string
  size?: number
  alt?: string
}

export default function BirdMark({ className, size = 36, alt = 'EarlyBird AI mark' }: BirdMarkProps) {
  return (
    <Image
      src="/brand/EarlyBirdAIbrandlogo.png"
      alt={alt}
      width={size}
      height={size}
      className={className}
      priority={false}
    />
  )
}
