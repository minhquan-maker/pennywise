import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DailyBarChartProps {
  data: { date: string; total: number }[]
}

const axisStyle = { fontSize: 12, fill: '#94a3b8' }

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })
}

export function DailyBarChart({ data }: DailyBarChartProps) {
  if (!data.length) return <p className="text-sm text-slate-400 text-center py-8">No data yet</p>

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e5e7eb" />
        <XAxis
          dataKey="date"
          tickFormatter={(v) => formatDate(String(v))}
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
          formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Spent']}
          labelFormatter={(label) => formatDate(String(label))}
          contentStyle={{ border: 'none', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
        />
        <Bar
          dataKey="total"
          fill="url(#barGradient)"
          radius={[4, 4, 0, 0]}
          isAnimationActive={true}
          animationDuration={800}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
