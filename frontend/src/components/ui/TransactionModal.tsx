import { useMemo, useState } from 'react'
import { Calendar, FileText } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'
import { SegmentedControl } from './SegmentedControl'
import { CategoryIcon } from './CategoryIcon'
import { cn, currencySymbol, formatCurrency, shiftDay, todayISO } from '@/lib/utils'
import { useCategories, useCreateTransaction, useUpdateTransaction } from '@/hooks/useQueries'
import { useAuthStore } from '@/stores/auth.store'
import type { Transaction, TxType } from '@/types'

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  initialData?: Transaction | null
  defaultType?: TxType
}

const QUICK = {
  USD: { expense: [5, 10, 20, 50, 100], income: [100, 500, 1000, 2500] },
  VND: { expense: [20_000, 50_000, 100_000, 200_000, 500_000], income: [1_000_000, 5_000_000, 10_000_000, 20_000_000] },
}

export function TransactionModal(props: TransactionModalProps) {
  // Remount the form on every open so it starts from fresh state
  if (!props.isOpen) return null
  return <TransactionForm key={props.initialData?.id ?? 'new'} {...props} />
}

function TransactionForm({ isOpen, onClose, initialData, defaultType = 'expense' }: TransactionModalProps) {
  const currency = useAuthStore((s) => s.user?.currency) || 'USD'
  const { data: categories = [] } = useCategories()
  const create = useCreateTransaction()
  const update = useUpdateTransaction()

  const [type, setType] = useState<TxType>(initialData?.type ?? defaultType)
  const [amount, setAmount] = useState(initialData ? String(initialData.amount) : '')
  const [categoryId, setCategoryId] = useState(initialData?.categoryId ?? '')
  const [note, setNote] = useState(initialData?.note ?? '')
  const [date, setDate] = useState(initialData ? initialData.date.slice(0, 10) : todayISO())

  const typed = useMemo(() => categories.filter((c) => c.type === type), [categories, type])
  const selectedId = typed.some((c) => c.id === categoryId) ? categoryId : typed[0]?.id ?? ''
  const parsed = parseFloat(amount)
  const valid = Number.isFinite(parsed) && parsed > 0 && !!selectedId && !!date
  const busy = create.isPending || update.isPending
  const today = todayISO()

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!valid || busy) return
    const data = { categoryId: selectedId, amount: parsed, note: note.trim() || undefined, date }
    const opts = { onSuccess: onClose }
    if (initialData) update.mutate({ id: initialData.id, data }, opts)
    else create.mutate(data, opts)
  }

  const quick = (QUICK[currency as keyof typeof QUICK] ?? QUICK.USD)[type]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit transaction' : type === 'income' ? 'Add income' : 'Add expense'}
      size="lg"
      footer={
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1 sm:flex-none">
            Cancel
          </Button>
          <Button onClick={() => submit()} isLoading={busy} disabled={!valid} className="flex-1">
            {initialData ? 'Save changes' : `Add ${type}`}
            {valid && !busy && <span className="num opacity-70">· {formatCurrency(parsed, currency)}</span>}
          </Button>
        </div>
      }
    >
      <form onSubmit={submit} className="space-y-6">
        <SegmentedControl
          value={type}
          onChange={setType}
          className="w-full"
          options={[
            { value: 'expense', label: 'Expense' },
            { value: 'income', label: 'Income' },
          ]}
        />

        {/* Amount */}
        <div>
          <div
            className={cn(
              'flex items-center justify-center gap-1 rounded-[var(--radius-xl)] border border-line bg-surface-2 px-4 py-5 transition-colors focus-within:border-primary-500',
              type === 'income' && 'focus-within:border-primary-400'
            )}
          >
            <span className="flex-shrink-0 whitespace-nowrap text-2xl font-semibold text-text-tertiary">{type === 'income' ? '+' : '−'}{currencySymbol(currency)}</span>
            <input
              data-autofocus
              type="number"
              inputMode="decimal"
              step={currency === 'VND' ? '1000' : '0.01'}
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              aria-label="Amount"
              className="num w-full min-w-0 max-w-[11ch] bg-transparent text-center text-4xl sm:text-5xl font-bold text-text-primary placeholder:text-text-tertiary/50 focus:outline-none"
            />
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {quick.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setAmount(String(q))}
                className={cn(
                  'num rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-all',
                  parsed === q
                    ? 'border-primary-500 bg-primary-500 text-forest'
                    : 'border-line bg-surface-2 text-text-secondary hover:border-line-strong hover:text-text-primary'
                )}
              >
                {formatCurrency(q, currency, { compact: currency === 'VND' })}
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div>
          <p className="mb-2.5 text-[13px] font-medium text-text-secondary">Category</p>
          {typed.length === 0 ? (
            <p className="text-sm text-text-tertiary">No {type} categories yet — add one in Settings.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {typed.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryId(c.id)}
                  aria-pressed={selectedId === c.id}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-[var(--radius-lg)] border px-2 py-3 text-xs font-medium transition-all',
                    selectedId === c.id
                      ? 'border-primary-500 bg-primary-500/10 text-text-primary'
                      : 'border-line bg-surface-2 text-text-secondary hover:border-line-strong hover:text-text-primary'
                  )}
                >
                  <CategoryIcon icon={c.icon} color={c.color} size="sm" />
                  <span className="w-full truncate text-center">{c.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Date + note */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="mb-2.5 flex items-center justify-between">
              <label htmlFor="txn-date" className="text-[13px] font-medium text-text-secondary">
                Date
              </label>
              <div className="flex gap-1">
                {[
                  { label: 'Today', value: today },
                  { label: 'Yesterday', value: shiftDay(today, -1) },
                ].map((d) => (
                  <button
                    key={d.label}
                    type="button"
                    onClick={() => setDate(d.value)}
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors',
                      date === d.value ? 'bg-primary-500/15 text-primary-400' : 'text-text-tertiary hover:text-text-primary'
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
              <input
                id="txn-date"
                type="date"
                value={date}
                max={today}
                onChange={(e) => setDate(e.target.value)}
                className="h-12 w-full rounded-[var(--radius-md)] border border-line bg-surface-2 pl-11 pr-3 text-[15px] text-text-primary focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label htmlFor="txn-note" className="mb-2.5 block text-[13px] font-medium text-text-secondary">
              Note <span className="text-text-tertiary">(optional)</span>
            </label>
            <div className="relative">
              <FileText className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
              <input
                id="txn-note"
                type="text"
                value={note}
                maxLength={200}
                onChange={(e) => setNote(e.target.value)}
                placeholder={type === 'income' ? 'e.g. October salary' : 'e.g. Lunch with team'}
                className="h-12 w-full rounded-[var(--radius-md)] border border-line bg-surface-2 pl-11 pr-3 text-[15px] text-text-primary placeholder:text-text-tertiary focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
        <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
      </form>
    </Modal>
  )
}
