import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

/** Lime coin with a forest ring and dot. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('h-8 w-8', className)} aria-hidden>
      <circle cx="16" cy="16" r="16" fill="var(--color-primary-500)" />
      <circle cx="16" cy="16" r="8.5" fill="none" stroke="var(--color-forest)" strokeWidth="3.6" />
      <circle cx="16" cy="16" r="2.6" fill="var(--color-forest)" />
    </svg>
  )
}

export function Logo({ to = '/', className, compact, tone = 'dark' }: { to?: string; className?: string; compact?: boolean; tone?: 'dark' | 'light' }) {
  return (
    <Link to={to} className={cn('inline-flex items-center gap-2.5', className)} aria-label="PennyWise home">
      <LogoMark />
      {!compact && (
        <span className={cn('font-display text-[22px] font-black leading-none tracking-[-0.045em]', tone === 'light' ? 'text-white' : 'text-forest')}>
          PennyWise
        </span>
      )}
    </Link>
  )
}
