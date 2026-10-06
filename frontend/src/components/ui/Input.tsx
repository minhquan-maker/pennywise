import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: ReactNode
  rightSlot?: ReactNode
}

export const fieldClass =
  'block w-full h-12 rounded-[var(--radius-md)] border border-line bg-surface-2 px-4 text-[15px] text-text-primary ' +
  'placeholder:text-text-tertiary transition-colors duration-150 ' +
  'hover:border-line-strong focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 ' +
  'disabled:cursor-not-allowed disabled:opacity-50'

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, leftIcon, rightSlot, ...props }, ref) => {
    const autoId = useId()
    const inputId = id || autoId
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-[13px] font-medium text-text-secondary">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary">{leftIcon}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              fieldClass,
              error && 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/10',
              leftIcon && 'pl-11',
              rightSlot && 'pr-12',
              className
            )}
            aria-invalid={error ? 'true' : undefined}
            {...props}
          />
          {rightSlot && <span className="absolute right-2 top-1/2 -translate-y-1/2">{rightSlot}</span>}
        </div>
        {error && <p className="text-xs text-danger-400">{error}</p>}
        {hint && !error && <p className="text-xs text-text-tertiary">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
