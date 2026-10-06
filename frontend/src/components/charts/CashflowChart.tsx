import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatCurrency, formatMonth } from '@/lib/utils'
import { CHART } from './theme'
import type { TrendPoint } from '@/types'

/** Income vs expense per month as grouped bars on one axis, with a legend. */
export function CashflowChart({ data, currency, height = 260 }: { data: TrendPoint[]; currency: string; height?: number }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-4 text-xs text-text-secondary">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: CHART.income }} /> Income
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: CHART.expense }} /> Spending
        </span>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barGap={2} barCategoryGap="28%">
          <CartesianGrid vertical={false} stroke={CHART.grid} strokeDasharray="3 5" />
          <XAxis dataKey="month" tick={CHART.axis} axisLine={false} tickLine={false} tickFormatter={(v) => formatMonth(String(v), 'short')} />
          <YAxis
            tick={CHART.axis}
            axisLine={false}
            tickLine={false}
            width={56}
            tickFormatter={(v) => formatCurrency(Number(v), currency, { compact: true })}
          />
          <Tooltip
            cursor={CHART.cursor}
            contentStyle={CHART.tooltip}
            labelStyle={CHART.tooltipLabel}
            itemStyle={CHART.tooltipItem}
            labelFormatter={(l) => formatMonth(String(l))}
            formatter={(v, name) => [formatCurrency(Number(v), currency), name === 'income' ? 'Income' : 'Spending']}
          />
          <Bar dataKey="income" fill={CHART.income} radius={[4, 4, 0, 0]} maxBarSize={28} animationDuration={700} />
          <Bar dataKey="expense" fill={CHART.expense} radius={[4, 4, 0, 0]} maxBarSize={28} animationDuration={700} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
