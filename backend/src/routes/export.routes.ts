import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { transactionService } from '../services/transaction.service.js'
import { prisma } from '../lib/prisma.js'
import { dayKey, isValidMonth } from '../lib/dates.js'

export const exportRouter = Router()

exportRouter.use(authMiddleware)

/** RFC 4180 field: always quoted, quotes doubled; leading formula characters neutralised for spreadsheets. */
function csvField(value: string): string {
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value
  return `"${safe.replace(/"/g, '""')}"`
}

exportRouter.get('/csv', async (req, res, next) => {
  try {
    const { month } = req.query
    if (month !== undefined && !isValidMonth(month)) {
      res.status(400).json({ error: 'month must be in YYYY-MM format' })
      return
    }
    const transactions = await transactionService.getAll(req.userId!, { month: month as string | undefined })

    const user = await prisma.user.findUnique({ where: { id: req.userId! } })
    const currency = user?.currency || 'USD'

    const header = ['Date', 'Type', 'Category', `Amount (${currency})`, 'Note'].map(csvField).join(',')
    const rows = transactions.map((t) =>
      [
        dayKey(t.date),
        t.type,
        t.category.name,
        currency === 'VND' ? String(Math.round(t.amount)) : t.amount.toFixed(2),
        t.note || '',
      ]
        .map(csvField)
        .join(',')
    )

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="pennywise-export-${month || 'all'}.csv"`)
    // BOM so Excel opens UTF-8 (emoji, Vietnamese) correctly
    res.send('﻿' + [header, ...rows].join('\r\n'))
  } catch (err) {
    next(err)
  }
})
