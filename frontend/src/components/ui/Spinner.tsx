import { cn } from '@/lib/utils'

interface SpinnerProps {
  className?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  color?: 'primary' | 'current' | 'muted'
}

const sizeMap = { xs: 'h-3 w-3', sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' }
const colorMap = { primary: 'text-primary-500', current: 'text-current', muted: 'text-text-tertiary' }

export function Spinner({ className = '', size = 'md', color = 'primary' }: SpinnerProps) {
  return (
    <span role="status" className="inline-flex items-center justify-center">
      <svg className={cn(sizeMap[size], colorMap[color], 'animate-spin', className)} viewBox="0 0 24 24" fill="none">
        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
        <path className="opacity-90" d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <span className="sr-only">Loading…</span>
    </span>
  )
}
