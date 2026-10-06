import api from './axios'
import type {
  AiSource,
  Budget,
  BudgetSuggestion,
  Category,
  DashboardData,
  Insight,
  Prediction,
  Transaction,
  TransactionInput,
  TrendData,
  TxType,
  User,
} from '@/types'

export interface TransactionFilters {
  month?: string
  category?: string
  search?: string
  type?: TxType
  limit?: number
}

// Auth
export const authService = {
  register: (email: string, password: string, name: string) =>
    api.post<{ token: string; user: User }>('/auth/register', { email, password, name }),
  login: (email: string, password: string) =>
    api.post<{ token: string; user: User }>('/auth/login', { email, password }),
  demo: () => api.post<{ token: string; user: User }>('/auth/demo'),
  getMe: () => api.get<{ user: User }>('/auth/me'),
  updateMe: (data: { name?: string; currency?: string }) => api.put<{ user: User }>('/auth/me', data),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put<{ message: string }>('/auth/password', { currentPassword, newPassword }),
  deleteMe: () => api.delete('/auth/me'),
}

// Categories
export const categoryService = {
  getAll: () => api.get<{ categories: Category[] }>('/categories'),
  create: (data: { name: string; icon: string; color: string; type: TxType }) =>
    api.post<{ category: Category }>('/categories', data),
  update: (id: string, data: { name?: string; icon?: string; color?: string }) =>
    api.put<{ category: Category }>(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
}

// Transactions
export const transactionService = {
  getAll: (filters: TransactionFilters = {}) => {
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries(filters)) if (v !== undefined && v !== '') params.set(k, String(v))
    return api.get<{ transactions: Transaction[] }>(`/transactions?${params}`)
  },
  create: (data: TransactionInput) => api.post<{ transaction: Transaction }>('/transactions', data),
  update: (id: string, data: Partial<TransactionInput>) =>
    api.put<{ transaction: Transaction }>(`/transactions/${id}`, data),
  delete: (id: string) => api.delete(`/transactions/${id}`),
  clear: (month?: string) =>
    api.delete<{ count: number }>(`/transactions/clear${month ? `?month=${month}` : ''}`),
}

// Budgets
export const budgetService = {
  getAll: (month?: string) => api.get<{ budgets: Budget[] }>(`/budgets${month ? `?month=${month}` : ''}`),
  upsert: (data: { categoryId: string; amount: number; month: string }) =>
    api.put<{ budget: Budget }>('/budgets', data),
  bulk: (month: string, items: { categoryId: string; amount: number }[]) =>
    api.post<{ budgets: Budget[] }>('/budgets/bulk', { month, items }),
  copyPrevious: (month: string) => api.post<{ copied: number; from: string }>('/budgets/copy', { month }),
  delete: (id: string) => api.delete(`/budgets/${id}`),
  clear: (month?: string) => api.delete<{ count: number }>(`/budgets/clear${month ? `?month=${month}` : ''}`),
}

// Analytics
export const analyticsService = {
  dashboard: (month?: string) => api.get<DashboardData>(`/analytics/dashboard${month ? `?month=${month}` : ''}`),
  trend: (months = 6) => api.get<TrendData>(`/analytics/trend?months=${months}`),
}

// Export
export const exportService = {
  csv: async (month?: string): Promise<Blob> => {
    const response = await api.get(`/export/csv${month ? `?month=${month}` : ''}`, { responseType: 'blob' })
    return response.data
  },
}

// Contact (public)
export const contactService = {
  send: (data: { name: string; email: string; topic: string; message: string; website?: string }) =>
    api.post<{ message: string }>('/contact', data),
}

// AI (falls back to the deterministic engine server-side when no key is configured)
export const aiService = {
  status: () => api.get<{ ai: boolean; model: string | null }>('/ai/status'),
  summary: (month: string) => api.post<{ summary: string; source: AiSource }>('/ai/summary', { month }),
  suggestBudget: (month: string) =>
    api.post<{ suggestions: BudgetSuggestion[]; source: AiSource }>('/ai/suggest-budget', { month }),
  insight: (month: string) => api.post<{ insights: Insight[]; source: AiSource }>('/ai/insight', { month }),
  predict: () => api.post<Prediction>('/ai/predict', {}),
}
