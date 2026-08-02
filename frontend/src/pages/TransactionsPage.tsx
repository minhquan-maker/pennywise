import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Pencil, Trash2, Plus, X } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { Modal } from '@/components/ui/Modal'
import { TransactionModal } from '@/components/ui/TransactionModal'
import { formatCurrency, formatDate, getCurrentMonth, formatMonth, cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'
import { transactionService, clearService } from '@/lib/services'
import { useCategories } from '@/hooks/useQueries'
import type { Transaction } from '@/types'

export function TransactionsPage() {
  const user = useAuthStore((s) => s.user)
  const currency = user?.currency || 'USD'
  const [month, setMonth] = useState(getCurrentMonth())
  const [categoryFilter, setCategoryFilter] = useState('')
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editTxn, setEditTxn] = useState<Transaction | null>(null)
  const [fabOpen, setFabOpen] = useState(false)
  const [confirmClearOpen, setConfirmClearOpen] = useState(false)

  const qc = useQueryClient()

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions', { month, category: categoryFilter, search }],
    queryFn: () => transactionService.getAll({ month, category: categoryFilter, search }).then((r) => r.data!.transactions),
  })

  const { data: categories = [] } = useCategories()

  const createTxn = useMutation({
    mutationFn: (data: { categoryId: string; amount: number; note?: string; date: string }) =>
      transactionService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['budgets'] })
      setModalOpen(false)
      setEditTxn(null)
    },
  })

  const updateTxn = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof transactionService.update>[1] }) =>
      transactionService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['budgets'] })
      setModalOpen(false)
      setEditTxn(null)
    },
  })

  const deleteTxn = useMutation({
    mutationFn: (id: string) => transactionService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['budgets'] })
    },
  })

  const clearAll = useMutation({
    mutationFn: () => clearService.clearAllTransactions(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['budgets'] })
      setFabOpen(false)
      setConfirmClearOpen(false)
    },
  })

  const handleModalSubmit = (data: { categoryId: string; amount: number; note?: string; date: string }) => {
    if (editTxn) {
      updateTxn.mutate({ id: editTxn.id, data })
    } else {
      createTxn.mutate(data)
    }
  }

  const openAdd = () => {
    setEditTxn(null)
    setModalOpen(true)
  }

  const openEdit = (txn: Transaction) => {
    setEditTxn(txn)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditTxn(null)
  }

  const hasActiveFilters = categoryFilter || search

  const handleClearFilters = () => {
    setCategoryFilter('')
    setSearch('')
  }

  const isMutating = createTxn.isPending || updateTxn.isPending

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Transactions</h1>
          <p className="text-base text-text-secondary mt-1">{formatMonth(month)} · {user?.name}</p>
        </div>
        {transactions && (
          <Badge
            label={`${transactions.length} transaction${transactions.length !== 1 ? 's' : ''}`}
            color="#BFFF00"
            variant="soft"
            size="sm"
          />
        )}
      </div>

      {/* Filter bar */}
      <Card variant="dark" padding="sm">
        <div className="flex items-center gap-3">
          {/* Search — dominant, clean */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search transactions..."
              className="w-full h-12 pl-4 pr-4 rounded-xl border border-[#262626] bg-neutral-800 text-sm text-white placeholder:text-text-tertiary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {/* Month — compact */}
          <input
            type="month"
            max={getCurrentMonth()}
            value={month}
            onChange={e => setMonth(e.target.value)}
            className="h-12 px-4 rounded-xl border border-[#262626] bg-neutral-800 text-sm text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
          />
          {/* Category — clean dropdown, no icon */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="h-12 px-4 rounded-xl border border-[#262626] bg-neutral-800 text-sm text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all appearance-none pr-8"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23a3a3a3' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              Clear
            </Button>
          )}
        </div>
      </Card>

      {/* Transaction list */}
      {isLoading ? (
        <Card variant="default" padding="none">
          <div>
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-5 py-4 border-b border-surface-border last:border-0"
              >
                <Skeleton variant="circular" className="w-10 h-10 flex-shrink-0" />
                <div className="flex-1 space-y-2 min-w-0">
                  <Skeleton variant="text" className="w-48" />
                  <Skeleton variant="text" className="w-32" />
                </div>
                <Skeleton variant="text" className="w-20 flex-shrink-0" />
              </div>
            ))}
          </div>
        </Card>
      ) : transactions?.length === 0 ? (
        <Card variant="dark" padding="lg">
          <div className="text-center py-16">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-neutral-800">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-text-tertiary"
                >
                  <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
                  <path d="M8 10h8M8 14h5" />
                </svg>
              </div>
            </div>
            <p className="text-white font-semibold mb-1">No transactions yet</p>
            <p className="text-sm text-text-secondary mb-1">
              Start tracking your expenses by adding your first transaction.
            </p>
            <p className="text-xs text-text-tertiary">
              Tap the + button below to get started.
            </p>
          </div>
        </Card>
      ) : (
        <Card variant="dark" padding="none">
          {transactions?.map((txn) => {
            const catColor = txn.category?.color || '#BFFF00'
            return (
              <div
                key={txn.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-neutral-800 transition-colors border-b border-[#262626] last:border-0 group"
              >
                {/* Category dot */}
                <span
                  className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: `${catColor}1a` }}
                >
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: catColor }}
                  />
                </span>
                {/* Note + date */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {txn.note || txn.category?.name}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {formatDate(txn.date)} · {txn.category?.name}
                  </p>
                </div>
                {/* Amount */}
                <p className="text-sm font-bold tabular-nums text-white flex-shrink-0">
                  {formatCurrency(txn.amount, currency)}
                </p>
                {/* Actions (visible on hover) */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    iconOnly
                    icon={<Pencil className="h-3.5 w-3.5" />}
                    onClick={() => openEdit(txn)}
                    className="!w-8 !h-8 !p-0"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    iconOnly
                    icon={<Trash2 className="h-3.5 w-3.5" />}
                    onClick={() => deleteTxn.mutate(txn.id)}
                    className="!w-8 !h-8 !p-0 text-danger-500 hover:text-danger-600 hover:bg-danger-50"
                  />
                </div>
              </div>
            )
          })}
        </Card>
      )}

      {/* FAB Menu */}
      {fabOpen && (
        <div className="fixed bottom-24 right-6 z-40 flex flex-col gap-2 lg:bottom-26 lg:right-8">
          <button
            onClick={() => { setFabOpen(false); setConfirmClearOpen(true) }}
            className="flex items-center gap-3 pl-4 pr-5 py-3 rounded-2xl bg-neutral-800 border border-[#262626] text-white shadow-xl hover:bg-neutral-700 transition-all"
          >
            <span className="text-sm font-medium">Clear All</span>
            <span className="w-8 h-8 rounded-full bg-red-900/50 flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-red-400" />
            </span>
          </button>
          <button
            onClick={() => {
              setFabOpen(false)
              openAdd()
            }}
            className="flex items-center gap-3 pl-4 pr-5 py-3 rounded-2xl bg-neutral-800 border border-[#262626] text-white shadow-xl hover:bg-neutral-700 transition-all"
          >
            <span className="text-sm font-medium">Add Transaction</span>
            <span className="w-8 h-8 rounded-full bg-primary-900/50 flex items-center justify-center">
              <Plus className="w-4 h-4 text-primary-400" />
            </span>
          </button>
        </div>
      )}

      {/* FAB Toggle */}
      <button
        onClick={() => setFabOpen((prev) => !prev)}
        aria-label="Toggle menu"
        className={cn(
          'fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 lg:bottom-8 lg:right-8',
          fabOpen
            ? 'bg-neutral-800 text-white shadow-xl'
            : 'bg-primary-500 text-[#0A0A0A] shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:scale-105 active:scale-95'
        )}
      >
        {fabOpen ? <X className="h-6 w-6" strokeWidth={2.5} /> : <Plus className="h-6 w-6" strokeWidth={2.5} />}
      </button>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
        initialData={editTxn}
        categories={categories}
        isLoading={isMutating}
        currency={currency}
      />

      {/* Clear All Confirmation Modal */}
      <Modal isOpen={confirmClearOpen} onClose={() => setConfirmClearOpen(false)}>
        <div className="flex flex-col items-center text-center p-2">
          <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
            <Trash2 size={26} className="text-red-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Clear All Transactions?</h3>
          <p className="text-sm text-text-secondary mb-6 max-w-xs">
            This will delete all transactions for{' '}
            <span className="text-white font-medium">{formatMonth(month)}</span>. This action cannot be undone.
          </p>
          <div className="flex gap-3 w-full">
            <button
              onClick={() => setConfirmClearOpen(false)}
              className="flex-1 h-11 px-4 rounded-xl border border-[#333] bg-neutral-800 text-sm font-semibold text-white hover:bg-neutral-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => clearAll.mutate()}
              disabled={clearAll.isPending}
              className="flex-1 h-11 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-sm font-semibold text-white transition-colors disabled:opacity-50"
            >
              {clearAll.isPending ? 'Clearing...' : 'Clear All'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
