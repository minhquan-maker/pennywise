export type TxType = 'expense' | 'income'
export type Severity = 'positive' | 'warning' | 'info'
export type AiSource = 'ai' | 'engine'

export interface User {
  id: string
  email: string
  name: string
  currency: string
  isDemo?: boolean
  createdAt?: string
}

export interface Category {
  id: string
  userId: string
  name: string
  icon: string
  color: string
  type: TxType
  isDefault: boolean
}

export interface Transaction {
  id: string
  userId: string
  categoryId: string
  amount: number
  type: TxType
  note: string | null
  date: string
  createdAt: string
  category: Category
}

export interface TransactionInput {
  categoryId: string
  amount: number
  note?: string
  /** Calendar day, YYYY-MM-DD */
  date: string
}

export interface Budget {
  id: string
  userId: string
  categoryId: string
  amount: number
  month: string
  category: Category
}

export interface Insight {
  title: string
  body: string
  category: string
  severity: Severity
}

export interface CategoryTotal {
  id: string
  name: string
  icon: string
  color: string
  total: number
  prevTotal: number
  count: number
  share: number
}

export interface BudgetStatus {
  id: string
  categoryId: string
  name: string
  icon: string
  color: string
  amount: number
  spent: number
  remaining: number
  projected: number
  pct: number
  status: 'ok' | 'warning' | 'over'
  atRisk: boolean
}

export interface HealthScore {
  score: number
  label: 'Excellent' | 'Good' | 'Fair' | 'Needs attention'
  parts: { savings: number; budgets: number; trend: number }
}

export interface DashboardData {
  month: string
  currency: string
  total: number
  expense: number
  income: number
  net: number
  prevMonthTotal: number
  /** Last month's spending up to the same day (equals prevMonthTotal for past months) */
  prevToDate: number
  prevIncome: number
  changePercent: number
  savingsRate: number | null
  historicalAvg: number | null
  projectedExpense: number
  daysInMonth: number
  elapsedDays: number
  byCategory: CategoryTotal[]
  incomeByCategory: CategoryTotal[]
  daily: { date: string; expense: number; income: number; cumulative: number | null }[]
  last7Days: { date: string; total: number }[]
  weekendShare: number | null
  budget: {
    total: number
    spent: number
    remaining: number
    safePerDay: number
    items: BudgetStatus[]
  }
  health: HealthScore
  insights: Insight[]
  transactionCount: number
}

export interface TrendPoint {
  month: string
  expense: number
  income: number
  total: number
  net: number
  savingsRate: number | null
}

export interface WeekdayPoint {
  day: string
  total: number
  count: number
  average: number
}

export interface TrendData {
  trend: TrendPoint[]
  weekday: WeekdayPoint[]
}

export interface Prediction {
  predicted: number
  low: number
  high: number
  changePercent: number
  trendPercent: number
  month: string
  basis: { month: string; total: number }[]
  method: string
  reason: string
  source: AiSource
}

export interface BudgetSuggestion {
  categoryId: string
  category: string
  suggestedBudget: number
  average: number
  last: number
  trendPercent: number
  reason: string
}
