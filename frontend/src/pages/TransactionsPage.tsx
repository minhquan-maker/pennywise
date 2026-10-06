import { useEffect, useMemo, useState } from 'react'
import { Download, Plus, ReceiptText, Search, Trash2, X } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { PageHeader } from '@/components/ui/PageHeader'
import { MonthStepper } from '@/components/ui/MonthStepper'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { fieldClass } from '@/components/ui/Input'
import { cn, formatCurrency, formatDayHeading, formatMonth, getCurrentMonth } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'
import { useCategories, useClearTransactions, useDeleteTransaction, useExportCSV, useTransactions } from '@/hooks/useQueries'
import type { Transaction, TxType } from '@/types'

function useDebounced<T>(value: T, ms = 300) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return v
}

export function TransactionsPage() {
  const currency = useAuthStore((s) => s.user?.currency) || 'USD'
  const { openAdd, openEdit } = useUiStore()
  const [month, setMonth] = useState(getCurrentMonth())
  const [type, setType] = useState<'all' | TxType>('all')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)
  const search = useDebounced(searchInput.trim())

  const { data: categories = [] } = useCategories()
  const { data: transactions = [], isLoading, isFetching } = useTransactions({
    month,
    type: type === 'all' ? undefined : type,
    category: categoryFilter || undefined,
    search: search || undefined,
  })
  const deleteTxn = useDeleteTransaction()
  const clearMonth = useClearTransactions()
  const exportCsv = useExportCSV()

  const fmt = (n: number) => formatCurrency(n, currency)
  const totals = useMemo(() => {
    const income = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    return { income, expense, net: income - expense }
  }, [transactions])

  const groups = useMemo(() => {
    const map = new Map<string, Transaction[]>()
    for (const t of transactions) {
      const day = t.date.slice(0, 10)
      map.set(day, [...(map.get(day) ?? []), t])
    }
    return [...map.entries()]
  }, [transactions])

  const visibleCategories = categories.filter((c) => type === 'all' || c.type === type)
  const hasFilters = !!(categoryFilter || searchInput || type !== 'all')
  const resetFilters = () => {
    setCategoryFilter('')
    setSearchInput('')
    setType('all')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Ledger"
        title="Transactions"
        actions={
          <>
            <MonthStepper value={month} onChange={setMonth} />
            <Button className="hidden lg:inline-flex" icon={<Plus className="h-4 w-4" />} onClick={() => openAdd()}>
              Add
            </Button>
          </>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {[
          { label: 'Income', value: fmt(totals.income), className: 'text-primary-400' },
          { label: 'Spending', value: fmt(totals.expense), className: 'text-text-primary' },
          { label: 'Net', value: formatCurrency(totals.net, currency, { sign: true }), className: totals.net < 0 ? 'text-danger-400' : 'text-text-primary' },
        ].map((s) => (
          <div key={s.label} className="rounded-[var(--radius-xl)] border border-line bg-surface px-3 py-3 sm:px-5 sm:py-4">
            <p className="text-[11px] font-medium text-text-tertiary sm:text-xs">{s.label}</p>
            <p className={cn('num mt-1 truncate text-[13px] font-bold sm:text-2xl', s.className)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search notes or categories…"
            className={cn(fieldClass, 'rounded-full pl-11')}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <SegmentedControl
            value={type}
            onChange={(v) => {
              setType(v)
              setCategoryFilter('')
            }}
            options={[
              { value: 'all', label: 'All' },
              { value: 'expense', label: 'Spending' },
              { value: 'income', label: 'Income' },
            ]}
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by category"
            className={cn(fieldClass, 'h-11 w-auto min-w-[9rem] flex-1 cursor-pointer rounded-full pr-8 text-sm lg:flex-none')}
          >
            <option value="">All categories</option>
            {visibleCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {hasFilters && (
            <Button variant="ghost" size="md" iconOnly icon={<X className="h-4 w-4" />} onClick={resetFilters} aria-label="Clear filters" />
          )}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <Card padding="none">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b border-line px-5 py-4 last:border-0">
              <Skeleton variant="circular" className="h-10 w-10" />
              <div className="flex-1 space-y-2">
                <Skeleton variant="text" className="w-40" />
                <Skeleton variant="text" className="w-24" />
              </div>
              <Skeleton variant="text" className="w-16" />
            </div>
          ))}
        </Card>
      ) : groups.length === 0 ? (
        <Card>
          <EmptyState
            icon={<ReceiptText className="h-7 w-7" />}
            title={hasFilters ? 'No matches' : `No transactions in ${formatMonth(month)}`}
            description={hasFilters ? 'Try another search or clear the filters.' : 'Log an expense or income to start building your history.'}
            action={
              hasFilters ? (
                <Button variant="outline" onClick={resetFilters}>
                  Clear filters
                </Button>
              ) : (
                <Button icon={<Plus className="h-4 w-4" />} onClick={() => openAdd()}>
                  Add transaction
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <div className={cn('space-y-5 transition-opacity', isFetching && 'opacity-70')}>
          {groups.map(([day, items]) => {
            const dayNet = items.reduce((s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0)
            return (
              <section key={day}>
                <div className="mb-2 flex items-center justify-between px-1">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">{formatDayHeading(day)}</h3>
                  <span className={cn('num text-xs font-semibold', dayNet >= 0 ? 'text-primary-400' : 'text-text-tertiary')}>
                    {formatCurrency(dayNet, currency, { sign: true })}
                  </span>
                </div>
                <Card padding="none" className="overflow-hidden">
                  {items.map((t) => (
                    <div key={t.id} className="group flex items-center border-b border-line last:border-0">
                      <button
                        onClick={() => openEdit(t)}
                        className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-2 sm:px-5"
                      >
                        <CategoryIcon icon={t.category.icon} color={t.category.color} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-text-primary">{t.note || t.category.name}</p>
                          <p className="truncate text-xs text-text-tertiary">{t.category.name}</p>
                        </div>
                        <span className={cn('num text-[15px] font-bold', t.type === 'income' ? 'text-primary-400' : 'text-text-primary')}>
                          {t.type === 'income' ? '+' : '−'}
                          {fmt(t.amount)}
                        </span>
                      </button>
                      <button
                        onClick={() => deleteTxn.mutate(t)}
                        aria-label={`Delete ${t.note || t.category.name}`}
                        className="mr-2 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-text-tertiary transition-all hover:bg-danger-500/12 hover:text-danger-400 lg:opacity-0 lg:group-hover:opacity-100 lg:focus:opacity-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </Card>
              </section>
            )
          })}
        </div>
      )}

      {/* Month tools */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
        <p className="text-xs text-text-tertiary">
          {transactions.length} transaction{transactions.length === 1 ? '' : 's'}
          {hasFilters ? ' match your filters' : ` in ${formatMonth(month)}`}
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" icon={<Download className="h-4 w-4" />} isLoading={exportCsv.isPending} onClick={() => exportCsv.mutate(month)}>
            Export CSV
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="hover:!bg-danger-500/12 hover:!text-danger-400"
            icon={<Trash2 className="h-4 w-4" />}
            onClick={() => setConfirmClear(true)}
          >
            Clear month
          </Button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={() => clearMonth.mutate(month, { onSuccess: () => setConfirmClear(false) })}
        isLoading={clearMonth.isPending}
        title={`Clear ${formatMonth(month)}?`}
        description={<>This permanently deletes every transaction in <strong className="text-text-primary">{formatMonth(month)}</strong>. Other months are not affected.</>}
        confirmLabel="Delete month"
      />
    </div>
  )
}
