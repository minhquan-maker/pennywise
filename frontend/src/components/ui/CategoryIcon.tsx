import { createElement } from 'react'
import { cn } from '@/lib/utils'
import { resolveCategoryIcon } from '@/lib/categoryIcons'

const SIZES = {
  xs: { box: 'h-5 w-5', icon: 'h-3 w-3' },
  sm: { box: 'h-8 w-8', icon: 'h-4 w-4' },
  md: { box: 'h-10 w-10', icon: 'h-[18px] w-[18px]' },
  lg: { box: 'h-12 w-12', icon: 'h-5 w-5' },
}

/** Line icon tinted with the category colour on a soft rounded tile. */
export function CategoryIcon({ icon, color, size = 'md', className }: { icon: string; color: string; size?: keyof typeof SIZES; className?: string }) {
  const s = SIZES[size]
  return (
    <span
      className={cn('flex flex-shrink-0 items-center justify-center rounded-[30%]', s.box, className)}
      style={{
        color,
        backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`,
        boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${color} 22%, transparent)`,
      }}
    >
      {createElement(resolveCategoryIcon(icon), { className: s.icon, strokeWidth: 1.9 })}
    </span>
  )
}
