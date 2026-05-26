import { cn } from '@/lib/utils'

interface SpinnerProps {
  className?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  color?: 'primary' | 'white' | 'slate'
}

const sizeMap = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
}

const colorMap = {
  primary: 'text-primary-500',
  white:   'text-white',
  slate:   'text-text-tertiary',
}

export function Spinner({ className = '', size = 'md', color = 'primary' }: SpinnerProps) {
  return (
    <div role="status" className="inline-flex items-center justify-center">
      <svg
        className={cn(sizeMap[size], colorMap[color], 'animate-spin', className)}
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  )
}
