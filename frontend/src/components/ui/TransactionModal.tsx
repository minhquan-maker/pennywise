import { useState, useEffect } from 'react'
import { Check, Calendar, FileText } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { Category, Transaction } from '@/types'

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { categoryId: string; amount: number; note?: string; date: string }) => void
  initialData?: Transaction | null
  categories: Category[]
  isLoading?: boolean
  currency: string
}

const QUICK_AMOUNTS = [5, 10, 25, 50, 100]

export function TransactionModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  categories,
  isLoading,
  currency,
}: TransactionModalProps) {
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setAmount(initialData.amount.toString())
        setCategoryId(initialData.categoryId)
        setNote(initialData.note || '')
        setDate(new Date(initialData.date).toISOString().split('T')[0])
      } else {
        setAmount('')
        setCategoryId(categories[0]?.id || '')
        setNote('')
        setDate(new Date().toISOString().split('T')[0])
      }
    }
  }, [isOpen, initialData, categories])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !categoryId || !date) return
    onSubmit({
      categoryId,
      amount: parseFloat(amount),
      note: note || undefined,
      date: new Date(date).toISOString(),
    })
  }

  const setToday = () => setDate(new Date().toISOString().split('T')[0])

  const symbol = currency === 'VND' ? '' : '$'
  const placeholder = currency === 'VND' ? '0' : '0.00'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Transaction' : 'Add Transaction'}
      size="lg"
      footer={
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            variant="gradient"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={!amount || !categoryId || !date}
            icon={<Check className="h-4 w-4" />}
          >
            {initialData ? 'Save Changes' : 'Add Transaction'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Amount + Quick chips */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-text-secondary">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-medium text-base">{symbol}</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={placeholder}
              className="w-full h-14 pl-10 pr-4 rounded-xl border border-surface-border bg-surface-0 text-lg font-semibold text-text-primary placeholder:text-text-tertiary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all tabular-nums"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {QUICK_AMOUNTS.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setAmount(amt.toString())}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all duration-fast',
                  amount === amt.toString()
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'bg-surface-100 text-text-secondary hover:bg-primary-50 hover:text-primary-600'
                )}
              >
                {symbol}{amt}
              </button>
            ))}
          </div>
        </div>

        {/* Category grid — text only, no emoji */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-text-secondary">Category</label>
          <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryId(cat.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 text-left',
                  categoryId === cat.id
                    ? 'bg-primary-50 border-2 border-primary-500 text-primary-700'
                    : 'bg-surface-50 border-2 border-transparent hover:bg-surface-100 text-text-primary'
                )}
              >
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-text-secondary">Date</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary">
              <Calendar className="h-4 w-4" />
            </span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-14 pl-11 pr-4 rounded-xl border border-surface-border bg-surface-0 text-base text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 cursor-pointer"
            />
          </div>
          <button
            type="button"
            onClick={setToday}
            className="text-xs text-primary-500 hover:text-primary-600 font-medium transition-colors"
          >
            Today
          </button>
        </div>

        {/* Note */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-text-secondary">Note (optional)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary">
              <FileText className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What was this for?"
              className="w-full h-14 pl-11 pr-4 rounded-xl border border-surface-border bg-surface-0 text-base text-text-primary placeholder:text-text-tertiary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
            />
          </div>
        </div>
      </form>
    </Modal>
  )
}
