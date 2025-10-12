"use client";

export function MicrochipHeroOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-90">
      <svg width="200" height="128" viewBox="0 0 180 120" aria-hidden>
        <defs>
          <filter id="chipGlowHero" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect x="20" y="16" width="140" height="88" rx="8" ry="8" fill="#0f1218" stroke="#1b2230" strokeWidth="2" filter="url(#chipGlowHero)" />
        {Array.from({ length: 12 }).map((_, i) => (
          <rect key={`pl-${i}`} x="10" y={22 + i * 6} width="10" height="3" fill="#1b2230" />
        ))}
        {Array.from({ length: 12 }).map((_, i) => (
          <rect key={`pr-${i}`} x="160" y={22 + i * 6} width="10" height="3" fill="#1b2230" />
        ))}
      </svg>
    </div>
  );
}

