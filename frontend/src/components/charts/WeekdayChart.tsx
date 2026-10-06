import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { CHART } from './theme'
import type { WeekdayPoint } from '@/types'

/** Average spend per weekday; the peak day is highlighted and directly labelled by the caller. */
export function WeekdayChart({ data, currency }: { data: WeekdayPoint[]; currency: string }) {
  const max = Math.max(...data.map((d) => d.average), 0)
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }} barCategoryGap="22%">
        <XAxis dataKey="day" tick={CHART.axis} axisLine={false} tickLine={false} />
        <Tooltip
          cursor={CHART.cursor}
          contentStyle={CHART.tooltip}
          labelStyle={CHART.tooltipLabel}
          itemStyle={CHART.tooltipItem}
          formatter={(v) => [formatCurrency(Number(v), currency), 'Avg per day']}
        />
        <Bar dataKey="average" radius={[4, 4, 4, 4]} animationDuration={700}>
          {data.map((d) => (
            <Cell key={d.day} fill={d.average === max && max > 0 ? CHART.income : '#2c4834'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
