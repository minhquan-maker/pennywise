import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Skeleton } from './Skeleton'

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = 'default',
  loading,
  className,
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
  icon?: ReactNode
  tone?: 'default' | 'positive' | 'negative' | 'accent'
  loading?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-2xl)] border p-5',
        tone === 'accent' ? 'border-transparent bg-primary-500 text-forest' : 'border-line bg-surface',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className={cn('text-[13px] font-medium', tone === 'accent' ? 'text-forest/70' : 'text-text-secondary')}>{label}</p>
        {icon && (
          <span className={cn('flex h-8 w-8 items-center justify-center rounded-full', tone === 'accent' ? 'bg-forest/10' : 'bg-surface-3 text-text-secondary')}>
            {icon}
          </span>
        )}
      </div>
      {loading ? (
        <Skeleton className="mt-3 h-8 w-32" />
      ) : (
        <p
          className={cn(
            'num mt-2 truncate text-xl font-bold leading-tight sm:text-[28px]',
            tone === 'positive' && 'text-primary-400',
            tone === 'negative' && 'text-danger-400',
            tone === 'default' && 'text-text-primary'
          )}
        >
          {value}
        </p>
      )}
      {hint && <div className={cn('mt-1.5 text-xs', tone === 'accent' ? 'text-forest/70' : 'text-text-tertiary')}>{hint}</div>}
    </div>
  )
}
