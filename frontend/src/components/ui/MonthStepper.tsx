import { ChevronLeft, ChevronRight } from 'lucide-react'
import { addMonths, cn, formatMonth, getCurrentMonth } from '@/lib/utils'

/** ‹ October 2026 › — never steps past the current month. */
export function MonthStepper({ value, onChange, className }: { value: string; onChange: (m: string) => void; className?: string }) {
  const current = getCurrentMonth()
  const atLatest = value >= current
  return (
    <div className={cn('inline-flex items-center rounded-full bg-surface-3 p-1', className)}>
      <button
        type="button"
        onClick={() => onChange(addMonths(value, -1))}
        aria-label="Previous month"
        className="flex h-8 w-8 items-center justify-center rounded-full text-forest transition-colors hover:bg-surface"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onChange(current)}
        title="Jump to this month"
        className="min-w-[8.5rem] px-2 text-center text-[13px] font-semibold text-forest"
      >
        {formatMonth(value)}
      </button>
      <button
        type="button"
        onClick={() => onChange(addMonths(value, 1))}
        disabled={atLatest}
        aria-label="Next month"
        className="flex h-8 w-8 items-center justify-center rounded-full text-forest transition-colors hover:bg-surface disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}
