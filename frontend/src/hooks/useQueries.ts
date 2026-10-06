import { useQuery, useMutation, useQueryClient, keepPreviousData, type QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  authService,
  categoryService,
  transactionService,
  budgetService,
  analyticsService,
  aiService,
  exportService,
  type TransactionFilters,
} from '@/lib/services'
import { useAuthStore } from '@/stores/auth.store'
import { apiError, downloadBlob, todayISO } from '@/lib/utils'
import type { Transaction, TransactionInput, TxType } from '@/types'

/** Everything derived from transactions/budgets. */
function invalidateFinance(qc: QueryClient) {
  qc.invalidateQueries({ queryKey: ['transactions'] })
  qc.invalidateQueries({ queryKey: ['dashboard'] })
  qc.invalidateQueries({ queryKey: ['budgets'] })
  qc.invalidateQueries({ queryKey: ['trend'] })
}

// ─── Auth ───
function useAuthMutation<V>(fn: (v: V) => ReturnType<typeof authService.login>, fallback: string) {
  const setAuth = useAuthStore((s) => s.setAuth)
  const qc = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: ({ data }) => {
      qc.clear()
      setAuth(data.token, data.user)
    },
    onError: (err) => toast.error(apiError(err, fallback)),
  })
}

export function useLogin() {
  return useAuthMutation(({ email, password }: { email: string; password: string }) => authService.login(email, password), 'Login failed')
}

export function useRegister() {
  return useAuthMutation(
    ({ email, password, name }: { email: string; password: string; name: string }) => authService.register(email, password, name),
    'Registration failed'
  )
}

export function useDemoLogin() {
  return useAuthMutation(() => authService.demo(), 'Could not start the demo')
}

export function useUpdateProfile() {
  const updateUser = useAuthStore((s) => s.updateUser)
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name?: string; currency?: string }) => authService.updateMe(data),
    onSuccess: ({ data }) => {
      updateUser(data.user)
      invalidateFinance(qc)
      toast.success('Profile saved')
    },
    onError: (err) => toast.error(apiError(err, 'Failed to save profile')),
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ current, next }: { current: string; next: string }) => authService.changePassword(current, next),
    onSuccess: () => toast.success('Password updated'),
    onError: (err) => toast.error(apiError(err, 'Failed to update password')),
  })
}

export function useDeleteAccount() {
  const logout = useAuthStore((s) => s.logout)
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => authService.deleteMe(),
    onSuccess: () => {
      qc.clear()
      logout()
    },
    onError: (err) => toast.error(apiError(err, 'Failed to delete account')),
  })
}

// ─── Categories ───
export function useCategories(type?: TxType) {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll().then((r) => r.data.categories),
    select: type ? (cats) => cats.filter((c) => c.type === type) : undefined,
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; icon: string; color: string; type: TxType }) => categoryService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category created')
    },
    onError: (err) => toast.error(apiError(err, 'Failed to create category')),
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; icon?: string; color?: string } }) =>
      categoryService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      invalidateFinance(qc)
      toast.success('Category updated')
    },
    onError: (err) => toast.error(apiError(err, 'Failed to update category')),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => categoryService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      invalidateFinance(qc)
      toast.success('Category deleted')
    },
    onError: (err) => toast.error(apiError(err, 'Failed to delete category')),
  })
}

// ─── Transactions ───
export function useTransactions(filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => transactionService.getAll(filters).then((r) => r.data.transactions),
    placeholderData: keepPreviousData,
  })
}

export function useCreateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: TransactionInput) => transactionService.create(data),
    onSuccess: ({ data }) => {
      invalidateFinance(qc)
      toast.success(data.transaction.type === 'income' ? 'Income added' : 'Expense added')
    },
    onError: (err) => toast.error(apiError(err, 'Failed to add transaction')),
  })
}

export function useUpdateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TransactionInput> }) => transactionService.update(id, data),
    onSuccess: () => {
      invalidateFinance(qc)
      toast.success('Transaction updated')
    },
    onError: (err) => toast.error(apiError(err, 'Failed to update transaction')),
  })
}

/** Deletes immediately and offers a 6-second Undo that re-creates the transaction. */
export function useDeleteTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (txn: Transaction) => transactionService.delete(txn.id).then(() => txn),
    onSuccess: (txn) => {
      invalidateFinance(qc)
      toast.success('Transaction deleted', {
        duration: 6000,
        action: {
          label: 'Undo',
          onClick: () =>
            transactionService
              .create({
                categoryId: txn.categoryId,
                amount: txn.amount,
                note: txn.note ?? undefined,
                date: txn.date.slice(0, 10),
              })
              .then(() => {
                invalidateFinance(qc)
                toast.success('Restored')
              })
              .catch((err) => toast.error(apiError(err, 'Could not restore'))),
        },
      })
    },
    onError: (err) => toast.error(apiError(err, 'Failed to delete transaction')),
  })
}

