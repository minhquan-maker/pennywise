import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outline' | 'light' | 'accent' | 'glow'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  interactive?: boolean
}

const variantClasses = {
  default: 'bg-surface border border-line',
  elevated: 'bg-surface-2 border border-line-strong/60 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)]',
  outline: 'border border-line bg-transparent',
  light: 'bg-cream text-forest border border-cream-2',
  accent: 'bg-primary-500 text-forest',
  glow:
    'bg-[radial-gradient(120%_120%_at_100%_0%,rgba(61,217,160,0.18),transparent_55%),var(--color-surface)] border border-line',
}

const paddingMap = { none: '', sm: 'p-4', md: 'p-5 sm:p-6', lg: 'p-6 sm:p-8' }

export function Card({ children, className, variant = 'default', padding = 'md', interactive, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'relative rounded-[var(--radius-2xl)]',
        variantClasses[variant],
        paddingMap[padding],
        interactive && 'cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  title,
  subtitle,
  icon,
  action,
  className,
}: {
  title: ReactNode
  subtitle?: ReactNode
  icon?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-5 flex items-start justify-between gap-3', className)}>
      <div className="flex min-w-0 items-center gap-3">
        {icon && (
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary-500/10 text-primary-400">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h2 className="truncate text-[15px] font-semibold text-text-primary">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-text-tertiary">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}
