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
  // Lime fill + forest ink: the one "do this next" action per view
  primary: 'bg-primary-500 text-forest hover:bg-primary-600',
  secondary: 'bg-surface-3 text-forest hover:bg-line-strong/70',
  outline: 'border border-forest bg-surface text-forest hover:bg-primary-100',
  ghost: 'text-text-secondary hover:bg-surface-3 hover:text-text-primary',
  danger: 'bg-danger-500 text-white hover:bg-danger-600',
  soft: 'bg-primary-100 text-forest hover:bg-primary-200',
  // For forest sections
  light: 'bg-white text-forest hover:bg-primary-100',
  dark: 'bg-forest text-white hover:bg-forest/90',
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
        'inline-flex select-none items-center justify-center whitespace-nowrap rounded-full font-semibold tracking-[-0.011em]',
        'transition-colors duration-150 ease-out active:scale-[0.97]',
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
