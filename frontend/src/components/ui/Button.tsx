import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Spinner } from './Spinner'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'soft' | 'light' | 'dark'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  iconOnly?: boolean
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-500 text-forest hover:bg-primary-400 shadow-[0_0_0_0_rgba(92,240,58,0)] hover:shadow-[0_8px_30px_-6px_rgba(92,240,58,0.55)]',
  secondary: 'bg-surface-3 text-text-primary hover:bg-line-strong',
  outline: 'border border-line-strong text-text-primary hover:border-primary-500 hover:text-primary-400',
  ghost: 'text-text-secondary hover:bg-surface-3 hover:text-text-primary',
  danger: 'bg-danger-500 text-white hover:bg-danger-600',
  soft: 'bg-primary-500/12 text-primary-400 hover:bg-primary-500/20',
  light: 'bg-cream text-forest hover:bg-white',
  dark: 'bg-forest text-white hover:bg-surface-3',
}

const sizes = {
  sm: 'h-9 px-4 text-[13px] gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-13 px-7 text-[15px] gap-2',
}

const iconOnlySizes = { sm: 'h-9 w-9', md: 'h-11 w-11', lg: 'h-13 w-13' }

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'primary', size = 'md', isLoading, disabled, icon, iconPosition = 'left', iconOnly, children, type = 'button', ...props },
    ref
  ) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex select-none items-center justify-center whitespace-nowrap rounded-full font-semibold tracking-[-0.01em]',
        'transition-all duration-200 ease-out active:scale-[0.97]',
        'disabled:pointer-events-none disabled:opacity-45',
        variants[variant],
        iconOnly ? cn(iconOnlySizes[size], 'p-0') : sizes[size],
        className
      )}
      {...props}
    >
      {isLoading ? <Spinner size="sm" color="current" /> : iconPosition === 'left' && icon}
      {children && <span>{children}</span>}
      {!isLoading && iconPosition === 'right' && icon}
    </button>
  )
)
Button.displayName = 'Button'
