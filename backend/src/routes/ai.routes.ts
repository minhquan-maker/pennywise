import { Router, type Response } from 'express'
import { callGroq, isAiConfigured, parseJsonReply } from '../services/ai.service.js'
import { analyticsService } from '../services/analytics.service.js'
import { formatMoney, type Insight } from '../services/finance.engine.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { currentMonth, isValidMonth } from '../lib/dates.js'

// Every endpoint computes a deterministic answer with the finance engine first. When a Groq key
// is configured the LLM only rewrites/enriches that answer; any AI failure falls back to the
// engine result, so the features always work. Responses carry `source: "ai" | "engine"`.

export const aiRouter = Router()
aiRouter.use(authMiddleware)

function readMonth(body: unknown, res: Response): string | null {
  const month = (body as { month?: unknown })?.month
  if (month === undefined || month === null || month === '') return currentMonth()
  if (!isValidMonth(month)) {
    res.status(400).json({ error: 'month must be in YYYY-MM format' })
    return null
  }
  return month
}

async function tryAi<T>(fn: () => Promise<T | null>): Promise<T | null> {
  if (!isAiConfigured()) return null
  try {
    return await fn()
  } catch (err) {
    console.warn('[AI fallback]', (err as Error).message)
    return null
  }
}

aiRouter.get('/status', (_req, res) => {
  res.json({ ai: isAiConfigured(), model: isAiConfigured() ? 'llama-3.3-70b-versatile' : null })
})

aiRouter.post('/summary', async (req, res, next) => {
  try {
    const month = readMonth(req.body, res)
    if (!month) return
    const d = await analyticsService.getDashboard(req.userId!, month)
    const fmt = (n: number) => formatMoney(n, d.currency)

    const top = d.byCategory.slice(0, 3)
    const facts = [
      `Month: ${d.month}${d.month === currentMonth() ? ` (day ${d.elapsedDays} of ${d.daysInMonth})` : ''}`,
      `Spent: ${fmt(d.expense)}; income: ${fmt(d.income)}; net: ${fmt(d.net)}`,
      d.savingsRate !== null ? `Savings rate: ${Math.round(d.savingsRate * 100)}%` : 'No income recorded',
      `Top categories: ${top.map((c) => `${c.name} ${fmt(c.total)} (${Math.round(c.share * 100)}%)`).join(', ') || 'none'}`,
      d.prevMonthTotal > 0 ? `Previous month spent: ${fmt(d.prevMonthTotal)}` : 'No previous month data',
      d.month === currentMonth() ? `Projected month-end spending: ${fmt(d.projectedExpense)}` : '',
      `Health score: ${d.health.score}/100 (${d.health.label})`,
    ].filter(Boolean)

    // Engine summary
    let summary: string
    if (d.transactionCount === 0) {
      summary = `No transactions recorded for ${d.month} yet. Log a few expenses and income to get a monthly summary.`
    } else {
      const lead = top[0]
        ? `${top[0].name} leads at ${fmt(top[0].total)} (${Math.round(top[0].share * 100)}% of spending).`
        : ''
      const change =
        d.prevMonthTotal > 0
          ? ` That's ${d.changePercent >= 0 ? 'up' : 'down'} ${Math.abs(d.changePercent)}% on last month.`
          : ''
      const saving =
        d.savingsRate !== null ? ` You're keeping ${Math.round(d.savingsRate * 100)}% of your income.` : ''
      summary = `You've spent ${fmt(d.expense)} in ${d.month}.${change} ${lead}${saving} ${d.insights[0]?.body ?? ''}`
        .replace(/\s+/g, ' ')
        .trim()
    }

    const ai = await tryAi(async () =>
      d.transactionCount === 0
        ? null
        : callGroq([
            {
              role: 'system',
              content: 'You are a concise, friendly personal finance coach. Use only the numbers provided. Never invent figures.',
            },
            {
              role: 'user',
              content: `${facts.join('\n')}\n\nWrite a 2-3 sentence summary in English highlighting the key pattern and one specific, actionable recommendation. Encouraging, not preachy.`,
            },
          ])
    )
    res.json({ summary: ai ?? summary, source: ai ? 'ai' : 'engine' })
  } catch (err) {
    next(err)
  }
})

