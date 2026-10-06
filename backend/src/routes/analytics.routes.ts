import { Router } from 'express'
import { analyticsService } from '../services/analytics.service.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { currentMonth, isValidMonth } from '../lib/dates.js'

export const analyticsRouter = Router()

analyticsRouter.use(authMiddleware)

analyticsRouter.get('/dashboard', async (req, res, next) => {
  try {
    const { month } = req.query
    if (month !== undefined && !isValidMonth(month)) {
      res.status(400).json({ error: 'month must be in YYYY-MM format' })
      return
    }
    const data = await analyticsService.getDashboard(req.userId!, (month as string) || currentMonth())
    res.json(data)
  } catch (err) {
    next(err)
  }
})

analyticsRouter.get('/trend', async (req, res, next) => {
  try {
    const monthsParam = parseInt((req.query.months as string) || '6', 10)
    const months = Number.isFinite(monthsParam) && monthsParam > 0 && monthsParam <= 24 ? monthsParam : 6
    const data = await analyticsService.getTrend(req.userId!, months)
    res.json(data)
  } catch (err) {
    next(err)
  }
})

analyticsRouter.get('/forecast', async (req, res, next) => {
  try {
    res.json(await analyticsService.getForecast(req.userId!))
  } catch (err) {
    next(err)
  }
})
