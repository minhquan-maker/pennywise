import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'bordered' | 'glass'
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const variantClasses = {
  default:  'bg-surface-0 border border-surface-border shadow-sm',
  elevated: 'bg-surface-0 shadow-md border border-surface-100',
  bordered: 'bg-surface-0 border-2 border-surface-border',
  glass:    'glass-card',
}

const paddingMap = {
  none: '',
  sm:   'p-3',
  md:   'p-5',
  lg:   'p-6',
}

export function Card({ children, className, variant = 'default', hover = false, padding = 'md', ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl transition-all duration-200',
        variantClasses[variant],
        hover && 'hover:shadow-lg hover:-translate-y-0.5 cursor-pointer',
        paddingMap[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

Card.Header = function CardHeader({
  children,
  className,
  action,
}: {
  children?: ReactNode
  className?: string
  action?: ReactNode
}) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      {typeof children === 'string'
        ? <h3 className="text-base font-semibold text-text-primary">{children}</h3>
        : children}
      {action}
    </div>
  )
}

Card.Body = function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('space-y-4', className)}>{children}</div>
}

Card.Footer = function CardFooter({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('pt-4 border-t border-surface-100 mt-4', className)}>{children}</div>
}
