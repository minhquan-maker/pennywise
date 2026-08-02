import { useState } from 'react'
import { TrendingUp, BarChart3, Target, Sparkles, RefreshCw } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { TrendLineChart } from '@/components/charts/TrendLineChart'
import { formatCurrency, getCurrentMonth } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'
import { useDashboard, useTrend } from '@/hooks/useQueries'
import { aiService } from '@/lib/services'
import { toast } from 'sonner'

export function AnalyticsPage() {
  const user = useAuthStore((s) => s.user)
  const currency = user?.currency || 'USD'
  const month = getCurrentMonth()

  const { data: trend = [], isLoading: trendLoading } = useTrend(6)
  const { data: dashboard, isLoading: dashboardLoading } = useDashboard(month)

  const [prediction, setPrediction] = useState<{
    predicted: number
    changePercent: number
    reason: string
  } | null>(null)
  const [predictLoading, setPredictLoading] = useState(false)

  const handlePredict = async () => {
    setPredictLoading(true)
    try {
      const { data } = await aiService.predict()
      setPrediction(data!)
    } catch {
      toast.error('Failed to generate prediction. Check your GROQ_API_KEY.')
    } finally {
      setPredictLoading(false)
    }
  }

  const totalAllTime = trend.reduce((s, t) => s + t.total, 0)
  const avgMonthly = trend.length > 0 ? totalAllTime / trend.length : 0
  const highestMonth = Math.max(...trend.map((t) => t.total), 0)

  const currentMonth = dashboard
  const categoryBreakdown = currentMonth?.byCategory || []

  const sortedCategories = [...categoryBreakdown].sort((a, b) => b.total - a.total)

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">Analytics</h1>
        <p className="text-base text-text-secondary mt-1">Your spending patterns and insights</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-stagger">
        {/* Avg Monthly */}
        <Card variant="dark" padding="md">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-neutral-800">
              <BarChart3 className="h-5 w-5 text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-text-secondary font-medium">Avg Monthly</p>
              <p className="text-3xl font-extrabold text-white mt-0.5 tabular-nums">
                {trendLoading ? (
                  <Skeleton variant="text" className="w-28 h-9 mt-0.5" />
                ) : (
                  formatCurrency(avgMonthly, currency)
                )}
              </p>
            </div>
          </div>
        </Card>

        {/* Highest Month */}
        <Card variant="dark" padding="md">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-neutral-800">
              <TrendingUp className="h-5 w-5 text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-text-secondary font-medium">Highest Month</p>
              <p className="text-3xl font-extrabold text-white mt-0.5 tabular-nums">
                {trendLoading ? (
                  <Skeleton variant="text" className="w-28 h-9 mt-0.5" />
                ) : (
                  formatCurrency(highestMonth, currency)
                )}
              </p>
            </div>
          </div>
        </Card>

        {/* Total 6 Months */}
        <Card variant="dark" padding="md">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-neutral-800">
              <Target className="h-5 w-5 text-text-secondary" />
            </div>
            <div>
              <p className="text-sm text-text-secondary font-medium">Total 6 Months</p>
              <p className="text-3xl font-extrabold text-white mt-0.5 tabular-nums">
                {trendLoading ? (
                  <Skeleton variant="text" className="w-28 h-9 mt-0.5" />
                ) : (
                  formatCurrency(totalAllTime, currency)
                )}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* 6-Month Trend chart */}
      <Card variant="dark" padding="md">
        <Card.Header>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary-400" />
            <div>
              <h2 className="text-base font-bold text-white">6-Month Trend</h2>
              <p className="text-xs text-text-tertiary font-normal">Last 6 months overview</p>
            </div>
          </div>
        </Card.Header>
        {trendLoading ? (
          <Skeleton variant="rectangular" className="w-full h-56" />
        ) : trend.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-text-tertiary text-sm">Not enough data for a trend yet</p>
          </div>
        ) : (
          <TrendLineChart data={trend} currency={currency} />
        )}
      </Card>

      {/* Category breakdown */}
      <Card variant="dark" padding="md">
        <Card.Header>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary-400" />
            <h2 className="text-base font-bold text-white">Category Breakdown</h2>
          </div>
        </Card.Header>
        {dashboardLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton variant="rectangular" className="w-6 h-6 rounded" />
                <div className="flex-1 space-y-1.5">
                  <div className="flex justify-between">
                    <Skeleton variant="text" className="w-20 h-3" />
                    <Skeleton variant="text" className="w-16 h-3" />
                  </div>
                  <Skeleton variant="rectangular" className="w-full h-2.5 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedCategories.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-text-tertiary text-sm">No spending data for this month yet</p>
          </div>
        ) : (
          <div className="space-y-0 animate-stagger">
            {sortedCategories.map((cat) => {
              const pct = dashboard!.total > 0 ? (cat.total / dashboard!.total) * 100 : 0
              return (
                <div key={cat.name} className="flex items-center gap-4 py-2.5 border-b border-[#262626] last:border-0">
                  <span className="text-xl flex-shrink-0">{cat.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="h-2.5 rounded-full bg-neutral-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-white flex-shrink-0 w-16 text-right">
                    {formatCurrency(cat.total, currency)}
                  </span>
                  <span className="text-xs text-text-tertiary flex-shrink-0 w-10 text-right">
                    {pct.toFixed(0)}%
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* AI Prediction */}
      <Card variant="dark" padding="md">
        <Card.Header>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary-400" />
            <h2 className="text-base font-bold text-white">AI Prediction</h2>
          </div>
        </Card.Header>
        {predictLoading ? (
          <div className="space-y-3">
            <Skeleton variant="text" className="w-40 h-9" />
            <Skeleton variant="text" className="w-full h-4" />
            <Skeleton variant="text" className="w-3/4 h-4" />
          </div>
        ) : prediction ? (
          <div className="space-y-3">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl font-extrabold text-white tabular-nums">
                {formatCurrency(prediction.predicted, currency)}
              </span>
              <Badge
                label={`${prediction.changePercent > 0 ? '+' : ''}${prediction.changePercent}% vs average`}
                color={prediction.changePercent > 0 ? 'var(--color-danger-500)' : 'var(--color-success-500)'}
                variant="soft"
                size="sm"
                dot
              />
            </div>
            <div className="border-l-4 border-primary-400 bg-neutral-800 rounded-r-lg px-4 py-3">
              <p className="text-sm text-text-secondary italic">{prediction.reason}</p>
            </div>
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                icon={<RefreshCw className="h-3.5 w-3.5" />}
                onClick={handlePredict}
                isLoading={predictLoading}
              >
                Recalculate
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-text-tertiary italic">Need more data for prediction</p>
            <div>
              <Button
                variant="outline"
                size="sm"
                icon={<RefreshCw className="h-3.5 w-3.5" />}
                onClick={handlePredict}
                isLoading={predictLoading}
              >
                Recalculate
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
