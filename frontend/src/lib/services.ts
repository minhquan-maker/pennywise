import api from './axios'
import type { User, Category, Transaction, Budget, DashboardData, TrendData } from '@/types'

// Auth
export const authService = {
  register: (email: string, password: string, name: string) =>
    api.post<{ token: string; user: User }>('/auth/register', { email, password, name }),
  login: (email: string, password: string) =>
    api.post<{ token: string; user: User }>('/auth/login', { email, password }),
  getMe: () => api.get<{ user: User }>('/auth/me'),
  updateMe: (data: { name?: string; currency?: string }) =>
    api.put<{ user: User }>('/auth/me', data),
  deleteMe: () => api.delete('/auth/me'),
}

// Categories
export const categoryService = {
  getAll: () => api.get<{ categories: Category[] }>('/categories'),
  create: (data: { name: string; icon: string; color: string }) =>
    api.post<{ category: Category }>('/categories', data),
  update: (id: string, data: { name?: string; icon?: string; color?: string }) =>
    api.put<{ category: Category }>(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
}

// Transactions
export const transactionService = {
  getAll: (filters?: { month?: string; category?: string; search?: string }) => {
    const params = new URLSearchParams()
    if (filters?.month) params.set('month', filters.month)
    if (filters?.category) params.set('category', filters.category)
    if (filters?.search) params.set('search', filters.search)
    return api.get<{ transactions: Transaction[] }>(`/transactions?${params}`)
  },
  create: (data: { categoryId: string; amount: number; note?: string; date: string }) =>
    api.post<{ transaction: Transaction }>('/transactions', data),
  update: (id: string, data: { categoryId?: string; amount?: number; note?: string; date?: string }) =>
    api.put<{ transaction: Transaction }>(`/transactions/${id}`, data),
  delete: (id: string) => api.delete(`/transactions/${id}`),
}

// Budgets
export const budgetService = {
  getAll: (month?: string) => {
    const params = month ? `?month=${month}` : ''
    return api.get<{ budgets: Budget[] }>(`/budgets${params}`)
  },
  upsert: (data: { categoryId: string; amount: number; month: string }) =>
    api.put<{ budget: Budget }>('/budgets', data),
  delete: (id: string) => api.delete(`/budgets/${id}`),
}

// Analytics
export const analyticsService = {
  dashboard: (month?: string) => {
    const params = month ? `?month=${month}` : ''
    return api.get<DashboardData>(`/analytics/dashboard${params}`)
  },
  trend: (months = 6) => api.get<{ trend: TrendData[] }>(`/analytics/trend?months=${months}`),
}

// Clear data
export const clearService = {
  clearAllTransactions: () => api.delete('/transactions/clear'),
  clearAllBudgets: () => api.delete('/budgets/clear'),
  exportCSV: async (month?: string): Promise<Blob> => {
    const params = month ? `?month=${month}` : ''
    const response = await api.get(`/export/csv${params}`, {
      responseType: 'blob',
    })
    return response.data
  },
}

// AI
export const aiService = {
  summary: (month: string) => api.post<{ summary: string }>('/ai/summary', { month }),
  suggestBudget: (month: string) => api.post('/ai/suggest-budget', { month }),
  insight: (month: string) => api.post('/ai/insight', { month }),
  predict: () => api.post('/ai/predict', {}),
}
