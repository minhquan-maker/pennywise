import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { TrendingUp, TrendingDown, Wallet, Sparkles, RefreshCw, PiggyBank } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { CategoryPieChart } from '@/components/charts/CategoryPieChart'
import { DailyBarChart } from '@/components/charts/DailyBarChart'
import { formatCurrency, formatMonth, getCurrentMonth } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'
import { analyticsService, aiService, budgetService } from '@/lib/services'

export function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const [month] = useState(getCurrentMonth())

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboard', month],
    queryFn: () => analyticsService.dashboard(month).then((r) => r.data!),
  })

  const { data: budgetsData } = useQuery({
    queryKey: ['budgets', month],
    queryFn: () => budgetService.getAll(month).then((r) => r.data!.budgets),
  })

  const totalBudget = (budgetsData || []).reduce((sum: number, b: { amount: number }) => sum + b.amount, 0)

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

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-white leading-tight">
            Good morning, {user?.name}
          </h1>
          <p className="text-base text-text-secondary mt-1">
            Your financial snapshot for {formatMonth(month)}
          </p>
        </div>
        <div className="w-12 h-12 rounded-full bg-primary-500 text-[#0A0A0A] font-bold flex items-center justify-center text-lg flex-shrink-0">
          {initial}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-stagger">
        <Card variant="dark" padding="md">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center flex-shrink-0">
              <Wallet className="w-5 h-5 text-primary-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-secondary">Total Spent</p>
              {isLoading ? (
                <Skeleton variant="text" className="w-28 h-9 mt-1" />
              ) : (
                <p className="text-3xl font-extrabold tabular-nums text-white mt-0.5">
                  {formatCurrency(dashboard?.total || 0, currency)}
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card variant="dark" padding="md">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center flex-shrink-0">
              {changePositive ? (
                <TrendingUp className="w-5 h-5 text-danger-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-primary-400" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-secondary">vs Last Month</p>
              {isLoading ? (
                <Skeleton variant="text" className="w-24 h-9 mt-1" />
              ) : (
                <p className={`text-3xl font-extrabold tabular-nums mt-0.5 ${changePositive ? 'text-danger-500' : 'text-primary-400'}`}>
                  {changePositive ? '+' : ''}{dashboard?.changePercent || 0}%
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card variant="dark" padding="md">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center flex-shrink-0">
              <PiggyBank className="w-5 h-5 text-text-secondary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-secondary">Monthly Budget</p>
              {isLoading ? (
                <Skeleton variant="text" className="w-24 h-9 mt-1" />
              ) : (
                <p className="text-3xl font-extrabold tabular-nums text-white mt-0.5">
                  {formatCurrency(totalBudget, currency)}
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-stagger">
        <Card variant="dark" padding="md">
          <Card.Header>
            <h2 className="text-base font-bold text-white">Spending by Category</h2>
          </Card.Header>
          <Card.Body>
            {isLoading ? (
              <Skeleton variant="rectangular" className="w-full h-56" />
            ) : (
              <CategoryPieChart
                data={(dashboard?.byCategory || []).map((c) => ({
                  name: c.name,
                  value: c.total,
                  icon: c.icon,
                  color: c.color,
                }))}
                currency={currency}
              />
            )}
          </Card.Body>
        </Card>

        <Card variant="dark" padding="md">
          <Card.Header>
            <h2 className="text-base font-bold text-white">Last 7 Days</h2>
          </Card.Header>
          <Card.Body>
            {isLoading ? (
              <Skeleton variant="rectangular" className="w-full h-56" />
            ) : (
              <DailyBarChart data={dashboard?.last7Days || []} currency={currency} />
            )}
          </Card.Body>
        </Card>
      </div>

      <Card variant="dark" padding="md">
        <Card.Header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary-400" />
            <h2 className="text-lg font-bold text-white">AI Monthly Summary</h2>
          </div>
          <Button
            variant="gradient"
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
