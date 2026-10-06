import { cn } from '@/lib/utils'

export function Skeleton({ className = '', variant = 'rectangular' }: { className?: string; variant?: 'text' | 'rectangular' | 'circular' }) {
  const variantClass = { text: 'h-4 rounded-md', rectangular: 'rounded-xl', circular: 'rounded-full' }
  return <div className={cn('skeleton', variantClass[variant], className)} />
}
