import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  authService,
  categoryService,
  transactionService,
  budgetService,
  analyticsService,
  aiService,
  clearService,
} from '@/lib/services'

// Auth
export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.login(email, password),
    onSuccess: (data) => {
      queryClient.setQueryData(['auth'], data)
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Login failed'
      toast.error(msg)
    },
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: ({ email, password, name }: { email: string; password: string; name: string }) =>
      authService.register(email, password, name),
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Registration failed'
      toast.error(msg)
    },
  })
}

// Categories
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll().then((r) => r.data!.categories),
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; icon: string; color: string }) =>
      categoryService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category created')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to create category'
      toast.error(msg)
    },
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; icon?: string; color?: string } }) =>
      categoryService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category updated')
    },
    onError: () => toast.error('Failed to update category'),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => categoryService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['budgets'] })
      toast.success('Category deleted')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to delete category'
      toast.error(msg)
    },
  })
}

// Transactions
export function useTransactions(filters?: { month?: string; category?: string; search?: string }) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => transactionService.getAll(filters).then((r) => r.data!.transactions),
  })
}

export function useCreateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { categoryId: string; amount: number; note?: string; date: string }) =>
      transactionService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['budgets'] })
      toast.success('Transaction added')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to add transaction'
      toast.error(msg)
    },
  })
}

export function useUpdateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: { categoryId?: string; amount?: number; note?: string; date?: string }
    }) => transactionService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['budgets'] })
      toast.success('Transaction updated')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to update transaction'
      toast.error(msg)
    },
  })
}

export function useDeleteTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => transactionService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['budgets'] })
      toast.success('Transaction deleted')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to delete transaction'
      toast.error(msg)
    },
  })
}

export function useClearAllTransactions() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => clearService.clearAllTransactions(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['budgets'] })
      toast.success('All transactions cleared')
    },
    onError: () => toast.error('Failed to clear transactions'),
  })
}

// Budgets
export function useBudgets(month?: string) {
  return useQuery({
    queryKey: ['budgets', month],
    queryFn: () => budgetService.getAll(month).then((r) => r.data!.budgets),
  })
}

export function useUpsertBudget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { categoryId: string; amount: number; month: string }) =>
      budgetService.upsert(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budgets'] })
      toast.success('Budget saved')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to save budget'
      toast.error(msg)
    },
  })
}

export function useDeleteBudget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => budgetService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budgets'] })
      toast.success('Budget deleted')
    },
    onError: () => toast.error('Failed to delete budget'),
  })
}

export function useClearAllBudgets() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => clearService.clearAllBudgets(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budgets'] })
      toast.success('All budgets cleared')
    },
    onError: () => toast.error('Failed to clear budgets'),
  })
}

// Analytics
export function useDashboard(month?: string) {
  return useQuery({
    queryKey: ['dashboard', month],
    queryFn: () => analyticsService.dashboard(month).then((r) => r.data!),
  })
}

export function useTrend(months = 6) {
  return useQuery({
    queryKey: ['trend', months],
    queryFn: () => analyticsService.trend(months).then((r) => r.data!.trend),
  })
}

// AI
export function useAISummary() {
  return useMutation({
    mutationFn: (month: string) => aiService.summary(month),
  })
}

export function useAISuggestBudget() {
  return useMutation({
    mutationFn: (month: string) => aiService.suggestBudget(month),
  })
}

export function useAIInsight() {
  return useMutation({
    mutationFn: (month: string) => aiService.insight(month),
  })
}

export function useAIPredict() {
  return useMutation({
    mutationFn: () => aiService.predict(),
  })
}

// Export
export function useExportCSV() {
  return useMutation({
    mutationFn: async (month?: string) => {
      const data = await clearService.exportCSV(month)
      return data
    },
  })
}