export function useClearTransactions() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (month?: string) => transactionService.clear(month),
    onSuccess: ({ data }) => {
      invalidateFinance(qc)
      toast.success(`Cleared ${data.count} transaction${data.count === 1 ? '' : 's'}`)
    },
    onError: (err) => toast.error(apiError(err, 'Failed to clear transactions')),
  })
}

// ─── Budgets ───
export function useBudgets(month?: string) {
  return useQuery({
    queryKey: ['budgets', month],
    queryFn: () => budgetService.getAll(month).then((r) => r.data.budgets),
  })
}

export function useUpsertBudget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { categoryId: string; amount: number; month: string }) => budgetService.upsert(data),
    onSuccess: () => {
      invalidateFinance(qc)
      toast.success('Budget saved')
    },
    onError: (err) => toast.error(apiError(err, 'Failed to save budget')),
  })
}

export function useBulkBudgets() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ month, items }: { month: string; items: { categoryId: string; amount: number }[] }) =>
      budgetService.bulk(month, items),
    onSuccess: ({ data }) => {
      invalidateFinance(qc)
      toast.success(`Applied ${data.budgets.length} budget${data.budgets.length === 1 ? '' : 's'}`)
    },
    onError: (err) => toast.error(apiError(err, 'Failed to apply budgets')),
  })
}

export function useCopyBudgets() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (month: string) => budgetService.copyPrevious(month),
    onSuccess: ({ data }) => {
      invalidateFinance(qc)
      if (data.copied) toast.success(`Copied ${data.copied} budget${data.copied === 1 ? '' : 's'} from last month`)
      else toast.info('Nothing to copy — last month has no new budgets')
    },
    onError: (err) => toast.error(apiError(err, 'Failed to copy budgets')),
  })
}

export function useDeleteBudget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => budgetService.delete(id),
    onSuccess: () => {
      invalidateFinance(qc)
      toast.success('Budget removed')
    },
    onError: (err) => toast.error(apiError(err, 'Failed to delete budget')),
  })
}

export function useClearBudgets() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (month?: string) => budgetService.clear(month),
    onSuccess: ({ data }) => {
      invalidateFinance(qc)
      toast.success(`Cleared ${data.count} budget${data.count === 1 ? '' : 's'}`)
    },
    onError: (err) => toast.error(apiError(err, 'Failed to clear budgets')),
  })
}

// ─── Analytics ───
export function useDashboard(month?: string) {
  return useQuery({
    queryKey: ['dashboard', month],
    queryFn: () => analyticsService.dashboard(month).then((r) => r.data),
    placeholderData: keepPreviousData,
  })
}

export function useTrend(months = 6) {
  return useQuery({
    queryKey: ['trend', months],
    queryFn: () => analyticsService.trend(months).then((r) => r.data),
    placeholderData: keepPreviousData,
  })
}

// ─── AI ───
export function useAiStatus() {
  return useQuery({
    queryKey: ['ai-status'],
    queryFn: () => aiService.status().then((r) => r.data),
    staleTime: Infinity,
  })
}

export function useAISummary() {
  return useMutation({
    mutationFn: (month: string) => aiService.summary(month).then((r) => r.data),
    onError: (err) => toast.error(apiError(err, 'Could not generate a summary')),
  })
}

export function useAISuggestBudget() {
  return useMutation({
    mutationFn: (month: string) => aiService.suggestBudget(month).then((r) => r.data),
    onError: (err) => toast.error(apiError(err, 'Could not generate suggestions')),
  })
}

export function useAIInsight() {
  return useMutation({
    mutationFn: (month: string) => aiService.insight(month).then((r) => r.data),
    onError: (err) => toast.error(apiError(err, 'Could not generate insights')),
  })
}

export function usePrediction() {
  return useQuery({
    queryKey: ['trend', 'prediction'],
    queryFn: () => aiService.predict().then((r) => r.data),
    staleTime: 10 * 60 * 1000,
  })
}

// ─── Export ───
export function useExportCSV() {
  return useMutation({
    mutationFn: (month?: string) => exportService.csv(month).then((blob) => ({ blob, month })),
    onSuccess: ({ blob, month }) => {
      downloadBlob(blob, `pennywise-${month ?? todayISO()}.csv`)
      toast.success('CSV downloaded')
    },
    onError: () => toast.error('Failed to export CSV'),
  })
}
