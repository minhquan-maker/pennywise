import { useId } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function LogoMark({ className }: { className?: string }) {
  // Unique id per instance: a gradient referenced from a display:none copy would not render
  const id = useId()
  return (
    <svg viewBox="0 0 32 32" className={cn('h-8 w-8', className)} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c8f5e2" />
          <stop offset=".5" stopColor="#3dd9a0" />
          <stop offset="1" stopColor="#1f9e71" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="11" fill="none" stroke={`url(#${id})`} strokeWidth="4.5" />
      <circle cx="16" cy="16" r="3.2" fill="#3dd9a0" />
    </svg>
  )
}

export function Logo({ to = '/', className, compact }: { to?: string; className?: string; compact?: boolean }) {
  return (
    <Link to={to} className={cn('inline-flex items-center gap-2.5', className)} aria-label="PennyWise home">
      <LogoMark />
      {!compact && <span className="display text-[22px] leading-none tracking-wide text-text-primary">PennyWise</span>}
    </Link>
  )
}
