import { AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Insight, Severity } from '@/types'

const severityStyle: Record<Severity, { icon: typeof Info; className: string }> = {
  warning: { icon: AlertTriangle, className: 'bg-warning-500/12 text-warning-500' },
  positive: { icon: CheckCircle2, className: 'bg-primary-500/12 text-primary-400' },
  info: { icon: Info, className: 'bg-info-500/12 text-info-500' },
}

export function InsightList({ insights }: { insights: Insight[] }) {
  return (
    <ul className="space-y-3">
      {insights.map((i, idx) => {
        const s = severityStyle[i.severity] ?? severityStyle.info
        return (
          <li key={idx} className="flex gap-3 rounded-[var(--radius-lg)] border border-line bg-surface-2/60 p-3.5">
            <span className={cn('flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full', s.className)}>
              <s.icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary">{i.title}</p>
              <p className="mt-0.5 text-[13px] leading-relaxed text-text-secondary">{i.body}</p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
