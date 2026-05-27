import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  authService,
  categoryService,
  transactionService,
  budgetService,
  analyticsService,
  aiService,
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
    onError: () => toast.error('Failed to create category'),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => categoryService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category deleted')
    },
    onError: () => toast.error('Failed to delete category'),
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
      toast.success('Transaction added')
    },
    onError: () => toast.error('Failed to add transaction'),
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
      toast.success('Transaction updated')
    },
    onError: () => toast.error('Failed to update transaction'),
  })
}

export function useDeleteTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => transactionService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Transaction deleted')
    },
    onError: () => toast.error('Failed to delete transaction'),
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
    onError: () => toast.error('Failed to save budget'),
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
    enabled: false,
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
