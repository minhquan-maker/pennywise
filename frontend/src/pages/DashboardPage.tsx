import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowDownRight,
  ArrowUpRight,
  ArrowRight,
  CalendarClock,
  Lightbulb,
  PiggyBank,
  Plus,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { StatCard } from '@/components/ui/StatCard'
import { MonthStepper } from '@/components/ui/MonthStepper'
import { ScoreRing } from '@/components/ui/Orb'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { EmptyState } from '@/components/ui/EmptyState'
import { SourceTag } from '@/components/ui/SourceTag'
import { CategoryDonut } from '@/components/charts/CategoryDonut'
import { PaceChart } from '@/components/charts/PaceChart'
import { cn, formatCurrency, formatDate, formatMonth, formatPercent, getCurrentMonth, greeting } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'
import { useAIInsight, useAISummary, useDashboard, useTransactions } from '@/hooks/useQueries'
import { InsightList } from '@/components/ui/InsightList'

export function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const openAdd = useUiStore((s) => s.openAdd)
  const openEdit = useUiStore((s) => s.openEdit)
  const [month, setMonth] = useState(getCurrentMonth())
  const isCurrent = month === getCurrentMonth()

  const { data: d, isLoading } = useDashboard(month)
  const { data: recent = [], isLoading: recentLoading } = useTransactions({ month, limit: 6 })
  const aiInsight = useAIInsight()
  const aiSummary = useAISummary()

  const currency = user?.currency || d?.currency || 'USD'
  const fmt = (n: number) => formatCurrency(n, currency)
  const firstName = user?.name?.split(' ')[0] ?? ''

  const insights = aiInsight.data && aiInsight.variables === month ? aiInsight.data.insights : d?.insights ?? []
  const insightSource = aiInsight.data && aiInsight.variables === month ? aiInsight.data.source : 'engine'
  const summary = aiSummary.data && aiSummary.variables === month ? aiSummary.data : null

  const noData = !isLoading && d && d.transactionCount === 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-2">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="display text-[40px] text-text-primary sm:text-[56px]">
            {greeting()}, <span className="mark">{firstName}</span>
          </h1>
        </div>
        <MonthStepper value={month} onChange={setMonth} />
      </div>

      {noData ? (
        <Card variant="fog" padding="lg">
          <EmptyState
            icon={<Wallet className="h-7 w-7" />}
            title={`Nothing logged for ${formatMonth(month)}`}
            description="Add your income and first expenses — PennyWise will build your cash flow, budget pace, forecast and insights automatically."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button icon={<Plus className="h-4 w-4" />} onClick={() => openAdd('expense')}>
                  Add expense
                </Button>
                <Button variant="outline" onClick={() => openAdd('income')}>
                  Add income
                </Button>
              </div>
            }
          />
        </Card>
      ) : (
        <>
          {/* Hero: net + health */}
          <div className="grid gap-4 lg:grid-cols-3">
            <Card variant="forest" padding="lg" className="overflow-hidden lg:col-span-2">
              <div className="flex h-full flex-col justify-between gap-6">
                <div className="min-w-0">
                  <p className="eyebrow text-primary-500">Net cash flow · {formatMonth(month)}</p>
                  {isLoading || !d ? (
                    <Skeleton className="mt-3 h-14 w-56 opacity-20" />
                  ) : (
                    <p className={cn('display num mt-3 text-[clamp(2.25rem,9vw,4.5rem)]', d.net >= 0 ? 'text-primary-500' : 'text-danger-300')}>
                      {formatCurrency(d.net, currency, { sign: true })}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div className="flex flex-wrap gap-2 text-[13px]">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 font-semibold text-white">
                      <ArrowDownRight className="h-3.5 w-3.5 text-primary-500" /> In {fmt(d?.income ?? 0)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 font-semibold text-white">
                      <ArrowUpRight className="h-3.5 w-3.5 text-danger-300" /> Out {fmt(d?.expense ?? 0)}
                    </span>
                    {d?.savingsRate !== null && d?.savingsRate !== undefined && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1 text-white/80">
                        <PiggyBank className="h-3.5 w-3.5" /> Saving {formatPercent(d.savingsRate)}
                      </span>
                    )}
                  </div>
                  {isCurrent && d && d.budget.total > 0 && (
                    <div className="flex-shrink-0 rounded-[var(--radius-lg)] bg-surface p-4 text-forest md:w-60">
                      <p className="text-xs font-semibold text-text-tertiary">Safe to spend</p>
                      <p className="num mt-1 font-display text-2xl font-black tracking-[-0.03em]">
                        {fmt(d.budget.safePerDay)}
                        <span className="font-sans text-sm font-medium tracking-normal text-text-tertiary"> / day</span>
                      </p>
                      <p className="mt-1 text-xs text-text-secondary">
                        {fmt(Math.max(0, d.budget.remaining))} left for {d.daysInMonth - d.elapsedDays + 1} days
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Card padding="lg" className="flex flex-col items-center justify-center text-center">
              <p className="eyebrow mb-4">Financial health</p>
              {isLoading || !d ? (
                <Skeleton variant="circular" className="h-[168px] w-[168px]" />
              ) : (
                <>
                  <ScoreRing value={d.health.score} label={d.health.label} />
                  <div className="mt-5 grid w-full grid-cols-3 gap-2 text-left">
                    {[
                      { label: 'Savings', v: d.health.parts.savings, max: 40 },
                      { label: 'Budgets', v: d.health.parts.budgets, max: 35 },
                      { label: 'Trend', v: d.health.parts.trend, max: 25 },
                    ].map((p) => (
                      <div key={p.label}>
                        <p className="text-[11px] text-text-tertiary">{p.label}</p>
                        <ProgressBar value={p.v / p.max} className="mt-1.5 h-1.5" />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            <StatCard
              label="Spending"
              loading={isLoading}
              value={fmt(d?.expense ?? 0)}
              icon={d && d.changePercent > 0 ? <TrendingUp className="h-4 w-4 text-danger-500" /> : <TrendingDown className="h-4 w-4 text-positive" />}
              hint={
                d && d.prevToDate > 0 ? (
                  <span className={d.changePercent > 0 ? 'text-danger-500' : 'text-positive'}>
                    {d.changePercent > 0 ? '+' : ''}
                    {d.changePercent}% vs {isCurrent ? 'same point last month' : 'last month'}
                  </span>
                ) : (
                  'No data last month'
                )
              }
            />
            <StatCard label="Income" loading={isLoading} value={fmt(d?.income ?? 0)} icon={<Wallet className="h-4 w-4" />} hint={`${d?.incomeByCategory.length ?? 0} source(s)`} />
            <StatCard
              label={isCurrent ? 'Projected month-end' : 'Month total'}
              loading={isLoading}
              value={fmt(isCurrent ? d?.projectedExpense ?? 0 : d?.expense ?? 0)}
              icon={<CalendarClock className="h-4 w-4" />}
              hint={d?.historicalAvg ? `Typical month ${fmt(d.historicalAvg)}` : 'Builds with more history'}
            />
            <StatCard
              label="Budget left"
              loading={isLoading}
              tone={d && d.budget.total > 0 && d.budget.remaining < 0 ? 'negative' : 'default'}
              value={d && d.budget.total > 0 ? fmt(d.budget.remaining) : '—'}
              icon={<Target className="h-4 w-4" />}
              hint={
                d && d.budget.total > 0 ? (
                  `${formatPercent(d.budget.spent / d.budget.total)} of ${fmt(d.budget.total)} used`
                ) : (
                  <Link to="/budget" className="font-semibold text-forest underline underline-offset-2">
                    Set a budget →
                  </Link>
                )
              }
            />
          </div>

          {/* Charts */}
          <div className="grid gap-4 lg:grid-cols-5">
            <Card className="lg:col-span-3">
              <CardHeader
                title="Spending pace"
                subtitle={d && (d.budget.total || d.historicalAvg) ? `Cumulative vs an even pace to ${d.budget.total ? 'your budget' : 'your typical month'}` : 'Cumulative spending this month'}
              />
              {isLoading || !d ? <Skeleton className="h-60 w-full" /> : <PaceChart data={d} currency={currency} />}
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader title="Where it went" subtitle={`${d?.byCategory.length ?? 0} categories`} />
              {isLoading || !d ? (
                <Skeleton className="h-60 w-full" />
              ) : d.byCategory.length ? (
                <CategoryDonut data={d.byCategory} currency={currency} />
              ) : (
                <p className="py-16 text-center text-sm text-text-tertiary">No spending yet this month</p>
              )}
            </Card>
          </div>

          {/* Lists */}
          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader
                title="Recent activity"
                action={
                  <Link to="/transactions" className="inline-flex items-center gap-1 text-xs font-semibold text-forest underline-offset-2 hover:underline">
                    All <ArrowRight className="h-3 w-3" />
                  </Link>
                }
              />
              {recentLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-11 w-full" />
                  ))}
                </div>
              ) : (
                <ul className="-mx-2">
                  {recent.map((t) => (
                    <li key={t.id}>
                      <button
                        onClick={() => openEdit(t)}
                        className="flex w-full items-center gap-3 rounded-[var(--radius-md)] px-2 py-2 text-left transition-colors hover:bg-surface-3"
                      >
                        <CategoryIcon icon={t.category.icon} color={t.category.color} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-text-primary">{t.note || t.category.name}</p>
                          <p className="text-xs text-text-tertiary">{formatDate(t.date, { month: 'short', day: 'numeric' })}</p>
                        </div>
                        <span className={cn('num text-sm font-semibold', t.type === 'income' ? 'text-positive' : 'text-text-primary')}>
                          {t.type === 'income' ? '+' : '−'}
                          {fmt(t.amount)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card>
              <CardHeader
                title="Budgets"
                action={
                  <Link to="/budget" className="inline-flex items-center gap-1 text-xs font-semibold text-forest underline-offset-2 hover:underline">
                    Manage <ArrowRight className="h-3 w-3" />
                  </Link>
                }
              />
              {!d || d.budget.items.length === 0 ? (
                <EmptyState
                  className="py-6"
                  title="No budgets yet"
                  description="Let PennyWise suggest limits from your history."
                  action={
                    <Link to="/budget">
                      <Button size="sm" variant="soft" icon={<Sparkles className="h-3.5 w-3.5" />}>
                        Suggest budgets
                      </Button>
                    </Link>
                  }
                />
              ) : (
                <ul className="space-y-4">
                  {d.budget.items.slice(0, 5).map((b) => (
                    <li key={b.id}>
                      <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                        <span className="flex min-w-0 items-center gap-2 text-text-primary">
                          <CategoryIcon icon={b.icon} color={b.color} size="xs" />
                          <span className="truncate">{b.name}</span>
                        </span>
                        <span className="num text-xs text-text-secondary">
                          {fmt(b.spent)} <span className="text-text-tertiary">/ {fmt(b.amount)}</span>
                        </span>
                      </div>
                      <ProgressBar value={b.pct} color={b.status === 'warning' ? 'var(--color-warning-500)' : undefined} pace={isCurrent ? d.elapsedDays / d.daysInMonth : undefined} />
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card variant="fog">
              <CardHeader
                title="Insights"
                icon={<Lightbulb className="h-4 w-4" />}
                action={<SourceTag source={insightSource} />}
              />
              {isLoading || !d ? (
                <Skeleton className="h-40 w-full" />
              ) : (
                <InsightList insights={insights} />
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="soft"
                  icon={<Sparkles className="h-3.5 w-3.5" />}
                  isLoading={aiInsight.isPending}
                  onClick={() => aiInsight.mutate(month)}
                >
                  Refresh with AI
                </Button>
                <Button size="sm" variant="ghost" isLoading={aiSummary.isPending} onClick={() => aiSummary.mutate(month)}>
                  Monthly summary
                </Button>
              </div>
              {summary && (
                <div className="mt-4 rounded-[var(--radius-lg)] border-l-4 border-primary-500 bg-surface px-4 py-3">
                  <div className="mb-1.5">
                    <SourceTag source={summary.source} />
                  </div>
                  <p className="text-[13px] leading-relaxed text-text-secondary">{summary.summary}</p>
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
