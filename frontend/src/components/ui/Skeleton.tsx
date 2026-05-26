import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'rectangular' | 'circular'
}

export function Skeleton({ className = '', variant = 'rectangular' }: SkeletonProps) {
  const variantClass = {
    text:         'rounded h-4',
    rectangular:  'rounded-lg',
    circular:     'rounded-full',
  }
  return <div className={cn('skeleton', variantClass[variant], className)} />
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return <div className={cn('skeleton rounded-xl', className)} />
}
