import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  forecastNext,
  generateInsights,
  healthScore,
  linearRegression,
  median,
  niceRound,
  projectMonthEnd,
  safeToSpendPerDay,
  suggestBudgets,
  weightedMovingAverage,
} from './finance.engine.js'
import { addMonths, daysInMonth, elapsedDays, monthRange, monthSeries, toUtcDay } from '../lib/dates.js'

const fmt = (n: number) => `$${n.toFixed(2)}`

test('linearRegression fits a perfect line', () => {
  const { slope, intercept } = linearRegression([10, 20, 30, 40])
  assert.equal(slope, 10)
  assert.equal(intercept, 10)
})

test('median and WMA', () => {
  assert.equal(median([3, 1, 2]), 2)
  assert.equal(median([4, 1, 2, 3]), 2.5)
  // (1*1 + 2*2 + 3*3) / 6
  assert.equal(weightedMovingAverage([1, 2, 3]), 14 / 6)
})

test('forecastNext handles empty, single and trending series', () => {
  assert.equal(forecastNext([]).method, 'none')
  assert.equal(forecastNext([0, 0, 0]).predicted, 0)

  const single = forecastNext([0, 0, 200])
  assert.equal(single.method, 'single-point')
  assert.equal(single.predicted, 200)

  const rising = forecastNext([100, 200, 300, 400])
  // regression -> 500, WMA -> 300; blend = 400
  assert.equal(rising.predicted, 400)
  assert.ok(rising.trendPercent > 0)
  assert.ok(rising.low <= rising.predicted && rising.predicted <= rising.high)
})

test('forecastNext never predicts negative spending', () => {
  const f = forecastNext([1000, 600, 200, 10])
  assert.ok(f.predicted >= 0)
  assert.ok(f.low >= 0)
})

test('projectMonthEnd blends run-rate with history and respects bounds', () => {
  assert.equal(projectMonthEnd(300, 30, 30, 500), 300) // finished month
  assert.equal(projectMonthEnd(0, 0, 30, 500), 500) // not started
  assert.equal(projectMonthEnd(100, 10, 30, null), 300) // pure run-rate
  // progress 1/3 -> weight 1/9: 1/9*300 + 8/9*600 = 566.67
  assert.equal(projectMonthEnd(100, 10, 30, 600), 566.67)
  // a lumpy early payment (rent) does not explode the projection
  assert.ok(projectMonthEnd(950, 2, 30, 1050) < 1100)
  // never below what is already spent
  assert.ok(projectMonthEnd(900, 10, 30, 100) >= 900)
})

test('safeToSpendPerDay', () => {
  assert.equal(safeToSpendPerDay(300, 100, 10), 20)
  assert.equal(safeToSpendPerDay(300, 400, 10), 0)
  assert.equal(safeToSpendPerDay(300, 100, 0), 0)
})

test('niceRound rounds up to readable numbers', () => {
  assert.equal(niceRound(137), 140)
  assert.equal(niceRound(42.3), 43)
  assert.equal(niceRound(4_180_000), 4_200_000)
  assert.equal(niceRound(0), 0)
})

test('suggestBudgets nudges stable categories down and caps rising ones', () => {
  const [food, transport] = suggestBudgets(
    [
      { categoryId: 'f', name: 'Food', monthly: [400, 400, 400] },
      { categoryId: 't', name: 'Transport', monthly: [50, 100, 150] },
      { categoryId: 'x', name: 'Unused', monthly: [0, 0, 0] },
    ],
    fmt
  )
  assert.equal(food.category, 'Food')
  assert.equal(food.suggestedBudget, 380) // 400 * 0.95
  assert.equal(transport.category, 'Transport')
  // rising: base = 0.6*WMA(116.67) + 0.4*median(100) = 110 -> nice 110
  assert.equal(transport.suggestedBudget, 110)
  assert.match(transport.reason, /rising/)
})

test('generateInsights prioritises budget overruns and returns at most 3', () => {
  const insights = generateInsights({
    formatAmount: fmt,
    expense: 1000,
    income: 900,
    prevExpense: 600,
    byCategory: [
      { name: 'Food', total: 600, prevTotal: 300 },
      { name: 'Bills', total: 400, prevTotal: 300 },
    ],
    weekendShare: 0.6,
    budgets: [{ name: 'Food', amount: 400, spent: 600, projected: 600 }],
    isCurrentMonth: true,
  })
  assert.equal(insights.length, 3)
  assert.equal(insights[0].title, 'Food is over budget')
  assert.equal(insights[1].title, 'Spending exceeds income')
})

test('generateInsights handles an empty month', () => {
  const [only] = generateInsights({
    formatAmount: fmt,
    expense: 0,
    income: 0,
    prevExpense: 0,
    byCategory: [],
    weekendShare: null,
    budgets: [],
    isCurrentMonth: true,
  })
  assert.equal(only.severity, 'info')
})

test('healthScore weights components', () => {
  assert.equal(healthScore({ savingsRate: 0.3, budgetAdherence: 1, expenseChangePercent: -10 }).score, 100)
  assert.equal(healthScore({ savingsRate: -0.2, budgetAdherence: 0, expenseChangePercent: 30 }).score, 0)
  assert.equal(healthScore({ savingsRate: null, budgetAdherence: null, expenseChangePercent: null }).label, 'Fair')
})

test('UTC date helpers', () => {
  assert.equal(addMonths('2026-01', -1), '2025-12')
  assert.equal(addMonths('2026-12', 1), '2027-01')
  assert.equal(daysInMonth('2028-02'), 29)
  assert.deepEqual(monthSeries('2026-02', 3), ['2025-12', '2026-01', '2026-02'])
  assert.equal(monthRange('2026-03').start.toISOString(), '2026-03-01T00:00:00.000Z')
  assert.equal(toUtcDay('2026-10-06')!.toISOString(), '2026-10-06T00:00:00.000Z')
  const now = new Date('2026-10-06T12:00:00Z')
  assert.equal(elapsedDays('2026-10', now), 6)
  assert.equal(elapsedDays('2026-09', now), 30)
  assert.equal(elapsedDays('2026-11', now), 0)
})

test('generateInsights does not flag a budget that is behind pace', () => {
  const insights = generateInsights({
    formatAmount: fmt,
    expense: 50,
    income: 0,
    prevExpense: 0,
    byCategory: [{ name: 'Shopping', total: 50, prevTotal: 0 }],
    weekendShare: null,
    budgets: [{ name: 'Shopping', amount: 200, spent: 0, projected: 290, atRisk: false }],
    isCurrentMonth: true,
  })
  assert.ok(!insights.some((i) => i.title.includes('on pace')))
})
