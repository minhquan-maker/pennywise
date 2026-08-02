import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface CategoryPieChartProps {
  data: { name: string; value: number; icon: string; color: string }[]
  currency?: string
}

export function CategoryPieChart({ data, currency = 'USD' }: CategoryPieChartProps) {
  if (!data.length) return <p className="text-sm text-slate-400 text-center py-8">No data yet</p>

  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <div>
      <div className="relative">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [formatCurrency(Number(value), currency), 'Spent']}
              contentStyle={{ borderRadius: 8, backgroundColor: '#171717', border: '1px solid #262626', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', color: '#fff' }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-white">{formatCurrency(total, currency)}</span>
          <span className="text-xs text-text-tertiary">Total</span>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
        {data.map((entry, index) => {
          const pct = total > 0 ? ((entry.value / total) * 100).toFixed(0) : '0'
          return (
            <div key={`legend-${index}`} className="flex items-center gap-1.5 text-xs text-text-secondary">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span>{entry.name}</span>
              <span className="text-text-tertiary font-medium">{pct}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
