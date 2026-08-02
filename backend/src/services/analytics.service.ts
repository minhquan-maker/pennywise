import { prisma } from '../lib/prisma.js'

export const analyticsService = {
  async getDashboard(userId: string, month?: string) {
    const now = new Date()
    const targetYear = month ? parseInt(month.split('-')[0]) : now.getFullYear()
    const targetMonth = month ? parseInt(month.split('-')[1]) - 1 : now.getMonth()

    const startOfMonth = new Date(targetYear, targetMonth, 1)
    const endOfMonth = new Date(targetYear, targetMonth + 1, 1)

    // Fix January boundary: prevMonth could be 11 (Dec) of previous year
    const prevMonth = targetMonth === 0 ? 11 : targetMonth - 1
    const prevYear = targetMonth === 0 ? targetYear - 1 : targetYear
    const startOfPrevMonth = new Date(prevYear, prevMonth, 1)
    const endOfPrevMonth = new Date(prevYear, prevMonth + 1, 1)

    // Fetch both months in one query
    const allTxns = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startOfPrevMonth,
          lt: endOfMonth,
        },
      },
      include: { category: true },
    })

    const thisMonthTxns = allTxns.filter(
      (t) => t.date >= startOfMonth && t.date < endOfMonth
    )
    const prevMonthTxns = allTxns.filter(
      (t) => t.date >= startOfPrevMonth && t.date < endOfPrevMonth
    )

    const thisMonthTotal = thisMonthTxns.reduce((sum, t) => sum + t.amount, 0)
    const prevMonthTotal = prevMonthTxns.reduce((sum, t) => sum + t.amount, 0)

    // By category
    const byCategory: Record<string, { name: string; icon: string; color: string; total: number }> = {}
    for (const txn of thisMonthTxns) {
      const cat = txn.category
      if (!byCategory[cat.id]) {
        byCategory[cat.id] = { name: cat.name, icon: cat.icon, color: cat.color, total: 0 }
      }
      byCategory[cat.id].total += txn.amount
    }

    // Last 7 days
    const last7Days: { date: string; total: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const dayTotal = thisMonthTxns
        .filter((t) => t.date.toISOString().split('T')[0] === dateStr)
        .reduce((sum, t) => sum + t.amount, 0)
      last7Days.push({ date: dateStr, total: dayTotal })
    }

    const changePercent =
      prevMonthTotal > 0 ? ((thisMonthTotal - prevMonthTotal) / prevMonthTotal) * 100 : 0

    return {
      month: month || `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}`,
      total: thisMonthTotal,
      prevMonthTotal,
      changePercent: Math.round(changePercent * 10) / 10,
      byCategory: Object.values(byCategory).sort((a, b) => b.total - a.total),
      last7Days,
    }
  },

  async getTrend(userId: string, months = 6) {
    const now = new Date()
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const start = new Date(now.getFullYear(), now.getMonth() - months + 1, 1)

    // Single query instead of N+1
    const allTxns = await prisma.transaction.findMany({
      where: { userId, date: { gte: start, lte: end } },
    })

    // Group by month in JS
    const monthlyMap: Record<string, number> = {}
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      monthlyMap[key] = 0
    }

    for (const txn of allTxns) {
      const key = `${txn.date.getFullYear()}-${String(txn.date.getMonth() + 1).padStart(2, '0')}`
      if (key in monthlyMap) {
        monthlyMap[key] += txn.amount
      }
    }

    return Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, total]) => ({ month, total }))
  },
}
