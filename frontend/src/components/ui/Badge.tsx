import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps {
  label: ReactNode
  /** Any CSS color; tints the badge */
  color?: string
  icon?: ReactNode
  className?: string
  size?: 'sm' | 'md'
  dot?: boolean
}

export function Badge({ icon, label, color = 'var(--color-positive)', className, size = 'md', dot }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-semibold',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        className
      )}
      style={{ color, backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)` }}
    >
      {dot && <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-current" />}
      {icon}
      {label}
    </span>
  )
}
