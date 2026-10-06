import { prisma } from '../lib/prisma.js'
import {
  addMonths,
  currentMonth,
  dayKey,
  daysInMonth,
  elapsedDays,
  monthKey,
  monthRange,
  monthSeries,
} from '../lib/dates.js'
import {
  forecastNext,
  formatMoney,
  generateInsights,
  healthScore,
  mean,
  projectMonthEnd,
  safeToSpendPerDay,
  suggestBudgets,
  trimLeadingZeros,
  type CategoryHistory,
} from './finance.engine.js'

const HISTORY_MONTHS = 6
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

async function getCurrency(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { currency: true } })
  return user?.currency || 'USD'
}

export const analyticsService = {
  async getCurrency(userId: string) {
    return getCurrency(userId)
  },

  async getDashboard(userId: string, month: string = currentMonth()) {
    const prevMonth = addMonths(month, -1)
    const historyStart = monthRange(addMonths(month, -HISTORY_MONTHS)).start
    const { start, end } = monthRange(month)

    const [allTxns, budgets, currency] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId, date: { gte: historyStart, lt: end } },
        include: { category: true },
      }),
      prisma.budget.findMany({ where: { userId, month }, include: { category: true } }),
      getCurrency(userId),
    ])
    const fmt = (n: number) => formatMoney(n, currency)

    const thisMonth = allTxns.filter((t) => t.date >= start && t.date < end)
    const prev = allTxns.filter((t) => monthKey(t.date) === prevMonth)
    const sum = (txns: typeof allTxns, type: string) =>
      txns.filter((t) => t.type === type).reduce((s, t) => s + t.amount, 0)

    const expense = sum(thisMonth, 'expense')
    const income = sum(thisMonth, 'income')
    const prevExpense = sum(prev, 'expense')
    const prevIncome = sum(prev, 'income')

    // Expense history of the complete months before `month` (for averages and projections)
    const priorMonths = monthSeries(prevMonth, HISTORY_MONTHS)
    const monthlyExpense = priorMonths.map((m) =>
      allTxns.filter((t) => t.type === 'expense' && monthKey(t.date) === m).reduce((s, t) => s + t.amount, 0)
    )
    const history = trimLeadingZeros(monthlyExpense).slice(-3)
    const historicalAvg = history.length ? mean(history) : null

    // Category breakdowns
    type CatRow = { id: string; name: string; icon: string; color: string; total: number; prevTotal: number; count: number }
    const groupByCategory = (type: string) => {
      const map = new Map<string, CatRow>()
      for (const t of thisMonth.filter((t) => t.type === type)) {
        const row = map.get(t.categoryId) ?? {
          id: t.categoryId,
          name: t.category.name,
          icon: t.category.icon,
          color: t.category.color,
          total: 0,
          prevTotal: 0,
          count: 0,
        }
        row.total += t.amount
        row.count += 1
        map.set(t.categoryId, row)
      }
      for (const t of prev.filter((t) => t.type === type)) {
        const row = map.get(t.categoryId)
        if (row) row.prevTotal += t.amount
      }
      const total = type === 'expense' ? expense : income
      return [...map.values()]
        .map((r) => ({ ...r, share: total > 0 ? r.total / total : 0 }))
        .sort((a, b) => b.total - a.total)
    }
    const byCategory = groupByCategory('expense')
    const incomeByCategory = groupByCategory('income')

    // Daily series for the month
    const totalDays = daysInMonth(month)
    const elapsed = elapsedDays(month)
    let cumulative = 0
    const daily = Array.from({ length: totalDays }, (_, i) => {
      const date = dayKey(new Date(start.getTime() + i * 86_400_000))
      const dayTx = thisMonth.filter((t) => dayKey(t.date) === date)
      const dayExpense = dayTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
      const dayIncome = dayTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
      cumulative += dayExpense
      return { date, expense: dayExpense, income: dayIncome, cumulative: i < Math.max(elapsed, 1) ? cumulative : null }
    })

    // Last 7 days ending today (current month) or at the month's last day (past month)
    const anchor = month === currentMonth() ? new Date() : new Date(end.getTime() - 86_400_000)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), anchor.getUTCDate() - (6 - i)))
      const date = dayKey(d)
      const total = allTxns
        .filter((t) => t.type === 'expense' && dayKey(t.date) === date)
        .reduce((s, t) => s + t.amount, 0)
      return { date, total }
    })

    // Weekend share of this month's spending
    const weekendSpend = thisMonth
      .filter((t) => t.type === 'expense' && [0, 6].includes(t.date.getUTCDay()))
      .reduce((s, t) => s + t.amount, 0)
    const weekendShare = expense > 0 ? weekendSpend / expense : null

    // Budgets — matched by category id
    const spentByCat = new Map(byCategory.map((c) => [c.id, c.total]))
    const budgetRows = budgets
      .map((b) => {
        const spent = spentByCat.get(b.categoryId) ?? 0
        const catHistory = priorMonths.slice(-3).map((m) =>
          allTxns
            .filter((t) => t.categoryId === b.categoryId && t.type === 'expense' && monthKey(t.date) === m)
            .reduce((s, t) => s + t.amount, 0)
        )
        const catHist = trimLeadingZeros(catHistory)
        const projected = projectMonthEnd(spent, elapsed, totalDays, catHist.length ? mean(catHist) : null)
        const pct = b.amount > 0 ? spent / b.amount : 0
        const status = spent > b.amount ? 'over' : projected > b.amount || pct >= 0.8 ? 'warning' : 'ok'
        return {
          id: b.id,
          categoryId: b.categoryId,
          name: b.category.name,
          icon: b.category.icon,
          color: b.category.color,
          amount: b.amount,
          spent,
          remaining: b.amount - spent,
          projected,
          pct,
          status,
        }
      })
      .sort((a, b) => b.pct - a.pct)
    const totalBudget = budgets.reduce((s, b) => s + b.amount, 0)
    const budgetedSpent = budgetRows.reduce((s, b) => s + b.spent, 0)
    const daysLeft = totalDays - elapsed

    const projectedExpense = projectMonthEnd(expense, elapsed, totalDays, historicalAvg)
    const changePercent = prevExpense > 0 ? ((expense - prevExpense) / prevExpense) * 100 : 0
    const savingsRate = income > 0 ? (income - expense) / income : null
    const isCurrent = month === currentMonth()
    // Compare like with like: a partial current month is compared via its projection
    const comparableChange =
      prevExpense > 0 ? (((isCurrent ? projectedExpense : expense) - prevExpense) / prevExpense) * 100 : null

    const health = healthScore({
      savingsRate,
      budgetAdherence: budgetRows.length
        ? budgetRows.filter((b) => (isCurrent ? b.projected : b.spent) <= b.amount).length / budgetRows.length
        : null,
      expenseChangePercent: comparableChange,
    })

    const insights = generateInsights({
      formatAmount: fmt,
      expense,
      income,
      prevExpense,
      byCategory,
      weekendShare,
      budgets: budgetRows,
      isCurrentMonth: isCurrent,
    })

    return {
      month,
      currency,
      // `total` kept for backwards compatibility: it is the month's expense total
      total: expense,
      expense,
      income,
      net: income - expense,
      prevMonthTotal: prevExpense,
      prevIncome,
      changePercent: Math.round(changePercent * 10) / 10,
      savingsRate,
      historicalAvg,
      projectedExpense,
      daysInMonth: totalDays,
      elapsedDays: elapsed,
      byCategory,
      incomeByCategory,
      daily,
      last7Days,
      weekendShare,
      budget: {
        total: totalBudget,
        spent: budgetedSpent,
        remaining: totalBudget - budgetedSpent,
        safePerDay: isCurrent ? safeToSpendPerDay(totalBudget, budgetedSpent, daysLeft + 1) : 0,
        items: budgetRows,
      },
      health,
      insights,
      transactionCount: thisMonth.length,
    }
  },

  async getTrend(userId: string, months = 6, endMonth: string = currentMonth()) {
    const keys = monthSeries(endMonth, months)
    const start = monthRange(keys[0]).start
    const end = monthRange(endMonth).end

    const txns = await prisma.transaction.findMany({
      where: { userId, date: { gte: start, lt: end } },
      select: { amount: true, type: true, date: true },
    })

    const rows = new Map(keys.map((k) => [k, { month: k, expense: 0, income: 0 }]))
    const weekday = WEEKDAYS.map((day) => ({ day, total: 0, count: 0 }))
    for (const t of txns) {
      const row = rows.get(monthKey(t.date))
      if (!row) continue
      if (t.type === 'income') row.income += t.amount
      else {
        row.expense += t.amount
        const w = weekday[t.date.getUTCDay()]
        w.total += t.amount
        w.count += 1
      }
    }

    // Number of each weekday in the range, so averages are per occurrence of that day
    const dayCounts = Array(7).fill(0)
    for (let d = new Date(start); d < end && d <= new Date(); d = new Date(d.getTime() + 86_400_000)) {
      dayCounts[d.getUTCDay()]++
    }

    const trend = [...rows.values()].map((r) => ({
      ...r,
      total: r.expense,
      net: r.income - r.expense,
      savingsRate: r.income > 0 ? (r.income - r.expense) / r.income : null,
    }))

    // Monday-first for display
    const ordered = [...weekday.slice(1), weekday[0]].map((w) => ({
      ...w,
      average: (() => {
        const idx = WEEKDAYS.indexOf(w.day)
        return dayCounts[idx] > 0 ? w.total / dayCounts[idx] : 0
      })(),
    }))

    return { trend, weekday: ordered }
  },

  /** Forecast next month's spending from complete months + the current month's projection. */
  async getForecast(userId: string) {
    const cur = currentMonth()
    const [dashboard, { trend }] = await Promise.all([
      this.getDashboard(userId, cur),
      this.getTrend(userId, 6, addMonths(cur, -1)),
    ])
    const series = [...trend.map((t) => t.expense), dashboard.projectedExpense]
    const forecast = forecastNext(series)
    return {
      ...forecast,
      month: addMonths(cur, 1),
      currentProjected: dashboard.projectedExpense,
      basis: [...trend.map((t) => ({ month: t.month, total: t.expense })), { month: cur, total: dashboard.projectedExpense }],
      currency: dashboard.currency,
    }
  },

  /** Deterministic budget suggestions for `month` from the 6 complete months before it. */
  async getBudgetSuggestions(userId: string, month: string) {
    const lastComplete = addMonths(month, -1)
    const keys = monthSeries(lastComplete, 6)
    const [txns, categories, currency] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          userId,
          type: 'expense',
          date: { gte: monthRange(keys[0]).start, lt: monthRange(month).end },
        },
        select: { amount: true, date: true, categoryId: true },
      }),
      prisma.category.findMany({ where: { userId, type: 'expense' } }),
      getCurrency(userId),
    ])
    // When planning the running month, its own spending (projected to month end) counts as the
    // newest data point once a week has passed — so brand-new users still get suggestions.
    const elapsed = elapsedDays(month)
    const includeCurrent = month === currentMonth() && elapsed >= 7
    const history: CategoryHistory[] = categories.map((c) => {
      const spentIn = (k: string) =>
        txns.filter((t) => t.categoryId === c.id && monthKey(t.date) === k).reduce((s, t) => s + t.amount, 0)
      const monthly = keys.map(spentIn)
      if (includeCurrent) monthly.push(projectMonthEnd(spentIn(month), elapsed, daysInMonth(month), null))
      return { categoryId: c.id, name: c.name, monthly }
    })
    const fmt = (n: number) => formatMoney(n, currency)
    return { suggestions: suggestBudgets(history, fmt), currency, history }
  },
}
