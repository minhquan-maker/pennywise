import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outline' | 'fog' | 'accent' | 'forest'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  interactive?: boolean
}

// Flat surfaces: hairline white cards, borderless fog wells, and the inverted forest card for emphasis
const variantClasses = {
  default: 'bg-surface border border-line',
  elevated: 'bg-surface border border-line shadow-[var(--shadow-lift)]',
  outline: 'border border-line bg-transparent',
  fog: 'bg-surface-3',
  accent: 'bg-primary-500 text-forest',
  forest: 'bg-forest text-white',
}

const paddingMap = { none: '', sm: 'p-4', md: 'p-5 sm:p-6', lg: 'p-6 sm:p-8' }

export function Card({ children, className, variant = 'default', padding = 'md', interactive, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'relative rounded-[var(--radius-2xl)]',
        variantClasses[variant],
        paddingMap[padding],
        interactive && 'cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-forest/40 hover:shadow-[var(--shadow-lift)]',
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
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-forest">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold tracking-[-0.011em] text-text-primary">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-text-tertiary">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}
