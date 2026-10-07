import { createElement } from 'react'
import { cn } from '@/lib/utils'
import { resolveCategoryIcon } from '@/lib/categoryIcons'

const SIZES = {
  xs: { box: 'h-5 w-5', icon: 'h-3 w-3' },
  sm: { box: 'h-8 w-8', icon: 'h-4 w-4' },
  md: { box: 'h-10 w-10', icon: 'h-[18px] w-[18px]' },
  lg: { box: 'h-12 w-12', icon: 'h-5 w-5' },
}

/** Line icon in the category colour on a soft circular disc (stroke deepened so light hues stay legible on white). */
export function CategoryIcon({ icon, color, size = 'md', className }: { icon: string; color: string; size?: keyof typeof SIZES; className?: string }) {
  const s = SIZES[size]
  return (
    <span
      className={cn('flex flex-shrink-0 items-center justify-center rounded-full', s.box, className)}
      style={{
        color: `color-mix(in srgb, ${color} 82%, #0e0f0c)`,
        backgroundColor: `color-mix(in srgb, ${color} 16%, white)`,
      }}
    >
      {createElement(resolveCategoryIcon(icon), { className: s.icon, strokeWidth: 1.9 })}
    </span>
  )
}
