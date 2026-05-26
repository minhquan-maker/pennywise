import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from 'recharts'

interface TrendLineChartProps {
  data: { month: string; total: number }[]
}

const axisStyle = { fontSize: 12, fill: '#94a3b8' }

function formatMonth(monthStr: string) {
  const [year, m] = monthStr.split('-')
  const d = new Date(parseInt(year), parseInt(m) - 1)
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

export function TrendLineChart({ data }: TrendLineChartProps) {
  if (!data.length) return <p className="text-sm text-slate-400 text-center py-8">No data yet</p>

  const min = Math.min(...data.map((d) => d.total))

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e5e7eb" />
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
          tickFormatter={(v) => `$${v}`}
        />
        <Tooltip
          formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Total']}
          labelFormatter={(label) => formatMonth(String(label))}
          contentStyle={{ border: 'none', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
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
          dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
          activeDot={{ r: 6, fill: '#3b82f6', strokeWidth: 0 }}
          isAnimationActive={true}
          animationDuration={1000}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
