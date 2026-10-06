import { Area, ComposedChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatCurrency, formatMonth } from '@/lib/utils'
import { CHART } from './theme'
import type { Prediction } from '@/types'

/** Monthly spending history + the next-month forecast with its confidence band (dashed). */
export function ForecastChart({ prediction, currency }: { prediction: Prediction; currency: string }) {
  const basis = prediction.basis.filter((b, i) => b.total > 0 || i === prediction.basis.length - 1)
  const last = basis[basis.length - 1]
  const rows = [
    ...basis.map((b, i) => ({
      month: b.month,
      actual: b.total,
      forecast: i === basis.length - 1 ? b.total : null,
      band: i === basis.length - 1 ? [b.total, b.total] : null,
    })),
    { month: prediction.month, actual: null, forecast: prediction.predicted, band: [prediction.low, prediction.high] },
  ]

  return (
    <ResponsiveContainer width="100%" height={230}>
      <ComposedChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={CHART.grid} strokeDasharray="3 5" />
        <XAxis dataKey="month" tick={CHART.axis} axisLine={false} tickLine={false} tickFormatter={(v) => formatMonth(String(v), 'short')} />
        <YAxis tick={CHART.axis} axisLine={false} tickLine={false} width={56} tickFormatter={(v) => formatCurrency(Number(v), currency, { compact: true })} />
        <Tooltip
          contentStyle={CHART.tooltip}
          labelStyle={CHART.tooltipLabel}
          itemStyle={CHART.tooltipItem}
          labelFormatter={(l) => `${formatMonth(String(l))}${l === last?.month ? ' (projected)' : l === prediction.month ? ' (forecast)' : ''}`}
          formatter={(v, name) => {
            if (name === 'band' && Array.isArray(v)) return [`${formatCurrency(v[0], currency)} – ${formatCurrency(v[1], currency)}`, 'Likely range']
            return [formatCurrency(Number(v), currency), name === 'actual' ? 'Spent' : 'Forecast']
          }}
          cursor={{ stroke: '#2c4834' }}
        />
        <Area dataKey="band" stroke="none" fill={CHART.income} fillOpacity={0.12} isAnimationActive={false} />
        <Line dataKey="actual" stroke={CHART.income} strokeWidth={2} dot={{ r: 3.5, fill: CHART.income, strokeWidth: 0 }} activeDot={{ r: 5 }} />
        <Line dataKey="forecast" stroke={CHART.income} strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4, fill: 'var(--color-surface)', stroke: CHART.income, strokeWidth: 2 }} connectNulls />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
