import { useState } from 'react'
import { CalendarClock, Copy, Plus, Sparkles, Target, Trash2, TrendingUp } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Skeleton } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'
import { PageHeader } from '@/components/ui/PageHeader'
import { MonthStepper } from '@/components/ui/MonthStepper'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { SourceTag } from '@/components/ui/SourceTag'
import { fieldClass } from '@/components/ui/Input'
import { cn, currencySymbol, formatCurrency, formatMonth, formatPercent, getCurrentMonth } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'
import {
  useAISuggestBudget,
  useBulkBudgets,
  useCategories,
  useClearBudgets,
  useCopyBudgets,
  useDashboard,
  useDeleteBudget,
  useUpsertBudget,
} from '@/hooks/useQueries'
import type { BudgetStatus, BudgetSuggestion } from '@/types'

const STATUS = {
  ok: { label: 'On track', color: 'var(--color-positive)' },
  warning: { label: 'At risk', color: 'var(--color-warning-500)' },
  over: { label: 'Over', color: 'var(--color-danger-500)' },
}

export function BudgetPage() {
  const currency = useAuthStore((s) => s.user?.currency) || 'USD'
  const [month, setMonth] = useState(getCurrentMonth())
  const isCurrent = month === getCurrentMonth()
  const fmt = (n: number) => formatCurrency(n, currency)

  const { data: d, isLoading } = useDashboard(month)
  const { data: expenseCats = [] } = useCategories('expense')
  const upsert = useUpsertBudget()
  const remove = useDeleteBudget()
  const copy = useCopyBudgets()
  const clear = useClearBudgets()
  const suggest = useAISuggestBudget()
  const bulk = useBulkBudgets()

  const [editor, setEditor] = useState<{ open: boolean; budget: BudgetStatus | null; categoryId: string; amount: string }>({
    open: false,
    budget: null,
    categoryId: '',
    amount: '',
  })
  const [review, setReview] = useState<{ open: boolean; picks: Record<string, { on: boolean; amount: string }> }>({ open: false, picks: {} })
  const [confirmClear, setConfirmClear] = useState(false)

  const items = d?.budget.items ?? []
  const budgeted = new Set(items.map((b) => b.categoryId))
  const unbudgeted = (d?.byCategory ?? []).filter((c) => !budgeted.has(c.id))
  const pace = d && isCurrent ? d.elapsedDays / d.daysInMonth : undefined

  const openEditor = (budget: BudgetStatus | null, categoryId = '') =>
    setEditor({
      open: true,
      budget,
      categoryId: budget?.categoryId ?? categoryId,
      amount: budget ? String(budget.amount) : '',
    })
  const closeEditor = () => setEditor((e) => ({ ...e, open: false }))

  const saveBudget = (e?: React.FormEvent) => {
    e?.preventDefault()
    const amount = parseFloat(editor.amount)
    if (!editor.categoryId || !(amount > 0)) return
    upsert.mutate({ categoryId: editor.categoryId, amount, month }, { onSuccess: closeEditor })
  }

  const runSuggest = () =>
    suggest.mutate(month, {
      onSuccess: (res) => {
        const picks: Record<string, { on: boolean; amount: string }> = {}
        for (const s of res.suggestions) picks[s.categoryId] = { on: !budgeted.has(s.categoryId), amount: String(s.suggestedBudget) }
        setReview({ open: true, picks })
      },
    })

  const applySuggestions = () => {
    const chosen = Object.entries(review.picks)
      .filter(([, p]) => p.on && parseFloat(p.amount) > 0)
      .map(([categoryId, p]) => ({ categoryId, amount: parseFloat(p.amount) }))
    if (!chosen.length) return
    bulk.mutate({ month, items: chosen }, { onSuccess: () => setReview({ open: false, picks: {} }) })
  }

  const selectedCount = Object.values(review.picks).filter((p) => p.on).length
  const totalBudget = d?.budget.total ?? 0
  const usage = totalBudget > 0 ? (d?.budget.spent ?? 0) / totalBudget : 0

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Plan"
        title="Budgets"
        actions={
          <>
            <MonthStepper value={month} onChange={setMonth} />
            <Button variant="soft" icon={<Sparkles className="h-4 w-4" />} isLoading={suggest.isPending} onClick={runSuggest}>
              Suggest
            </Button>
            <Button icon={<Plus className="h-4 w-4" />} onClick={() => openEditor(null)}>
              Add
            </Button>
          </>
        }
      />

      {/* Overview */}
      {isLoading ? (
        <Skeleton className="h-44 w-full rounded-[var(--radius-2xl)]" />
      ) : items.length > 0 && d ? (
        <Card variant="forest" padding="lg" className="overflow-hidden">
          <div className="grid gap-6 md:grid-cols-[1.4fr_1fr] md:items-center">
            <div className="min-w-0">
              <p className="eyebrow text-primary-500">{formatMonth(month)} · {items.length} budgets</p>
              <p className="display num mt-3 text-[clamp(2.25rem,8vw,4rem)] text-white">
                {fmt(d.budget.spent)}
                <span className="ml-2 align-middle font-sans text-base font-medium normal-case tracking-normal text-white/60">of {fmt(totalBudget)}</span>
              </p>
              <ProgressBar value={usage} pace={pace} color="var(--color-primary-500)" className="mt-5 h-3 bg-white/15 [&>span]:ring-forest [&>span]:bg-white" />
              <div className="mt-2 flex justify-between text-xs text-white/60">
                <span>{formatPercent(usage)} used</span>
                {pace !== undefined && <span>Day {d.elapsedDays} of {d.daysInMonth}</span>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[var(--radius-lg)] bg-surface p-4">
                <p className="text-xs font-semibold text-text-tertiary">Remaining</p>
                <p className={cn('num mt-1 font-display text-xl font-black tracking-[-0.03em]', d.budget.remaining < 0 ? 'text-danger-500' : 'text-forest')}>{fmt(d.budget.remaining)}</p>
              </div>
              <div className="rounded-[var(--radius-lg)] bg-surface p-4">
                <p className="text-xs font-semibold text-text-tertiary">{isCurrent ? 'Safe per day' : 'Result'}</p>
                <p className="num mt-1 font-display text-xl font-black tracking-[-0.03em] text-forest">
                  {isCurrent ? fmt(d.budget.safePerDay) : d.budget.remaining >= 0 ? 'Under' : 'Over'}
                </p>
              </div>
              {isCurrent && (
                <div className="col-span-2 flex items-center gap-3 rounded-[var(--radius-lg)] bg-white/10 p-4">
                  <CalendarClock className="h-5 w-5 flex-shrink-0 text-primary-500" />
                  <p className="text-xs leading-relaxed text-white/75">
                    Budgeted categories are projected to finish at{' '}
                    <strong className="num text-white">{fmt(items.reduce((s, b) => s + Math.max(b.projected, b.spent), 0))}</strong>{' '}
                    by month end.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      ) : null}

      {/* Budget cards */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-[var(--radius-2xl)]" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Target className="h-7 w-7" />}
            title={`No budgets for ${formatMonth(month)}`}
            description="Let PennyWise suggest limits from your last 6 months, copy last month's plan, or set one yourself."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button icon={<Sparkles className="h-4 w-4" />} isLoading={suggest.isPending} onClick={runSuggest}>
                  Suggest budgets
                </Button>
                <Button variant="outline" icon={<Copy className="h-4 w-4" />} isLoading={copy.isPending} onClick={() => copy.mutate(month)}>
                  Copy last month
                </Button>
              </div>
            }
          />
        </Card>
      ) : (
        <div className="animate-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((b) => {
            const st = STATUS[b.status]
            return (
              <Card key={b.id} interactive onClick={() => openEditor(b)} className="group">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <CategoryIcon icon={b.icon} color={b.color} />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-text-primary">{b.name}</p>
                      <p className="num text-xs text-text-tertiary">{fmt(b.amount)} / month</p>
                    </div>
                  </div>
                  <Badge label={st.label} color={st.color} size="sm" dot />
                </div>
                <p className="num mt-5 font-display text-[26px] font-black tracking-[-0.03em] text-text-primary">
                  {fmt(b.spent)}
                  <span className="ml-1.5 text-xs font-medium text-text-tertiary">{formatPercent(b.pct)}</span>
                </p>
                <ProgressBar value={b.pct} color={b.status === 'warning' ? 'var(--color-warning-500)' : undefined} pace={pace} className="mt-3" />
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className={b.remaining < 0 ? 'font-semibold text-danger-500' : 'text-text-secondary'}>
                    {b.remaining < 0 ? `${fmt(-b.remaining)} over` : `${fmt(b.remaining)} left`}
                  </span>
                  {isCurrent && b.projected > b.spent && (
                    <span className={cn('inline-flex items-center gap-1', b.projected > b.amount ? 'text-warning-500' : 'text-text-tertiary')}>
                      <TrendingUp className="h-3 w-3" />
                      ~{fmt(b.projected)}
                    </span>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Spending without a budget */}
      {unbudgeted.length > 0 && (
        <Card>
          <CardHeader title="Spending without a budget" subtitle="Add a limit to track pace and get alerts" />
          <ul className="divide-y divide-line">
            {unbudgeted.map((c) => (
              <li key={c.id} className="flex items-center gap-3 py-3">
                <CategoryIcon icon={c.icon} color={c.color} size="sm" />
                <span className="flex-1 truncate text-sm text-text-primary">{c.name}</span>
                <span className="num text-sm text-text-secondary">{fmt(c.total)}</span>
                <Button size="sm" variant="outline" onClick={() => openEditor(null, c.id)}>
                  Set
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {items.length > 0 && (
        <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-5">
          <Button variant="ghost" size="sm" icon={<Copy className="h-4 w-4" />} isLoading={copy.isPending} onClick={() => copy.mutate(month)}>
            Copy missing from last month
          </Button>
          <Button variant="ghost" size="sm" className="hover:!bg-danger-500/10 hover:!text-danger-500" icon={<Trash2 className="h-4 w-4" />} onClick={() => setConfirmClear(true)}>
            Clear month
          </Button>
        </div>
      )}

      {/* Add / edit budget */}
      <Modal
        isOpen={editor.open}
        onClose={closeEditor}
        title={editor.budget ? `Edit ${editor.budget.name} budget` : 'New budget'}
        description={formatMonth(month)}
        footer={
          <div className="flex gap-3">
            {editor.budget && (
              <Button
                variant="ghost"
                iconOnly
                aria-label="Delete budget"
                className="hover:!bg-danger-500/10 hover:!text-danger-500"
                icon={<Trash2 className="h-4 w-4" />}
                isLoading={remove.isPending}
                onClick={() => remove.mutate(editor.budget!.id, { onSuccess: closeEditor })}
              />
            )}
            <Button variant="secondary" className="flex-1" onClick={closeEditor}>
              Cancel
            </Button>
            <Button className="flex-1" isLoading={upsert.isPending} disabled={!editor.categoryId || !(parseFloat(editor.amount) > 0)} onClick={() => saveBudget()}>
              Save
            </Button>
          </div>
        }
      >
        <form onSubmit={saveBudget} className="space-y-5">
          {!editor.budget && (
            <div>
              <p className="mb-2.5 text-[13px] font-semibold text-text-secondary">Category</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {expenseCats.map((c) => {
                  const taken = budgeted.has(c.id)
                  return (
                    <button
                      key={c.id}
                      type="button"
                      disabled={taken}
                      onClick={() => setEditor((e) => ({ ...e, categoryId: c.id }))}
                      className={cn(
                        'flex items-center gap-2 rounded-[var(--radius-md)] border px-3 py-2.5 text-left text-sm transition-all disabled:opacity-35',
                        editor.categoryId === c.id ? 'border-forest bg-primary-100 font-semibold text-forest ring-1 ring-forest' : 'border-line bg-surface text-text-secondary hover:border-forest/40'
                      )}
                    >
                      <CategoryIcon icon={c.icon} color={c.color} size="xs" />
                      <span className="truncate">{c.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
          <div>
            <label htmlFor="budget-amount" className="mb-2.5 block text-[13px] font-semibold text-text-secondary">
              Monthly limit
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary">{currencySymbol(currency)}</span>
              <input
                id="budget-amount"
                data-autofocus
                type="number"
                inputMode="decimal"
                min="0"
                value={editor.amount}
                onChange={(e) => setEditor((s) => ({ ...s, amount: e.target.value }))}
                placeholder="0"
                className={cn(fieldClass, 'num pl-9 text-lg font-semibold')}
              />
            </div>
            {(() => {
              const hist = d?.byCategory.find((c) => c.id === editor.categoryId)
              return hist ? <p className="mt-2 text-xs text-text-tertiary">Spent {fmt(hist.total)} so far in {formatMonth(month)}.</p> : null
            })()}
          </div>
        </form>
      </Modal>

      {/* Suggestion review */}
      <Modal
        isOpen={review.open}
        onClose={() => setReview({ open: false, picks: {} })}
        size="lg"
        title={
          <span className="flex items-center gap-2">
            Suggested budgets <SourceTag source={suggest.data?.source} />
          </span>
        }
        description="Based on a weighted average and median of your last 6 months. Adjust anything before applying."
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setReview({ open: false, picks: {} })}>
              Cancel
            </Button>
            <Button className="flex-1" disabled={!selectedCount} isLoading={bulk.isPending} onClick={applySuggestions}>
              Apply {selectedCount || ''}
            </Button>
          </div>
        }
      >
        {(suggest.data?.suggestions.length ?? 0) === 0 ? (
          <EmptyState title="Not enough history yet" description="Log at least a week of spending and PennyWise will suggest budgets per category." />
        ) : (
          <ul className="space-y-2">
            {suggest.data!.suggestions.map((s: BudgetSuggestion) => {
              const pick = review.picks[s.categoryId] ?? { on: false, amount: String(s.suggestedBudget) }
              const cat = expenseCats.find((c) => c.id === s.categoryId)
              const exists = budgeted.has(s.categoryId)
              return (
                <li
                  key={s.categoryId}
                  className={cn('rounded-[var(--radius-lg)] border p-3.5 transition-colors', pick.on ? 'border-forest/40 bg-primary-50' : 'border-line bg-surface')}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={pick.on}
                      onChange={(e) => setReview((r) => ({ ...r, picks: { ...r.picks, [s.categoryId]: { ...pick, on: e.target.checked } } }))}
                      className="h-4 w-4 flex-shrink-0 accent-forest"
                      aria-label={`Apply ${s.category}`}
                    />
                    {cat && <CategoryIcon icon={cat.icon} color={cat.color} size="sm" />}
                    <span className="flex-1 truncate font-semibold text-text-primary">
                      {s.category}
                      {exists && <span className="ml-2 text-xs font-normal text-text-tertiary">(replaces current)</span>}
                    </span>
                    <div className="relative w-32">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-text-tertiary">{currencySymbol(currency)}</span>
                      <input
                        type="number"
                        value={pick.amount}
                        onChange={(e) => setReview((r) => ({ ...r, picks: { ...r.picks, [s.categoryId]: { on: true, amount: e.target.value } } }))}
                        className={cn(fieldClass, 'num h-10 pl-7 text-right text-sm font-semibold')}
                        aria-label={`${s.category} amount`}
                      />
                    </div>
                  </div>
                  <p className="mt-2 pl-7 text-xs leading-relaxed text-text-secondary">{s.reason}</p>
                </li>
              )
            })}
          </ul>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={() => clear.mutate(month, { onSuccess: () => setConfirmClear(false) })}
        isLoading={clear.isPending}
        title={`Clear budgets for ${formatMonth(month)}?`}
        description="All budgets for this month are removed. Your transactions are not affected."
        confirmLabel="Clear budgets"
      />
    </div>
  )
}