aiRouter.post('/suggest-budget', async (req, res, next) => {
  try {
    const month = readMonth(req.body, res)
    if (!month) return
    const { suggestions, currency } = await analyticsService.getBudgetSuggestions(req.userId!, month)
    if (!suggestions.length) {
      res.json({ suggestions: [], source: 'engine' })
      return
    }

    // Let the LLM rewrite the reasons only — amounts stay deterministic and auditable.
    const reasons = await tryAi(async () => {
      const text = await callGroq([
        { role: 'system', content: 'You write short, specific budgeting advice. Reply with JSON only.' },
        {
          role: 'user',
          content: `Currency ${currency}. For each budget below write a one-sentence reason (max 22 words) referencing the average and trend.\n${JSON.stringify(
            suggestions.map((s) => ({ category: s.category, budget: s.suggestedBudget, average: s.average, trendPercent: s.trendPercent }))
          )}\nReturn a JSON array: [{"category": "...", "reason": "..."}]`,
        },
      ])
      const parsed = parseJsonReply<{ category: string; reason: string }[]>(text)
      return Array.isArray(parsed) ? parsed : null
    })

    const byName = new Map((reasons ?? []).filter((r) => r?.category && r?.reason).map((r) => [r.category, r.reason]))
    res.json({
      suggestions: suggestions.map((s) => ({ ...s, reason: byName.get(s.category) ?? s.reason })),
      source: byName.size ? 'ai' : 'engine',
    })
  } catch (err) {
    next(err)
  }
})

aiRouter.post('/insight', async (req, res, next) => {
  try {
    const month = readMonth(req.body, res)
    if (!month) return
    const d = await analyticsService.getDashboard(req.userId!, month)
    const fmt = (n: number) => formatMoney(n, d.currency)
    const engine: Insight[] = d.insights

    const ai = await tryAi(async () => {
      if (d.transactionCount === 0) return null
      const breakdown = d.byCategory
        .map((c) => `${c.name}: ${fmt(c.total)} (${Math.round(c.share * 100)}%, last month ${fmt(c.prevTotal)})`)
        .join('\n')
      const text = await callGroq([
        { role: 'system', content: 'You are a personal finance analyst. Use only the given numbers. Reply with JSON only.' },
        {
          role: 'user',
          content: `Spending ${fmt(d.expense)}, income ${fmt(d.income)}.\nCategories:\n${breakdown}\nBudgets: ${d.budget.items
            .map((b) => `${b.name} ${fmt(b.spent)}/${fmt(b.amount)}`)
            .join(', ') || 'none'}\nDetected signals: ${engine.map((i) => i.title).join('; ')}\n\nGive exactly 3 short actionable insights. JSON array: [{"title": "max 6 words", "body": "1-2 sentences", "category": "Food|Overall|...", "severity": "positive|warning|info"}]`,
        },
      ])
      const parsed = parseJsonReply<Insight[]>(text)
      if (!Array.isArray(parsed) || parsed.length === 0) return null
      return parsed.slice(0, 3).map((i) => ({
        title: String(i.title ?? '').slice(0, 80),
        body: String(i.body ?? (i as unknown as { insight?: string }).insight ?? ''),
        category: String(i.category ?? 'Overall'),
        severity: (['positive', 'warning', 'info'].includes(i.severity) ? i.severity : 'info') as Insight['severity'],
      }))
    })
    res.json({ insights: ai ?? engine, source: ai ? 'ai' : 'engine' })
  } catch (err) {
    next(err)
  }
})

aiRouter.post('/predict', async (req, res, next) => {
  try {
    const f = await analyticsService.getForecast(req.userId!)
    const fmt = (n: number) => formatMoney(n, f.currency)

    let reason: string
    if (f.monthsUsed === 0) {
      reason = 'Not enough data for a prediction yet. Add transactions over a few months.'
    } else if (f.monthsUsed === 1) {
      reason = `Based on a single month of data (${fmt(f.basis[f.basis.length - 1].total)}); accuracy improves as history grows.`
    } else {
      const dir = f.trendPercent > 2 ? 'rising' : f.trendPercent < -2 ? 'falling' : 'flat'
      reason = `Your spending trend is ${dir} (${f.trendPercent > 0 ? '+' : ''}${f.trendPercent}%/month over ${f.monthsUsed} months); this month is projected at ${fmt(f.currentProjected)}.`
    }

    const ai = await tryAi(async () =>
      f.monthsUsed < 2
        ? null
        : callGroq([
            { role: 'system', content: 'You explain forecasts in one plain sentence. Use only the provided numbers.' },
            {
              role: 'user',
              content: `Monthly spending: ${f.basis.map((b) => `${b.month}: ${fmt(b.total)}`).join(', ')} (last one is a month-end projection).\nForecast for ${f.month}: ${fmt(f.predicted)} (range ${fmt(f.low)}–${fmt(f.high)}), trend ${f.trendPercent}%/month.\nExplain this prediction in one sentence.`,
            },
          ])
    )

    res.json({
      predicted: Math.round(f.predicted),
      low: Math.round(f.low),
      high: Math.round(f.high),
      changePercent: f.changePercent,
      trendPercent: f.trendPercent,
      month: f.month,
      basis: f.basis,
      method: f.method,
      reason: ai ?? reason,
      source: ai ? 'ai' : 'engine',
    })
  } catch (err) {
    next(err)
  }
})
