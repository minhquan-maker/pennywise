import { useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { CHART } from './theme'
import type { CategoryTotal } from '@/types'

/** Donut + legend list. Identity is never colour-only: every slice is named in the legend with its share. */
export function CategoryDonut({ data, currency, centerLabel = 'Spent' }: { data: CategoryTotal[]; currency: string; centerLabel?: string }) {
  const [active, setActive] = useState<number | null>(null)
  const total = data.reduce((s, d) => s + d.total, 0)
  // Fold the tail into "Other" so the donut stays readable
  const head = data.slice(0, 6)
  const tail = data.slice(6)
  const slices = tail.length
    ? [...head, { id: 'other', name: `Other (${tail.length})`, icon: '•', color: '#8a958c', total: tail.reduce((s, d) => s + d.total, 0), share: tail.reduce((s, d) => s + d.share, 0), prevTotal: 0, count: 0 }]
    : head
  const shown = active !== null ? slices[active] : null

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative h-48 w-48 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="total"
              nameKey="name"
              innerRadius="70%"
              outerRadius="100%"
              paddingAngle={2}
              cornerRadius={4}
              stroke="var(--color-surface)"
              strokeWidth={2}
              onMouseEnter={(_, i) => setActive(i)}
              onMouseLeave={() => setActive(null)}
              isAnimationActive
              animationDuration={700}
            >
              {slices.map((s, i) => (
                <Cell key={s.id} fill={s.color} opacity={active === null || active === i ? 1 : 0.35} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={CHART.tooltip}
              itemStyle={CHART.tooltipItem}
              formatter={(v, name) => [formatCurrency(Number(v), currency), String(name)]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[11px] font-medium text-text-tertiary">{shown ? shown.name : centerLabel}</span>
          <span className="num text-xl font-bold text-text-primary">{formatCurrency(shown ? shown.total : total, currency, { compact: true })}</span>
          {shown && <span className="text-[11px] text-text-secondary">{formatPercent(shown.share)}</span>}
        </div>
      </div>
      <ul className="w-full space-y-1">
        {slices.map((s, i) => (
          <li
            key={s.id}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            className="flex items-center gap-3 rounded-full px-2 py-1.5 transition-colors hover:bg-surface-2"
          >
            <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="flex-1 truncate text-sm text-text-secondary">
              {s.icon} {s.name}
            </span>
            <span className="num text-sm font-semibold text-text-primary">{formatCurrency(s.total, currency)}</span>
            <span className="num w-10 text-right text-xs text-text-tertiary">{formatPercent(s.share)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
