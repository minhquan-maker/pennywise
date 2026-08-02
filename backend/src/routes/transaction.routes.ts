import { Router } from 'express'
import { transactionService } from '../services/transaction.service.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { prisma } from '../lib/prisma.js'

export const transactionRouter = Router()

transactionRouter.use(authMiddleware)

transactionRouter.get('/', async (req, res, next) => {
  try {
    const { month, category, search } = req.query
    const transactions = await transactionService.getAll(req.userId!, {
      month: month as string,
      categoryId: category as string,
      search: search as string,
    })
    res.json({ transactions })
  } catch (err) {
    next(err)
  }
})

transactionRouter.post('/', async (req, res, next) => {
  try {
    const { categoryId, amount, note, date } = req.body

    if (!categoryId || !amount || !date) {
      res.status(400).json({ error: 'categoryId, amount, and date are required' })
      return
    }

    // Validate categoryId belongs to this user
    const category = await prisma.category.findFirst({
      where: { id: categoryId, userId: req.userId! },
    })
    if (!category) {
      res.status(400).json({ error: 'Invalid category' })
      return
    }

    // Validate date
    const parsedDate = new Date(date)
    if (isNaN(parsedDate.getTime())) {
      res.status(400).json({ error: 'Invalid date format' })
      return
    }

    // Validate amount
    const parsedAmount = parseFloat(String(amount))
    if (isNaN(parsedAmount) || parsedAmount <= 0 || !Number.isFinite(parsedAmount)) {
      res.status(400).json({ error: 'amount must be a positive finite number' })
      return
    }

    const transaction = await transactionService.create(req.userId!, {
      categoryId,
      amount: parsedAmount,
      note,
      date: parsedDate,
    })
    res.status(201).json({ transaction })
  } catch (err) {
    next(err)
  }
})

transactionRouter.put('/:id', async (req, res, next) => {
  try {
    const { categoryId, amount, note, date } = req.body

    if (categoryId !== undefined) {
      const category = await prisma.category.findFirst({
        where: { id: categoryId, userId: req.userId! },
      })
      if (!category) {
        res.status(400).json({ error: 'Invalid category' })
        return
      }
    }

    if (date !== undefined) {
      const parsedDate = new Date(date)
      if (isNaN(parsedDate.getTime())) {
        res.status(400).json({ error: 'Invalid date format' })
        return
      }
    }

    if (amount !== undefined) {
      const parsedAmount = parseFloat(amount)
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        res.status(400).json({ error: 'amount must be a positive number' })
        return
      }
    }

    const transaction = await transactionService.update(req.params.id, req.userId!, {
      categoryId,
      amount: amount !== undefined ? parseFloat(amount) : undefined,
      note,
      date: date ? new Date(date) : undefined,
    })
    res.json({ transaction })
  } catch (err) {
    next(err)
  }
})

transactionRouter.delete('/clear', async (req, res, next) => {
  try {
    await prisma.transaction.deleteMany({ where: { userId: req.userId! } })
    res.json({ message: 'All transactions deleted' })
  } catch (err) {
    next(err)
  }
})

transactionRouter.delete('/:id', async (req, res, next) => {
  try {
    await transactionService.delete(req.params.id, req.userId!)
    res.json({ message: 'Transaction deleted' })
  } catch (err) {
    next(err)
  }
})
