import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Target, Sparkles, Plus, X } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { toast } from 'sonner'
import { formatCurrency, getCurrentMonth, formatMonth } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'
import { useCategories, useBudgets, useUpsertBudget, useDeleteBudget, useAISuggestBudget } from '@/hooks/useQueries'
import { budgetService } from '@/lib/services'

export function BudgetPage() {
  const user = useAuthStore((s) => s.user)
  const currency = user?.currency || 'USD'
  const [month, setMonth] = useState(getCurrentMonth())
  const [modalOpen, setModalOpen] = useState(false)
  const [formCategory, setFormCategory] = useState('')
  const [formAmount, setFormAmount] = useState('')

  const qc = useQueryClient()

  const { data: budgets = [], isLoading } = useBudgets(month)
  const { data: categories = [] } = useCategories()

  // Lazy dashboard for spending data
  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard', month],
    queryFn: () =>
      import('@/lib/services').then(({ analyticsService }) =>
        analyticsService.dashboard(month).then((r) => r.data!)
      ),
  })

  const upsertBudget = useUpsertBudget()
  const deleteBudget = useDeleteBudget()
  const aiSuggest = useAISuggestBudget()

  // Build category spending map
  const categorySpending: Record<string, number> = {}
  for (const cat of dashboardData?.byCategory || []) {
    categorySpending[cat.name] = cat.total
  }

  // Get existing budget category IDs for this month
  const existingBudgetCats = new Set(budgets.map((b) => b.categoryId))

  const handleCloseModal = () => {
    setModalOpen(false)
    setFormCategory('')
    setFormAmount('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    upsertBudget.mutate(
      { categoryId: formCategory, amount: parseFloat(formAmount), month },
      { onSuccess: handleCloseModal }
    )
  }

  const handleAiSuggest = async () => {
    try {
      const { data } = await aiSuggest.mutateAsync(month)
      const suggestions: { category: string; suggestedBudget: number }[] =
        data.suggestions || []
      if (suggestions.length === 0) {
        toast.error('No suggestions returned. Add transactions first for AI to analyze.')
        return
      }
      for (const s of suggestions) {
        const cat = categories.find((c) => c.name === s.category)
        if (cat && !existingBudgetCats.has(cat.id)) {
          upsertBudget.mutate({ categoryId: cat.id, amount: s.suggestedBudget, month })
        }
      }
      qc.invalidateQueries({ queryKey: ['budgets'] })
      toast.success(`AI suggested ${suggestions.length} budget(s) for you!`)
    } catch {
      toast.error('Failed to generate budget suggestions. Check your GROQ_API_KEY.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Budget</h1>
          <p className="text-base text-text-secondary mt-1">Manage your monthly spending limits</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            icon={<Sparkles className="h-4 w-4" />}
            onClick={handleAiSuggest}
            isLoading={aiSuggest.isPending}
          >
            AI Suggest
          </Button>
          <Button
            variant="gradient"
            size="sm"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setModalOpen(true)}
          >
            Set Budget
          </Button>
        </div>
      </div>

      {/* Month selector */}
      <Card variant="dark" padding="sm">
        <div className="flex items-center gap-3">
          <label className="text-sm text-text-secondary font-medium">Month</label>
          <Input
            type="month"
            value={month}
            max={getCurrentMonth()}
            onChange={(e) => setMonth(e.target.value)}
            className="w-44"
          />
          <span className="text-sm font-medium text-primary-400">{formatMonth(month)}</span>
        </div>
      </Card>

      {/* Loading skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} variant="dark" padding="md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Skeleton variant="circular" className="w-10 h-10" />
                  <Skeleton variant="text" className="w-24" />
                </div>
                <Skeleton variant="circular" className="w-8 h-8" />
              </div>
              <Skeleton variant="rectangular" className="w-full h-2 mb-3" />
              <Skeleton variant="text" className="w-32" />
            </Card>
          ))}
        </div>
      ) : budgets.length === 0 ? (
        /* Empty state */
        <Card className="p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-neutral-800">
              <Target className="h-8 w-8 text-text-tertiary" />
            </div>
          </div>
          <p className="text-white font-semibold mb-1">No budgets set</p>
          <p className="text-sm text-text-secondary mb-1">
            Set a budget to track your spending
          </p>
          <p className="text-xs text-text-tertiary mb-6">
            Create a budget to start monitoring your category spending.
          </p>
          <Button
            variant="gradient"
            size="sm"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setModalOpen(true)}
          >
            Set Budget
          </Button>
        </Card>
      ) : (
        /* Budget cards grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-stagger">
          {budgets.map((budget) => {
            const spent = categorySpending[budget.category.name] || 0
            const pct = budget.amount > 0 ? (spent / budget.amount) * 100 : 0
            const isOver = pct >= 100
            const isWarn = pct >= 80 && pct < 100

            const statusColor = isOver
              ? '#EF4444'
              : isWarn
              ? '#F59E0B'
              : '#BFFF00'

            const statusLabel = isOver ? 'Over budget' : isWarn ? 'Near limit' : 'On track'

            return (
              <Card key={budget.id} variant="dark" padding="md">
                {/* Header row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{budget.category.icon}</span>
                    <span className="text-sm font-bold text-white">{budget.category.name}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    iconOnly
                    icon={<X className="h-4 w-4" />}
                    onClick={() => deleteBudget.mutate(budget.id)}
                    className="!text-text-tertiary hover:!text-danger-500 hover:!bg-neutral-800"
                  />
                </div>

                {/* Progress bar */}
                <div className="h-2 rounded-full bg-neutral-800 overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver ? 'bg-danger-500' : isWarn ? 'bg-warning-500' : 'bg-primary-500'
                    }`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>

                {/* Footer row */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary tabular-nums">
                    {formatCurrency(spent, currency)} / {formatCurrency(budget.amount, currency)}
                  </span>
                  <Badge
                    label={statusLabel}
                    color={statusColor}
                    variant="soft"
                    size="sm"
                    dot
                  />
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add/Edit Budget Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title="Set Budget"
        size="md"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleCloseModal} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="gradient"
              type="submit"
              form="budget-form"
              isLoading={upsertBudget.isPending}
              className="flex-1"
            >
              Save
            </Button>
          </div>
        }
      >
        <form
          id="budget-form"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-text-secondary">Category</label>
            <select
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
              required
              className="w-full h-12 px-4 rounded-xl border border-[#262626] bg-neutral-800 text-base text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all appearance-none pr-10 cursor-pointer"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23a3a3a3' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
            >
              <option value="">Select category</option>
              {categories
                .filter((c) => !existingBudgetCats.has(c.id))
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-text-secondary">Budget Amount (USD)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formAmount}
              onChange={(e) => setFormAmount(e.target.value)}
              placeholder="0.00"
              required
              className="w-full h-12 px-4 rounded-xl border border-[#262626] bg-neutral-800 text-base text-white placeholder:text-text-tertiary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all tabular-nums"
            />
          </div>
        </form>
      </Modal>
    </div>
  )
}
