import { cn } from '@/lib/utils'

export function CategoryIcon({ icon, color, size = 'md', className }: { icon: string; color: string; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const s = { sm: 'h-8 w-8 text-sm', md: 'h-10 w-10 text-base', lg: 'h-12 w-12 text-xl' }[size]
  return (
    <span
      className={cn('flex flex-shrink-0 items-center justify-center rounded-full', s, className)}
      style={{ backgroundColor: `color-mix(in srgb, ${color} 18%, transparent)`, boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${color} 30%, transparent)` }}
    >
      {icon}
    </span>
  )
}
