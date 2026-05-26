import { Router } from 'express'
import { callGroq } from '../services/ai.service.js'
import { analyticsService } from '../services/analytics.service.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { prisma } from '../lib/prisma.js'

const MONTH_REGEX = /^\d{4}-\d{2}$/

function validateMonth(month: string | undefined, sendError: (code: number, msg: string) => void): boolean {
  if (month && !MONTH_REGEX.test(month)) {
    sendError(400, 'month must be in YYYY-MM format')
    return false
  }
  return true
}

export const aiRouter = Router()
aiRouter.use(authMiddleware)

aiRouter.post('/summary', async (req, res, next) => {
  try {
    const { month } = req.body
    if (!validateMonth(month, (code, msg) => res.status(code).json({ error: msg }))) return

    const user = await prisma.user.findUnique({ where: { id: req.userId! } })
    const currency = user?.currency || 'USD'

    const dashboard = await analyticsService.getDashboard(req.userId!, month)

    const currencyStr = currency === 'VND' ? 'VND' : '$'
    const formatAmount = (n: number) =>
      currency === 'VND' ? `${n.toLocaleString()} ${currencyStr}` : `${currencyStr}${n.toFixed(2)}`

    const topCategories = dashboard.byCategory
      .slice(0, 3)
      .map((c) => `${c.name} (${formatAmount(c.total)})`)
      .join(', ')

    const comparison =
      dashboard.changePercent > 0
        ? `up ${Math.abs(dashboard.changePercent)}% vs last month`
        : `down ${Math.abs(dashboard.changePercent)}% vs last month`

    const prompt = `You are a friendly financial advisor. Based on spending data for ${dashboard.month}:
- Total spent: ${formatAmount(dashboard.total)}
- Top 3 categories: ${topCategories || 'No transactions'}
- Change: ${comparison}

Write a concise 2-3 sentence summary in English, highlighting key patterns and one specific actionable recommendation. Keep it natural and encouraging, not preachy.`

    const text = await callGroq([{ role: 'user', content: prompt }])
    res.json({ summary: text })
  } catch (err) {
    next(err)
  }
})

aiRouter.post('/suggest-budget', async (req, res, next) => {
  try {
    const { month } = req.body
    if (!validateMonth(month, (code, msg) => res.status(code).json({ error: msg }))) return

    const user = await prisma.user.findUnique({ where: { id: req.userId! } })
    const currency = user?.currency || 'USD'
    const dashboard = await analyticsService.getDashboard(req.userId!, month)

    const currencyStr = currency === 'VND' ? 'VND' : '$'
    const formatAmount = (n: number) =>
      currency === 'VND' ? `${n.toLocaleString()} ${currencyStr}` : `${currencyStr}${n.toFixed(2)}`

    const history = dashboard.byCategory
      .map((c) => `${c.name}: ${formatAmount(c.total)}`)
      .join('\n')

    const prompt = `Based on this user's spending history for ${dashboard.month}:
${history || 'No transaction history available'}

Suggest a monthly budget for each category for next month. Return ONLY a JSON array (no markdown, no explanation), with this exact format:
[{"category": "Food", "suggestedBudget": 150, "reason": "Your spending was..."}]

Use ${currencyStr} as currency. Keep budgets realistic based on history.`

    let text = await callGroq([{ role: 'user', content: prompt }])
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    let suggestions
    try {
      suggestions = JSON.parse(text)
    } catch {
      res.status(500).json({ error: 'AI returned an invalid response. Please try again.' })
      return
    }

    if (
      !Array.isArray(suggestions) ||
      !suggestions.every(
        (s) => s.category && typeof s.suggestedBudget === 'number'
      )
    ) {
      res.status(500).json({ error: 'AI response did not match expected format. Please try again.' })
      return
    }

    res.json({ suggestions })
  } catch (err) {
    next(err)
  }
})

aiRouter.post('/insight', async (req, res, next) => {
  try {
    const { month } = req.body
    if (!validateMonth(month, (code, msg) => res.status(code).json({ error: msg }))) return

    const user = await prisma.user.findUnique({ where: { id: req.userId! } })
    const currency = user?.currency || 'USD'
    const dashboard = await analyticsService.getDashboard(req.userId!, month)

    const currencyStr = currency === 'VND' ? 'VND' : '$'
    const formatAmount = (n: number) =>
      currency === 'VND' ? `${n.toLocaleString()} ${currencyStr}` : `${currencyStr}${n.toFixed(2)}`

    const breakdown = dashboard.byCategory
      .map(
        (c) =>
          `${c.name}: ${formatAmount(c.total)} (${dashboard.total > 0 ? Math.round((c.total / dashboard.total) * 100) : 0}%)`
      )
      .join('\n')

    const prompt = `Analyze this month's spending:
- Total: ${formatAmount(dashboard.total)}
- Categories:\n${breakdown || 'No transactions'}

Give exactly 3 short, actionable insights in English to help reduce spending. Format as a JSON array:
[{"insight": "...", "category": "Food"}, {"insight": "...", "category": "Transport"}, {"insight": "...", "category": "Overall"}]`

    let text = await callGroq([{ role: 'user', content: prompt }])
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    let insights
    try {
      insights = JSON.parse(text)
    } catch {
      res.status(500).json({ error: 'AI returned an invalid response. Please try again.' })
      return
    }

    if (!Array.isArray(insights) || insights.length !== 3) {
      res.status(500).json({ error: 'AI response did not match expected format. Please try again.' })
      return
    }

    res.json({ insights })
  } catch (err) {
    next(err)
  }
})

aiRouter.post('/predict', async (req, res, next) => {
  try {
    const trend = await analyticsService.getTrend(req.userId!, 6)

    if (trend.length < 2) {
      res.json({
        predicted: 0,
        changePercent: 0,
        reason: 'Not enough data for prediction. Add more transactions over time.',
      })
      return
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId! } })
    const currency = user?.currency || 'USD'
    const currencyStr = currency === 'VND' ? 'VND' : '$'
    const formatAmount = (n: number) =>
      currency === 'VND' ? `${n.toLocaleString()} ${currencyStr}` : `${currencyStr}${n.toFixed(2)}`

    const avg = trend.reduce((s, t) => s + t.total, 0) / trend.length
    const recent = trend.slice(-2).reduce((s, t) => s + t.total, 0) / 2
    const changePercent = avg > 0 ? ((recent - avg) / avg) * 100 : 0
    const predicted = Math.round(recent * (1 + changePercent / 100))

    const prompt = `Based on 6 months of spending data: ${trend.map((t) => `${t.month}: ${formatAmount(t.total)}`).join(', ')}
Predicted next month: ${formatAmount(predicted)} (${changePercent > 0 ? '+' : ''}${changePercent.toFixed(1)}%).

Give a one-sentence reason in English explaining this prediction briefly.`

    const reason = await callGroq([{ role: 'user', content: prompt }])
    res.json({
      predicted: Math.round(predicted),
      changePercent: Math.round(changePercent * 10) / 10,
      reason,
    })
  } catch (err) {
    next(err)
  }
})
