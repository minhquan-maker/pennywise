// Pure finance algorithms — no I/O, fully unit-tested (finance.engine.test.ts).
// They power dashboard numbers and act as the deterministic fallback for every AI feature.

export type Severity = 'positive' | 'warning' | 'info'

export interface Insight {
  title: string
  body: string
  category: string
  severity: Severity
}

const round2 = (n: number) => Math.round(n * 100) / 100

export function mean(xs: number[]): number {
  return xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0
}

export function median(xs: number[]): number {
  if (!xs.length) return 0
  const s = [...xs].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2
}

/** Ordinary least squares over x = 0..n-1. */
export function linearRegression(ys: number[]): { slope: number; intercept: number } {
  const n = ys.length
  if (n === 0) return { slope: 0, intercept: 0 }
  if (n === 1) return { slope: 0, intercept: ys[0] }
  const xMean = (n - 1) / 2
  const yMean = mean(ys)
  let num = 0
  let den = 0
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (ys[i] - yMean)
    den += (i - xMean) ** 2
  }
  const slope = den === 0 ? 0 : num / den
  return { slope, intercept: yMean - slope * xMean }
}

/** Linearly weighted moving average — the newest value weighs n, the oldest 1. */
export function weightedMovingAverage(ys: number[]): number {
  if (!ys.length) return 0
  let num = 0
  let den = 0
  ys.forEach((y, i) => {
    num += y * (i + 1)
    den += i + 1
  })
  return num / den
}

/** Drop the zero months before the user's first activity so they don't drag averages down. */
export function trimLeadingZeros(ys: number[]): number[] {
  const first = ys.findIndex((y) => y > 0)
  return first === -1 ? [] : ys.slice(first)
}

export interface Forecast {
  predicted: number
  low: number
  high: number
  /** Monthly trend as a % of the average month (regression slope / mean). */
  trendPercent: number
  /** Predicted vs. the average of the basis months. */
  changePercent: number
  monthsUsed: number
  method: 'none' | 'single-point' | 'wma' | 'regression+wma'
}

/**
 * Forecast the next value of a monthly series.
 * Blends a least-squares trend extrapolation with a weighted moving average (WMA reacts to
 * recent behaviour, regression captures direction); an ~80% band comes from the residual
 * standard deviation of the regression fit.
 */
export function forecastNext(series: number[]): Forecast {
  const ys = trimLeadingZeros(series)
  const n = ys.length
  if (n === 0) {
    return { predicted: 0, low: 0, high: 0, trendPercent: 0, changePercent: 0, monthsUsed: 0, method: 'none' }
  }
  if (n === 1) {
    const v = ys[0]
    return {
      predicted: round2(v),
      low: round2(v * 0.75),
      high: round2(v * 1.25),
      trendPercent: 0,
      changePercent: 0,
      monthsUsed: 1,
      method: 'single-point',
    }
  }

  const { slope, intercept } = linearRegression(ys)
  const wma = weightedMovingAverage(ys)
  const regressionNext = intercept + slope * n
  const predicted = Math.max(0, n >= 3 ? 0.5 * regressionNext + 0.5 * wma : wma)

  const residuals = ys.map((y, i) => y - (intercept + slope * i))
  const dof = Math.max(n - 2, 1)
  const std = Math.sqrt(residuals.reduce((s, r) => s + r * r, 0) / dof)
  // Never claim more certainty than ±10% of the prediction.
  const spread = Math.max(1.28 * std, predicted * 0.1)

  const avg = mean(ys)
  return {
    predicted: round2(predicted),
    low: round2(Math.max(0, predicted - spread)),
    high: round2(predicted + spread),
    trendPercent: avg > 0 ? round2((slope / avg) * 100) : 0,
    changePercent: avg > 0 ? round2(((predicted - avg) / avg) * 100) : 0,
    monthsUsed: n,
    method: n >= 3 ? 'regression+wma' : 'wma',
  }
}

/**
 * Project month-end spending. Early in the month the daily run-rate is noisy (rent paid on day 2
 * would extrapolate to 15× rent), so it is blended with the historical monthly average using
 * weight progress², which trusts history early and the run-rate late in the month.
 * The projection never drops below what has already been spent.
 */
export function projectMonthEnd(
  spent: number,
  elapsedDays: number,
  totalDays: number,
  historicalAvg: number | null
): number {
  if (elapsedDays >= totalDays) return round2(spent)
  if (elapsedDays <= 0) return round2(Math.max(spent, historicalAvg ?? 0))
  const runRate = (spent / elapsedDays) * totalDays
  if (historicalAvg === null || historicalAvg <= 0) return round2(runRate)
  const typical = Math.max(historicalAvg, spent)
  const w = (elapsedDays / totalDays) ** 2
  // Cap extrapolation at 2× the typical month so one large early payment can't dominate
  const blended = w * Math.min(runRate, 2 * typical) + (1 - w) * typical
  return round2(Math.max(spent, blended))
}

