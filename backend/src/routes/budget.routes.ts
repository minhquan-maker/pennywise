import { Router } from 'express'
import { budgetService } from '../services/budget.service.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { prisma } from '../lib/prisma.js'

export const budgetRouter = Router()

budgetRouter.use(authMiddleware)

budgetRouter.delete('/clear', async (req, res, next) => {
  try {
    await prisma.budget.deleteMany({ where: { userId: req.userId! } })
    res.json({ message: 'All budgets deleted' })
  } catch (err) {
    next(err)
  }
})

budgetRouter.get('/', async (req, res, next) => {
  try {
    const { month } = req.query
    const budgets = await budgetService.getAll(req.userId!, month as string)
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

    if (!/^\d{4}-\d{2}$/.test(String(month))) {
      res.status(400).json({ error: 'month must be in YYYY-MM format' })
      return
    }

    const parsedAmount = parseFloat(String(amount))
    if (isNaN(parsedAmount) || parsedAmount <= 0 || !Number.isFinite(parsedAmount)) {
      res.status(400).json({ error: 'amount must be a positive finite number' })
      return
    }

    const category = await prisma.category.findFirst({
      where: { id: categoryId, userId: req.userId! },
    })
    if (!category) {
      res.status(400).json({ error: 'Invalid category' })
      return
    }

    const budget = await budgetService.upsert(req.userId!, {
      categoryId,
      amount: parsedAmount,
      month,
    })
    res.json({ budget })
  } catch (err) {
    next(err)
  }
})

budgetRouter.delete('/:id', async (req, res, next) => {
  try {
    await budgetService.delete(req.params.id, req.userId!)
    res.json({ message: 'Budget deleted' })
  } catch (err) {
    next(err)
  }
})
