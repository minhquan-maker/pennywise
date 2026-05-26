import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { transactionService } from '../services/transaction.service.js'
import { prisma } from '../lib/prisma.js'

export const exportRouter = Router()

exportRouter.use(authMiddleware)

exportRouter.get('/csv', async (req, res, next) => {
  try {
    const { month } = req.query
    const transactions = await transactionService.getAll(req.userId!, {
      month: month as string,
    })

    const user = await prisma.user.findUnique({ where: { id: req.userId! } })
    const currency = user?.currency || 'USD'

    const header = `Date,Category,Amount (${currency}),Note\n`
    const rows = transactions
      .map((t) => {
        const date = new Date(t.date).toISOString().split('T')[0]
        const name = t.category.name
        const amount = currency === 'VND' ? t.amount.toLocaleString() : t.amount.toFixed(2)
        const note = (t.note || '').replace(/"/g, '""')
        return `"${date}","${name}",${amount},"${note}"`
      })
      .join('\n')

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="pennywise-export-${month || 'all'}.csv"`)
    res.send(header + rows)
  } catch (err) {
    next(err)
  }
})
