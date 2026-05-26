export interface User {
  id: string
  email: string
  name: string
  currency: string
  createdAt?: string
}

export interface Category {
  id: string
  userId: string
  name: string
  icon: string
  color: string
  isDefault: boolean
}

export interface Transaction {
  id: string
  userId: string
  categoryId: string
  amount: number
  note: string | null
  date: string
  createdAt: string
  category: Category
}

export interface Budget {
  id: string
  userId: string
  categoryId: string
  amount: number
  month: string
  category: Category
}

export interface DashboardData {
  month: string
  total: number
  prevMonthTotal: number
  changePercent: number
  byCategory: { name: string; icon: string; color: string; total: number }[]
  last7Days: { date: string; total: number }[]
}

export interface TrendData {
  month: string
  total: number
}

export interface ApiResponse<T> {
  data?: T
  error?: string
}
