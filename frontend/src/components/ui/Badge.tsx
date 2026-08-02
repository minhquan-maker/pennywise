import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps {
  icon?: ReactNode
  label: string
  color: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'soft' | 'solid' | 'outline'
  dot?: boolean
}

export function Badge({ icon, label, color, className, size = 'md', variant = 'soft', dot }: BadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  }

  const isVarColor = color.startsWith('var(')

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        sizeClasses[size],
        className
      )}
      style={{
        color,
        backgroundColor: variant === 'soft' ? (isVarColor ? `color-mix(in srgb, ${color} 15%, transparent)` : `${color}26`) : undefined,
        ...(variant === 'solid' ? { backgroundColor: color, color: '#fff' } : {}),
        ...(variant === 'outline' ? { border: `1px solid ${color}`, backgroundColor: 'transparent' } : {}),
      }}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />}
      {icon}
      <span>{label}</span>
    </span>
  )
}
