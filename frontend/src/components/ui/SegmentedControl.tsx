import { cn } from '@/lib/utils'

interface SegmentedControlProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string }[]
  className?: string
  size?: 'sm' | 'md'
}

export function SegmentedControl<T extends string>({ value, onChange, options, className, size = 'md' }: SegmentedControlProps<T>) {
  return (
    <div role="tablist" className={cn('inline-flex rounded-full border border-line bg-surface-2 p-1', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          type="button"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'flex-1 rounded-full font-semibold transition-all duration-200',
            size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-[13px]',
            value === o.value ? 'bg-primary-500 text-forest shadow-sm' : 'text-text-secondary hover:text-text-primary'
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
