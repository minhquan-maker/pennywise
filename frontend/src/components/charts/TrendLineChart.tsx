import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface TrendLineChartProps {
  data: { month: string; total: number }[]
  currency?: string
}

const axisStyle = { fontSize: 12, fill: '#a3a3a3' }

function formatMonth(monthStr: string) {
  const [year, m] = monthStr.split('-')
  const d = new Date(parseInt(year), parseInt(m) - 1)
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

export function TrendLineChart({ data, currency = 'USD' }: TrendLineChartProps) {
  if (!data.length) return <p className="text-sm text-slate-400 text-center py-8">No data yet</p>

  const min = Math.min(...data.map((d) => d.total))

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#BFFF00" />
            <stop offset="100%" stopColor="#80CC00" />
          </linearGradient>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#BFFF00" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#BFFF00" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#262626" />
        <XAxis
          dataKey="month"
          tickFormatter={(v) => formatMonth(String(v))}
          tick={axisStyle}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={axisStyle}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatCurrency(Number(v), currency)}
        />
        <Tooltip
          formatter={(value) => [formatCurrency(Number(value), currency), 'Total']}
          labelFormatter={(label) => formatMonth(String(label))}
          contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.3)', color: '#fff' }}
        />
        <Area
          type="monotone"
          dataKey="total"
          fill="url(#areaGradient)"
          stroke="none"
          baseLine={min}
        />
        <Line
          type="monotone"
          dataKey="total"
          stroke="url(#trendGradient)"
          strokeWidth={2.5}
          dot={{ r: 4, fill: '#BFFF00', strokeWidth: 0 }}
          activeDot={{ r: 6, fill: '#BFFF00', strokeWidth: 0 }}
          isAnimationActive={true}
          animationDuration={1000}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
