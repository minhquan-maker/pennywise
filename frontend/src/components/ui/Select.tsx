import { forwardRef, SelectHTMLAttributes, ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Spinner } from './Spinner'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  leftIcon?: ReactNode
  variant?: 'default' | 'filled'
  loading?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, leftIcon, variant = 'default', loading, children, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s/g, '-')
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none z-10">
              {leftIcon}
            </span>
          )}
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'block w-full rounded-lg border text-sm text-text-primary appearance-none pr-10',
              'transition-all duration-fast',
              variant === 'default' && [
                'border-surface-border bg-surface-0',
                'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
                'disabled:cursor-not-allowed disabled:bg-surface-50 disabled:text-text-tertiary',
              ],
              variant === 'filled' && [
                'bg-surface-100 border-transparent',
                'focus:bg-surface-0 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
                'disabled:cursor-not-allowed disabled:bg-surface-200 disabled:text-text-tertiary',
              ],
              error && 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20',
              leftIcon && 'ps-10',
              className
            )}
            disabled={loading || props.disabled}
            {...props}
          >
            {children}
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none z-10">
            {loading ? <Spinner size="sm" /> : <ChevronDown className="h-4 w-4" />}
          </span>
        </div>
        {error && <p className="text-sm text-danger-500">{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'