export function safeToSpendPerDay(budget: number, spent: number, daysLeft: number): number {
  if (daysLeft <= 0 || budget <= 0) return 0
  return round2(Math.max(0, (budget - spent) / daysLeft))
}

/** Round up to a "nice" number: two significant steps of 1/20th of the magnitude (137 -> 140, 4_180_000 -> 4_200_000). */
export function niceRound(value: number): number {
  if (value <= 0) return 0
  const magnitude = 10 ** Math.floor(Math.log10(value))
  const step = Math.max(1, magnitude / 20)
  return Math.ceil(value / step - 1e-9) * step
}

export interface CategoryHistory {
  categoryId: string
  name: string
  /** Monthly spend, oldest -> newest (complete months only). */
  monthly: number[]
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

/**
 * Suggest a monthly budget per category from its history.
 * base = 0.6·WMA + 0.4·median (median resists one-off spikes, WMA tracks recent habits).
 * Rising categories are capped at the base; stable/falling ones get a 5% savings nudge.
 */
export function suggestBudgets(
  history: CategoryHistory[],
  formatAmount: (n: number) => string
): BudgetSuggestion[] {
  const out: BudgetSuggestion[] = []
  for (const h of history) {
    const ys = trimLeadingZeros(h.monthly.slice(-6))
    if (!ys.length) continue

    const wma = weightedMovingAverage(ys)
    const med = median(ys)
    const base = 0.6 * wma + 0.4 * med
    const avg = mean(ys)
    const { slope } = linearRegression(ys)
    const trendPercent = avg > 0 ? (slope / avg) * 100 : 0
    const rising = ys.length >= 3 && trendPercent > 5

    const target = rising ? base : base * 0.95
    const suggested = niceRound(target)
    if (suggested <= 0) continue

    const months = ys.length === 1 ? '1 month' : `${ys.length} months`
    const reason = rising
      ? `Averaging ${formatAmount(avg)} over ${months} and rising ~${Math.round(trendPercent)}%/month — this caps it at your typical level.`
      : `Averaging ${formatAmount(avg)} over ${months}. Set ~5% below your usual to build savings.`

    out.push({
      categoryId: h.categoryId,
      category: h.name,
      suggestedBudget: suggested,
      average: round2(avg),
      last: round2(ys[ys.length - 1]),
      trendPercent: round2(trendPercent),
      reason,
    })
  }
  return out.sort((a, b) => b.suggestedBudget - a.suggestedBudget)
}

export interface InsightInput {
  formatAmount: (n: number) => string
  expense: number
  income: number
  prevExpense: number
  byCategory: { name: string; total: number; prevTotal: number }[]
  /** Fraction of expense spent on Saturdays/Sundays (0..1), null if no spending. */
  weekendShare: number | null
  /** `atRisk` (optional) gates the "on pace to overshoot" insight on evidence from this month. */
  budgets: { name: string; amount: number; spent: number; projected: number; atRisk?: boolean }[]
  isCurrentMonth: boolean
}

/** Rule-based insights, most important first. Always returns 1–3 items. */
export function generateInsights(input: InsightInput): Insight[] {
  const { formatAmount: fmt, expense, income, prevExpense, byCategory, weekendShare, budgets } = input
  const scored: { score: number; insight: Insight }[] = []

  if (expense === 0 && income === 0) {
    return [
      {
        title: 'Start logging',
        body: 'Add a few transactions and PennyWise will start spotting patterns for you.',
        category: 'Overall',
        severity: 'info',
      },
    ]
  }

  for (const b of budgets) {
    if (b.spent > b.amount) {
      scored.push({
        score: 100 + (b.spent / b.amount) * 10,
        insight: {
          title: `${b.name} is over budget`,
          body: `You've spent ${fmt(b.spent)} of ${fmt(b.amount)} — ${fmt(b.spent - b.amount)} over. Pause non-essentials here for the rest of the month.`,
          category: b.name,
          severity: 'warning',
        },
      })
    } else if (input.isCurrentMonth && b.atRisk !== false && b.projected > b.amount * 1.05) {
      scored.push({
        score: 80 + (b.projected / b.amount) * 10,
        insight: {
          title: `${b.name} is on pace to overshoot`,
          body: `At this pace you'll reach ~${fmt(b.projected)} against a ${fmt(b.amount)} budget. Slowing down now keeps you on track.`,
          category: b.name,
          severity: 'warning',
        },
      })
    }
  }

  if (income > 0) {
    const rate = (income - expense) / income
    if (rate < 0) {
      scored.push({
        score: 95,
        insight: {
          title: 'Spending exceeds income',
          body: `You've spent ${fmt(expense - income)} more than you earned this month. Review the largest categories first.`,
          category: 'Overall',
          severity: 'warning',
        },
      })
    } else if (rate >= 0.2) {
      scored.push({
        score: 40,
        insight: {
          title: `Saving ${Math.round(rate * 100)}% of income`,
          body: `You kept ${fmt(income - expense)} this month — above the 20% rule of thumb. Consider moving it to savings now.`,
          category: 'Overall',
          severity: 'positive',
        },
      })
    } else {
      scored.push({
        score: 55,
        insight: {
          title: `Savings rate at ${Math.round(rate * 100)}%`,
          body: `Aim for 20%: that means keeping about ${fmt(income * 0.2 - (income - expense))} more this month.`,
          category: 'Overall',
          severity: 'info',
        },
      })
    }
  }

  const increases = byCategory
    .map((c) => ({ ...c, delta: c.total - c.prevTotal }))
    .filter((c) => c.prevTotal > 0 && c.delta / c.prevTotal > 0.2 && c.total > expense * 0.05)
    .sort((a, b) => b.delta - a.delta)
  if (increases[0]) {
    const c = increases[0]
    scored.push({
      score: 70,
      insight: {
        title: `${c.name} up ${Math.round((c.delta / c.prevTotal) * 100)}%`,
        body: `${c.name} rose from ${fmt(c.prevTotal)} to ${fmt(c.total)} vs last month. Check for new subscriptions or one-off purchases.`,
        category: c.name,
        severity: 'warning',
      },
    })
  }

  const top = [...byCategory].sort((a, b) => b.total - a.total)[0]
  if (top && expense > 0 && top.total / expense > 0.4) {
    scored.push({
      score: 60,
      insight: {
        title: `${top.name} dominates spending`,
        body: `${top.name} is ${Math.round((top.total / expense) * 100)}% of everything you spent. Trimming it by 10% frees up ${fmt(top.total * 0.1)}.`,
        category: top.name,
        severity: 'info',
      },
    })
  }

  if (weekendShare !== null && weekendShare > 0.45 && expense > 0) {
    scored.push({
      score: 50,
      insight: {
        title: 'Weekends cost you most',
        body: `${Math.round(weekendShare * 100)}% of spending lands on Sat–Sun (2 of 7 days). Planning weekend activities ahead can cut that.`,
        category: 'Overall',
        severity: 'info',
      },
    })
  }

  if (prevExpense > 0 && expense < prevExpense * 0.9 && !input.isCurrentMonth) {
    scored.push({
      score: 45,
      insight: {
        title: 'Spending is down',
        body: `You spent ${fmt(prevExpense - expense)} less than the month before (${Math.round((1 - expense / prevExpense) * 100)}% lower). Nice work.`,
        category: 'Overall',
        severity: 'positive',
      },
    })
  }

  if (!scored.length) {
    scored.push({
      score: 1,
      insight: {
        title: 'Steady month',
        body: `You've spent ${fmt(expense)} so far with no unusual spikes. Setting category budgets unlocks pace alerts.`,
        category: 'Overall',
        severity: 'positive',
      },
    })
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((s) => s.insight)
}

export interface HealthInput {
  /** (income - expense) / income, null when there is no income recorded. */
  savingsRate: number | null
  /** Share of budgets not exceeded (0..1), null when no budgets. */
  budgetAdherence: number | null
  /** Expense change vs previous month in percent, null when no previous data. */
  expenseChangePercent: number | null
}

export interface HealthScore {
  score: number
  label: 'Excellent' | 'Good' | 'Fair' | 'Needs attention'
  parts: { savings: number; budgets: number; trend: number }
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))

/** 0–100 score: savings rate (40) + budget adherence (35) + spending trend (25). Unknowns score neutral. */
export function healthScore(input: HealthInput): HealthScore {
  const savings =
    input.savingsRate === null ? 20 : 40 * clamp01((input.savingsRate + 0.2) / 0.5) // -20% -> 0, 30% -> 40
  const budgets = input.budgetAdherence === null ? 20 : 35 * clamp01(input.budgetAdherence)
  const trend =
    input.expenseChangePercent === null
      ? 15
      : 25 * clamp01((30 - input.expenseChangePercent) / 40) // -10% -> 25, +30% -> 0
  const score = Math.round(savings + budgets + trend)
  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs attention'
  return {
    score,
    label,
    parts: { savings: Math.round(savings), budgets: Math.round(budgets), trend: Math.round(trend) },
  }
}

export function formatMoney(n: number, currency: string): string {
  if (currency === 'VND') return `${Math.round(n).toLocaleString('en-US')} VND`
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
