import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement> & { size?: number };

function cnSize(size?: number) {
  const s = size ?? 20;
  return { width: s, height: s };
}

export function ClockIcon({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...cnSize(size)} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function CalendarIcon({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...cnSize(size)} {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

export function CrmIcon({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...cnSize(size)} {...props}>
      <rect x="3" y="6" width="7" height="12" rx="2" />
      <rect x="14" y="6" width="7" height="12" rx="2" />
      <path d="M10 12h4" />
    </svg>
  );
}

export function SavingsIcon({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...cnSize(size)} {...props}>
      <path d="M4 15a8 8 0 1 0 8-8" />
      <path d="M4 15h4a4 4 0 0 0 4-4V3" />
    </svg>
  );
}

export function PlugIcon({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...cnSize(size)} {...props}>
      <path d="M9 7v4M15 7v4" />
      <path d="M7 11h10v2a5 5 0 0 1-5 5 5 5 0 0 1-5-5v-2Z" />
      <path d="M12 18v3" />
    </svg>
  );
}

export function PhoneIcon({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...cnSize(size)} {...props}>
      <path d="M22 16.92v2a2 2 0 0 1-2.18 2 19 19 0 0 1-8.26-3.07 19 19 0 0 1-6-6.06A19 19 0 0 1 2.92 4.18 2 2 0 0 1 4.86 2h2a2 2 0 0 1 2 1.72c.12.87.33 1.72.63 2.54a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.54-1.54a2 2 0 0 1 2.11-.45c.82.3 1.67.51 2.54.63A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export function CheckIcon({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...cnSize(size)} {...props}>
      <path d="m20 6-11 11-5-5" />
    </svg>
  );
}

export function VoiceIcon({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...cnSize(size)} {...props}>
      <rect x="3" y="8" width="6" height="8" rx="2" />
      <rect x="10" y="5" width="4" height="14" rx="2" />
      <rect x="16" y="10" width="5" height="4" rx="2" />
    </svg>
  );
}

export function BoltIcon({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...cnSize(size)} {...props}>
      <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
    </svg>
  );
}

export function LockIcon({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...cnSize(size)} {...props}>
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function ControlsIcon({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...cnSize(size)} {...props}>
      <path d="M4 21v-7" />
      <path d="M4 10V3" />
      <path d="M12 21v-9" />
      <path d="M12 8V3" />
      <path d="M20 21v-5" />
      <path d="M20 12V3" />
      <circle cx="4" cy="12" r="2" />
      <circle cx="12" cy="8" r="2" />
      <circle cx="20" cy="16" r="2" />
    </svg>
  );
}

