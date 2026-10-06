import { Router } from 'express'
import { transactionService } from '../services/transaction.service.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { prisma } from '../lib/prisma.js'
import { isValidMonth, toUtcDay } from '../lib/dates.js'

export const transactionRouter = Router()

transactionRouter.use(authMiddleware)

const MAX_AMOUNT = 1e12
const MAX_NOTE = 200

function parseAmount(value: unknown): number | null {
  const n = typeof value === 'number' ? value : parseFloat(String(value))
  if (!Number.isFinite(n) || n <= 0 || n > MAX_AMOUNT) return null
  return Math.round(n * 100) / 100
}

function parseNote(value: unknown): string | null | undefined {
  if (value === undefined) return undefined
  if (value === null) return null
  const note = String(value).trim().slice(0, MAX_NOTE)
  return note || null
}

transactionRouter.get('/', async (req, res, next) => {
  try {
    const { month, category, search, type, limit } = req.query
    if (month && !isValidMonth(month)) {
      res.status(400).json({ error: 'month must be in YYYY-MM format' })
      return
    }
    const parsedLimit = limit ? parseInt(String(limit), 10) : undefined
    const transactions = await transactionService.getAll(req.userId!, {
      month: (month as string) || undefined,
      categoryId: (category as string) || undefined,
      search: typeof search === 'string' && search.trim() ? search.trim() : undefined,
      type: type === 'income' || type === 'expense' ? type : undefined,
      limit: parsedLimit && parsedLimit > 0 ? Math.min(parsedLimit, 500) : undefined,
    })
    res.json({ transactions })
  } catch (err) {
    next(err)
  }
})

transactionRouter.post('/', async (req, res, next) => {
  try {
    const { categoryId, amount, note, date } = req.body

    if (!categoryId || amount === undefined || !date) {
      res.status(400).json({ error: 'categoryId, amount, and date are required' })
      return
    }

    const category = await prisma.category.findFirst({ where: { id: categoryId, userId: req.userId! } })
    if (!category) {
      res.status(400).json({ error: 'Invalid category' })
      return
    }

    const parsedDate = toUtcDay(date)
    if (!parsedDate) {
      res.status(400).json({ error: 'Invalid date format' })
      return
    }

    const parsedAmount = parseAmount(amount)
    if (parsedAmount === null) {
      res.status(400).json({ error: 'amount must be a positive number' })
      return
    }

    // A transaction's type always follows its category (income vs expense)
    const transaction = await transactionService.create(req.userId!, {
      categoryId,
      amount: parsedAmount,
      note: parseNote(note) ?? null,
      date: parsedDate,
      type: category.type,
    })
    res.status(201).json({ transaction })
  } catch (err) {
    next(err)
  }
})

transactionRouter.put('/:id', async (req, res, next) => {
  try {
    const { categoryId, amount, note, date } = req.body
    const data: { categoryId?: string; amount?: number; note?: string | null; date?: Date; type?: string } = {}

    if (categoryId !== undefined) {
      const category = await prisma.category.findFirst({ where: { id: categoryId, userId: req.userId! } })
      if (!category) {
        res.status(400).json({ error: 'Invalid category' })
        return
      }
      data.categoryId = categoryId
      data.type = category.type
    }

    if (date !== undefined) {
      const parsedDate = toUtcDay(date)
      if (!parsedDate) {
        res.status(400).json({ error: 'Invalid date format' })
        return
      }
      data.date = parsedDate
    }

    if (amount !== undefined) {
      const parsedAmount = parseAmount(amount)
      if (parsedAmount === null) {
        res.status(400).json({ error: 'amount must be a positive number' })
        return
      }
      data.amount = parsedAmount
    }

    data.note = parseNote(note)

    const existing = await prisma.transaction.findFirst({ where: { id: req.params.id, userId: req.userId! } })
    if (!existing) {
      res.status(404).json({ error: 'Transaction not found' })
      return
    }

    const transaction = await transactionService.update(req.params.id, req.userId!, data)
    res.json({ transaction })
  } catch (err) {
    next(err)
  }
})

// Optional ?month=YYYY-MM limits the wipe to one month
transactionRouter.delete('/clear', async (req, res, next) => {
  try {
    const { month } = req.query
    if (month !== undefined && !isValidMonth(month)) {
      res.status(400).json({ error: 'month must be in YYYY-MM format' })
      return
    }
    const { count } = await transactionService.clear(req.userId!, month as string | undefined)
    res.json({ message: `Deleted ${count} transaction(s)`, count })
  } catch (err) {
    next(err)
  }
})

transactionRouter.delete('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.transaction.findFirst({ where: { id: req.params.id, userId: req.userId! } })
    if (!existing) {
      res.status(404).json({ error: 'Transaction not found' })
      return
    }
    await transactionService.delete(req.params.id, req.userId!)
    res.json({ message: 'Transaction deleted' })
  } catch (err) {
    next(err)
  }
})
