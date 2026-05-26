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

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        sizeClasses[size],
        variant === 'soft'    && 'bg-[color:_color] bg-opacity-15',
        variant === 'solid'   && 'bg-[color:_color] text-white',
        variant === 'outline' && 'border bg-transparent',
        className
      )}
      style={{ color, borderColor: variant === 'outline' ? color : undefined }}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />}
      {icon}
      <span>{label}</span>
    </span>
  )
}
