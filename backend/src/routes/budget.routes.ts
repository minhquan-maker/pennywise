import { Router } from 'express'
import { budgetService } from '../services/budget.service.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { prisma } from '../lib/prisma.js'
import { addMonths, isValidMonth } from '../lib/dates.js'

export const budgetRouter = Router()

budgetRouter.use(authMiddleware)

function parseAmount(value: unknown): number | null {
  const n = typeof value === 'number' ? value : parseFloat(String(value))
  if (!Number.isFinite(n) || n <= 0 || n > 1e12) return null
  return Math.round(n * 100) / 100
}

// Optional ?month=YYYY-MM limits the wipe to one month
budgetRouter.delete('/clear', async (req, res, next) => {
  try {
    const { month } = req.query
    if (month !== undefined && !isValidMonth(month)) {
      res.status(400).json({ error: 'month must be in YYYY-MM format' })
      return
    }
    const { count } = await prisma.budget.deleteMany({
      where: { userId: req.userId!, ...(month ? { month: month as string } : {}) },
    })
    res.json({ message: `Deleted ${count} budget(s)`, count })
  } catch (err) {
    next(err)
  }
})

budgetRouter.get('/', async (req, res, next) => {
  try {
    const { month } = req.query
    if (month !== undefined && !isValidMonth(month)) {
      res.status(400).json({ error: 'month must be in YYYY-MM format' })
      return
    }
    const budgets = await budgetService.getAll(req.userId!, month as string | undefined)
    res.json({ budgets })
  } catch (err) {
    next(err)
  }
})

budgetRouter.put('/', async (req, res, next) => {
  try {
    const { categoryId, amount, month } = req.body
    if (!categoryId || amount === undefined || !month) {
      res.status(400).json({ error: 'categoryId, amount, and month are required' })
      return
    }
    if (!isValidMonth(month)) {
      res.status(400).json({ error: 'month must be in YYYY-MM format' })
      return
    }
    const parsedAmount = parseAmount(amount)
    if (parsedAmount === null) {
      res.status(400).json({ error: 'amount must be a positive number' })
      return
    }
    const category = await prisma.category.findFirst({ where: { id: categoryId, userId: req.userId! } })
    if (!category) {
      res.status(400).json({ error: 'Invalid category' })
      return
    }
    if (category.type !== 'expense') {
      res.status(400).json({ error: 'Budgets can only be set on expense categories' })
      return
    }

    const budget = await budgetService.upsert(req.userId!, { categoryId, amount: parsedAmount, month })
    res.json({ budget })
  } catch (err) {
    next(err)
  }
})

/** Apply several budgets at once: { month, items: [{ categoryId, amount }] } */
budgetRouter.post('/bulk', async (req, res, next) => {
  try {
    const { month, items } = req.body
    if (!isValidMonth(month) || !Array.isArray(items) || items.length === 0 || items.length > 100) {
      res.status(400).json({ error: 'month (YYYY-MM) and a non-empty items array are required' })
      return
    }
    const categories = await prisma.category.findMany({
      where: { userId: req.userId!, type: 'expense' },
      select: { id: true },
    })
    const valid = new Set(categories.map((c) => c.id))
    const parsed = items.map((i: { categoryId?: string; amount?: unknown }) => ({
      categoryId: String(i?.categoryId ?? ''),
      amount: parseAmount(i?.amount),
    }))
    if (parsed.some((i) => !valid.has(i.categoryId) || i.amount === null)) {
      res.status(400).json({ error: 'Every item needs a valid expense categoryId and positive amount' })
      return
    }
    const budgets = await prisma.$transaction(
      parsed.map((i) =>
        prisma.budget.upsert({
          where: { userId_categoryId_month: { userId: req.userId!, categoryId: i.categoryId, month } },
          update: { amount: i.amount! },
          create: { userId: req.userId!, categoryId: i.categoryId, month, amount: i.amount! },
          include: { category: true },
        })
      )
    )
    res.json({ budgets })
  } catch (err) {
    next(err)
  }
})

/** Copy last month's budgets into `month` (existing budgets in `month` are kept). */
budgetRouter.post('/copy', async (req, res, next) => {
  try {
    const { month } = req.body
    if (!isValidMonth(month)) {
      res.status(400).json({ error: 'month must be in YYYY-MM format' })
      return
    }
    const from = isValidMonth(req.body.from) ? req.body.from : addMonths(month, -1)
    const [source, existing] = await Promise.all([
      prisma.budget.findMany({ where: { userId: req.userId!, month: from } }),
      prisma.budget.findMany({ where: { userId: req.userId!, month }, select: { categoryId: true } }),
    ])
    const taken = new Set(existing.map((b) => b.categoryId))
    const toCreate = source.filter((b) => !taken.has(b.categoryId))
    if (toCreate.length) {
      await prisma.budget.createMany({
        data: toCreate.map((b) => ({ userId: req.userId!, categoryId: b.categoryId, amount: b.amount, month })),
      })
    }
    res.json({ copied: toCreate.length, from })
  } catch (err) {
    next(err)
  }
})

budgetRouter.delete('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.budget.findFirst({ where: { id: req.params.id, userId: req.userId! } })
    if (!existing) {
      res.status(404).json({ error: 'Budget not found' })
      return
    }
    await budgetService.delete(req.params.id, req.userId!)
    res.json({ message: 'Budget deleted' })
  } catch (err) {
    next(err)
  }
})
