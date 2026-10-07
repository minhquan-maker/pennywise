import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode
  title: string
  description?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center px-6 py-12 text-center', className)}>
      {icon && (
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-forest">{icon}</div>
      )}
      <p className="text-base font-semibold text-text-primary">{title}</p>
      {description && <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-text-secondary">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
