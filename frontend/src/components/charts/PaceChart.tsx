import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatCurrency, formatDate } from '@/lib/utils'
import { CHART } from './theme'
import type { DashboardData } from '@/types'

/**
 * Cumulative spending through the month vs. an even-pace line to the budget (or the
 * historical average when no budget is set). One series + one reference — single y-axis.
 */
export function PaceChart({ data, currency }: { data: DashboardData; currency: string }) {
  const target = data.budget.total || data.historicalAvg || 0
  const rows = data.daily.map((d, i) => ({
    date: d.date,
    spent: d.cumulative,
    pace: target ? (target * (i + 1)) / data.daysInMonth : null,
  }))

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="paceFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART.income} stopOpacity={0.28} />
            <stop offset="100%" stopColor={CHART.income} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={CHART.grid} strokeDasharray="3 5" />
        <XAxis
          dataKey="date"
          tick={CHART.axis}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
          minTickGap={24}
          tickFormatter={(v) => formatDate(String(v), { day: 'numeric' })}
        />
        <YAxis
          tick={CHART.axis}
          axisLine={false}
          tickLine={false}
          width={56}
          tickFormatter={(v) => formatCurrency(Number(v), currency, { compact: true })}
        />
        <Tooltip
          contentStyle={CHART.tooltip}
          labelStyle={CHART.tooltipLabel}
          itemStyle={CHART.tooltipItem}
          labelFormatter={(l) => formatDate(String(l), { weekday: 'short', month: 'short', day: 'numeric' })}
          formatter={(v, name) => [formatCurrency(Number(v), currency), name === 'spent' ? 'Spent so far' : 'Even pace']}
          cursor={{ stroke: '#2c4834' }}
        />
        {target > 0 && (
          <Area type="linear" dataKey="pace" stroke={CHART.budget} strokeDasharray="5 5" strokeWidth={1.5} fill="none" dot={false} activeDot={false} isAnimationActive={false} />
        )}
        {target > 0 && <ReferenceLine y={target} stroke="#2c4834" strokeDasharray="2 4" />}
        <Area
          type="monotone"
          dataKey="spent"
          stroke={CHART.income}
          strokeWidth={2}
          fill="url(#paceFill)"
          connectNulls={false}
          dot={false}
          activeDot={{ r: 5, strokeWidth: 2, stroke: 'var(--color-surface)', fill: CHART.income }}
          animationDuration={900}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
