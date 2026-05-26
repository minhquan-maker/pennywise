import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { TrendingUp, TrendingDown, Wallet, Layers, Sparkles, RefreshCw } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { CategoryPieChart } from '@/components/charts/CategoryPieChart'
import { DailyBarChart } from '@/components/charts/DailyBarChart'
import { formatCurrency, formatMonth, getCurrentMonth } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'
import { analyticsService, aiService } from '@/lib/services'

export function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const [month] = useState(getCurrentMonth())

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboard', month],
    queryFn: () => analyticsService.dashboard(month).then((r) => r.data!),
  })

  const [aiSummary, setAiSummary] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  const currency = user?.currency || 'USD'
  const changePositive = (dashboard?.changePercent || 0) > 0
  const initial = user?.name?.charAt(0).toUpperCase() ?? 'U'

  const fetchAiSummary = async () => {
    setAiLoading(true)
    setAiError('')
    try {
      const result = await aiService.summary(month)
      setAiSummary(result.data!.summary)
    } catch {
      setAiError('AI summary unavailable. Check your GROQ_API_KEY.')
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Hero greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-text-primary leading-tight">
            Good morning, {user?.name}
          </h1>
          <p className="text-base text-text-secondary mt-1">
            Your financial snapshot for {formatMonth(month)}
          </p>
        </div>
        <div className="w-12 h-12 rounded-full bg-primary-600 text-white font-bold flex items-center justify-center text-lg flex-shrink-0">
          {initial}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-stagger">
        {/* Total Spent */}
        <Card variant="bordered" padding="md">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
              <Wallet className="w-5 h-5 text-primary-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-secondary">Total Spent</p>
              <p className="text-3xl font-extrabold tabular-nums text-text-primary mt-0.5">
                {formatCurrency(dashboard?.total || 0, currency)}
              </p>
            </div>
          </div>
        </Card>

        {/* vs Last Month */}
        <Card variant="bordered" padding="md">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                changePositive ? 'bg-danger-50' : 'bg-success-50'
              }`}
            >
              {changePositive ? (
                <TrendingUp className="w-5 h-5 text-danger-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-success-600" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-secondary">vs Last Month</p>
              <p
                className={`text-3xl font-extrabold tabular-nums mt-0.5 ${
                  changePositive ? 'text-danger-600' : 'text-success-600'
                }`}
              >
                {changePositive ? '+' : ''}{dashboard?.changePercent || 0}%
              </p>
            </div>
          </div>
        </Card>

        {/* Categories */}
        <Card variant="bordered" padding="md">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-surface-100 flex items-center justify-center flex-shrink-0">
              <Layers className="w-5 h-5 text-text-secondary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-secondary">Categories</p>
              <p className="text-3xl font-extrabold tabular-nums text-text-primary mt-0.5">
                {dashboard?.byCategory.length || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-stagger">
        <Card variant="bordered" padding="md">
          <Card.Header>
            <h2 className="text-base font-bold text-text-primary">Spending by Category</h2>
          </Card.Header>
          <Card.Body>
            <CategoryPieChart
              data={(dashboard?.byCategory || []).map((c) => ({
                name: c.name,
                value: c.total,
                icon: c.icon,
                color: c.color,
              }))}
            />
          </Card.Body>
        </Card>

        <Card variant="bordered" padding="md">
          <Card.Header>
            <h2 className="text-base font-bold text-text-primary">Last 7 Days</h2>
          </Card.Header>
          <Card.Body>
            <DailyBarChart data={dashboard?.last7Days || []} />
          </Card.Body>
        </Card>
      </div>

      {/* AI Summary */}
      <Card variant="default" padding="md">
        <Card.Header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary-600" />
            <h2 className="text-lg font-bold text-text-primary">AI Monthly Summary</h2>
          </div>
          <Button
            variant="soft"
            size="sm"
            onClick={fetchAiSummary}
            isLoading={aiLoading}
            disabled={aiLoading}
            icon={aiSummary ? <RefreshCw className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
          >
            {aiSummary ? 'Regenerate' : 'Generate'}
          </Button>
        </Card.Header>
        <Card.Body>
          {aiLoading && (
            <div className="space-y-2">
              <Skeleton variant="text" className="w-full" />
              <Skeleton variant="text" className="w-5/6" />
              <Skeleton variant="text" className="w-4/6" />
            </div>
          )}
          {aiError && (
            <p className="text-sm text-danger-500">{aiError}</p>
          )}
          {aiSummary && !aiLoading && (
            <p className="text-sm text-text-secondary leading-relaxed">{aiSummary}</p>
          )}
          {!aiSummary && !aiLoading && !aiError && (
            <p className="text-sm text-text-tertiary italic">
              Click "Generate" to get an AI-powered summary of your spending.
            </p>
          )}
        </Card.Body>
      </Card>

    </div>
  )
}
