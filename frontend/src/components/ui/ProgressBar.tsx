import { cn } from '@/lib/utils'

/** Budget bar with an optional "pace" tick showing where spending should be today. */
export function ProgressBar({
  value,
  color,
  pace,
  className,
}: {
  /** 0..1+ (values over 1 render full and red) */
  value: number
  color?: string
  /** 0..1 expected progress marker */
  pace?: number
  className?: string
}) {
  const over = value > 1
  const fill = over ? 'var(--color-danger-500)' : color ?? 'var(--color-primary-500)'
  return (
    <div className={cn('relative h-2.5 w-full overflow-visible rounded-full bg-surface-3', className)}>
      <div
        className="h-full rounded-full transition-[width] duration-700 ease-out"
        style={{ width: `${Math.min(value, 1) * 100}%`, backgroundColor: fill, boxShadow: `0 0 12px ${fill}55` }}
      />
      {pace !== undefined && pace > 0 && pace < 1 && (
        <span
          className="absolute -top-1 h-[18px] w-0.5 rounded-full bg-text-primary/70"
          style={{ left: `${pace * 100}%` }}
          title="Where you'd be at an even pace"
        />
      )}
    </div>
  )
}
