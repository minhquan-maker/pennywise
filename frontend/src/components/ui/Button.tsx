import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Spinner } from './Spinner'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'gradient' | 'outline' | 'soft' | 'cta'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  iconOnly?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading,
      disabled,
      icon,
      iconPosition = 'left',
      iconOnly = false,
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary:   'btn-primary',
      secondary: 'btn-secondary',
      danger:    'btn-danger',
      ghost:     'btn-ghost',
      gradient:  'btn-gradient',
      outline:   'btn-outline',
      soft:      'btn-soft',
      cta:       'btn-cta',
    }
    const sizes = {
      sm: 'btn-sm',
      md: '',
      lg: 'btn-lg',
    }

    const iconOnlySize = iconOnly
      ? size === 'sm' ? '!w-8 !h-8 !p-0'
      : size === 'lg' ? '!w-12 !h-12 !p-0'
      : '!w-10 !h-10 !p-0'
      : ''

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'btn',
          variants[variant],
          sizes[size],
          iconOnlySize,
          className
        )}
        {...props}
      >
        {isLoading && <Spinner size="sm" />}
        {!isLoading && icon && iconPosition === 'left' && icon}
        {!isLoading && children && <span>{children}</span>}
        {!isLoading && icon && iconPosition === 'right' && icon}
      </button>
    )
  }
)
Button.displayName = 'Button'
