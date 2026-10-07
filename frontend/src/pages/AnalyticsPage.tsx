import { useState } from 'react'
import { ArrowDownRight, ArrowUpRight, BarChart3, CalendarDays, LineChart, PiggyBank, Sparkles, Telescope } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { StatCard } from '@/components/ui/StatCard'
import { PageHeader } from '@/components/ui/PageHeader'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { MonthStepper } from '@/components/ui/MonthStepper'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { SourceTag } from '@/components/ui/SourceTag'
import { InsightList } from '@/components/ui/InsightList'
import { CashflowChart } from '@/components/charts/CashflowChart'
import { ForecastChart } from '@/components/charts/ForecastChart'
import { WeekdayChart } from '@/components/charts/WeekdayChart'
import { cn, formatCurrency, formatMonth, formatPercent, getCurrentMonth } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'
import { useAIInsight, useDashboard, usePrediction, useTrend } from '@/hooks/useQueries'

export function AnalyticsPage() {
  const currency = useAuthStore((s) => s.user?.currency) || 'USD'
  const fmt = (n: number) => formatCurrency(n, currency)
  const [range, setRange] = useState<'3' | '6' | '12'>('6')
  const [month, setMonth] = useState(getCurrentMonth())

  const { data: trendData, isLoading: trendLoading } = useTrend(Number(range))
  const { data: d, isLoading: dLoading } = useDashboard(month)
  const { data: prediction, isLoading: predLoading } = usePrediction()
  const aiInsight = useAIInsight()

  const trend = trendData?.trend ?? []
  // Ignore months before the user's first transaction so averages aren't diluted
  const firstActive = trend.findIndex((t) => t.expense > 0 || t.income > 0)
  const active = firstActive === -1 ? [] : trend.slice(firstActive)
  const avgSpend = active.length ? active.reduce((s, t) => s + t.expense, 0) / active.length : 0
  const totalIncome = active.reduce((s, t) => s + t.income, 0)
  const totalExpense = active.reduce((s, t) => s + t.expense, 0)
  const savingsRate = totalIncome > 0 ? (totalIncome - totalExpense) / totalIncome : null
  const peak = active.reduce<(typeof active)[number] | null>((m, t) => (!m || t.expense > m.expense ? t : m), null)
  const weekday = trendData?.weekday ?? []
  const peakDay = weekday.reduce<(typeof weekday)[number] | null>((m, w) => (!m || w.average > m.average ? w : m), null)

  const insights = aiInsight.data && aiInsight.variables === month ? aiInsight.data : null

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Patterns"
        title="Analytics"
        actions={
          <SegmentedControl
            value={range}
            onChange={setRange}
            options={[
              { value: '3', label: '3M' },
              { value: '6', label: '6M' },
              { value: '12', label: '12M' },
            ]}
          />
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard label="Avg monthly spend" loading={trendLoading} value={fmt(avgSpend)} icon={<BarChart3 className="h-4 w-4" />} hint={`${active.length} active month(s)`} />
        <StatCard
          label="Savings rate"
          loading={trendLoading}
          value={formatPercent(savingsRate)}
          tone={savingsRate !== null && savingsRate < 0 ? 'negative' : savingsRate !== null && savingsRate >= 0.2 ? 'positive' : 'default'}
          icon={<PiggyBank className="h-4 w-4" />}
          hint={savingsRate === null ? 'Log income to see this' : `${fmt(totalIncome - totalExpense)} kept`}
        />
        <StatCard label="Peak month" loading={trendLoading} value={peak ? fmt(peak.expense) : '—'} icon={<ArrowUpRight className="h-4 w-4" />} hint={peak ? formatMonth(peak.month) : 'No data'} />
        <StatCard label={`Income · ${range} months`} loading={trendLoading} value={fmt(totalIncome)} icon={<ArrowDownRight className="h-4 w-4" />} hint={`Spent ${fmt(totalExpense)}`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader title="Cash flow" subtitle="Income vs spending per month" icon={<LineChart className="h-4 w-4" />} />
          {trendLoading ? <Skeleton className="h-64 w-full" /> : <CashflowChart data={trend} currency={currency} />}
        </Card>

        <Card variant="fog" className="lg:col-span-2">
          <CardHeader
            title="Next month forecast"
            subtitle={prediction ? formatMonth(prediction.month) : undefined}
            icon={<Telescope className="h-4 w-4" />}
            action={<SourceTag source={prediction?.source} />}
          />
          {predLoading || !prediction ? (
            <Skeleton className="h-64 w-full" />
          ) : prediction.method === 'none' ? (
            <p className="py-16 text-center text-sm text-text-tertiary">{prediction.reason}</p>
          ) : (
            <>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="display num text-5xl text-text-primary">{fmt(prediction.predicted)}</span>
                <span className={cn('text-sm font-semibold', prediction.trendPercent > 0 ? 'text-warning-500' : 'text-positive')}>
                  {prediction.trendPercent > 0 ? '↗' : '↘'} {Math.abs(prediction.trendPercent)}%/mo trend
                </span>
              </div>
              <p className="num mt-1 text-xs text-text-tertiary">
                Likely between {fmt(prediction.low)} and {fmt(prediction.high)}
              </p>
              <div className="mt-4">
                <ForecastChart prediction={prediction} currency={currency} />
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-text-secondary">{prediction.reason}</p>
            </>
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-5 lg:items-start">
        <Card className="lg:col-span-3">
          <CardHeader
            title="Category breakdown"
            subtitle={month === getCurrentMonth() ? 'Change vs the same days last month' : 'Change vs the previous month'}
            action={<MonthStepper value={month} onChange={setMonth} />}
            className="flex-col sm:flex-row"
          />
          {dLoading || !d ? (
            <Skeleton className="h-56 w-full" />
          ) : d.byCategory.length === 0 ? (
            <p className="py-12 text-center text-sm text-text-tertiary">No spending in {formatMonth(month)}</p>
          ) : (
            <ul className="space-y-3.5">
              {d.byCategory.map((c) => {
                const delta = c.prevTotal > 0 ? (c.total - c.prevTotal) / c.prevTotal : null
                return (
                  <li key={c.id} className="flex items-center gap-3">
                    <CategoryIcon icon={c.icon} color={c.color} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex items-baseline justify-between gap-2">
                        <span className="truncate text-sm text-text-primary">{c.name}</span>
                        <span className="num text-sm font-semibold text-text-primary">{fmt(c.total)}</span>
                      </div>
                      <div className="h-2 rounded-full bg-surface-3">
                        <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${c.share * 100}%`, backgroundColor: c.color }} />
                      </div>
                    </div>
                    <span
                      className={cn(
                        'num w-14 flex-shrink-0 text-right text-xs font-semibold',
                        delta === null ? 'text-text-tertiary' : delta > 0.05 ? 'text-warning-500' : delta < -0.05 ? 'text-positive' : 'text-text-tertiary'
                      )}
                      title="vs previous month"
                    >
                      {delta === null ? 'new' : `${delta > 0 ? '+' : ''}${Math.round(delta * 100)}%`}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader title="Spending by weekday" subtitle={`Average per day · last ${range} months`} icon={<CalendarDays className="h-4 w-4" />} />
            {trendLoading ? (
              <Skeleton className="h-44 w-full" />
            ) : (
              <>
                <WeekdayChart data={weekday} currency={currency} />
                {peakDay && peakDay.average > 0 && (
                  <p className="mt-2 text-xs text-text-secondary">
                    <strong className="text-text-primary">{peakDay.day}</strong> is your most expensive day at <span className="num">{fmt(peakDay.average)}</span> on average.
                  </p>
                )}
              </>
            )}
          </Card>

          <Card>
            <CardHeader title="Insights" subtitle={formatMonth(month)} action={<SourceTag source={insights?.source ?? 'engine'} />} />
            {dLoading || !d ? <Skeleton className="h-32 w-full" /> : <InsightList insights={insights?.insights ?? d.insights} />}
            <Button className="mt-4" size="sm" variant="soft" icon={<Sparkles className="h-3.5 w-3.5" />} isLoading={aiInsight.isPending} onClick={() => aiInsight.mutate(month)}>
              Analyse with AI
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
