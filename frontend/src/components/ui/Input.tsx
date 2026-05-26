import { forwardRef, InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  variant?: 'default' | 'filled'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, leftIcon, rightIcon, variant = 'default', ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-')
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'block w-full rounded-lg border text-sm text-text-primary',
              'placeholder:text-text-tertiary',
              'transition-all duration-fast',
              // Default variant
              variant === 'default' && [
                'border-surface-border bg-surface-0',
                'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
                'disabled:cursor-not-allowed disabled:bg-surface-50 disabled:text-text-tertiary',
              ],
              // Filled variant
              variant === 'filled' && [
                'bg-surface-100 border-transparent',
                'focus:bg-surface-0 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
                'disabled:cursor-not-allowed disabled:bg-surface-200 disabled:text-text-tertiary',
              ],
              // Error
              error && 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20',
              // Icon padding
              leftIcon && 'ps-10',
              rightIcon && 'pe-10',
              className
            )}
            aria-invalid={error ? 'true' : undefined}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none">
              {rightIcon}
            </span>
          )}
        </div>
        {error && <p className="text-sm text-danger-500">{error}</p>}
        {hint && !error && <p className="text-sm text-text-tertiary">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
