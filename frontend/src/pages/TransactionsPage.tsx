import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Pencil, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { FloatingActionButton } from '@/components/ui/FloatingActionButton'
import { TransactionModal } from '@/components/ui/TransactionModal'
import { formatCurrency, formatDate, getCurrentMonth, formatMonth } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'
import { transactionService } from '@/lib/services'
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
      setModalOpen(false)
      setEditTxn(null)
    },
  })

  const deleteTxn = useMutation({
    mutationFn: (id: string) => transactionService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
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
          <h1 className="text-3xl font-extrabold text-text-primary">Transactions</h1>
          <p className="text-base text-text-secondary mt-1">{formatMonth(month)} · {user?.name}</p>
        </div>
        {transactions && (
          <Badge
            label={`${transactions.length} transaction${transactions.length !== 1 ? 's' : ''}`}
            color="#3B82F6"
            variant="soft"
            size="sm"
          />
        )}
      </div>

      {/* Filter bar */}
      <Card variant="bordered" padding="sm">
        <div className="flex items-center gap-3">
          {/* Search — dominant, clean */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search transactions..."
              className="w-full h-12 pl-4 pr-4 rounded-xl border border-surface-border bg-white text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
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
            className="h-12 px-4 rounded-xl border border-surface-border bg-white text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
          />
          {/* Category — clean dropdown, no icon */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="h-12 px-4 rounded-xl border border-surface-border bg-white text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all appearance-none pr-8"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
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
        <Card variant="default" padding="lg">
          <div className="text-center py-16">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-surface-50">
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
            <p className="text-text-primary font-semibold mb-1">No transactions yet</p>
            <p className="text-sm text-text-secondary mb-1">
              Start tracking your expenses by adding your first transaction.
            </p>
            <p className="text-xs text-text-tertiary">
              Tap the + button below to get started.
            </p>
          </div>
        </Card>
      ) : (
        <Card variant="default" padding="none">
          {transactions?.map((txn) => {
            const catColor = txn.category?.color || '#3B82F6'
            return (
              <div
                key={txn.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-surface-50 transition-colors border-b border-surface-border last:border-0 group"
              >
                {/* Category dot */}
                <span
                  className="w-10 h-10 rounded-xl flex-shrink-0"
                  style={{ backgroundColor: `${catColor}1a` }}
                >
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: catColor }}
                  />
                </span>
                {/* Note + date */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">
                    {txn.note || txn.category?.name}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {formatDate(txn.date)} · {txn.category?.name}
                  </p>
                </div>
                {/* Amount */}
                <p className="text-sm font-bold tabular-nums text-text-primary flex-shrink-0">
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

      {/* Floating Action Button */}
      <FloatingActionButton onClick={openAdd} />

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
    </div>
  )
}
