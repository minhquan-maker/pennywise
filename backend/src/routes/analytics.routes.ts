import { Router } from 'express'
import { analyticsService } from '../services/analytics.service.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

export const analyticsRouter = Router()

analyticsRouter.use(authMiddleware)

analyticsRouter.get('/dashboard', async (req, res, next) => {
  try {
    const { month } = req.query
    const data = await analyticsService.getDashboard(req.userId!, month as string)
    res.json(data)
  } catch (err) {
    next(err)
  }
})

analyticsRouter.get('/trend', async (req, res, next) => {
  try {
    const months = parseInt((req.query.months as string) || '6')
    const data = await analyticsService.getTrend(req.userId!, months)
    res.json({ trend: data })
  } catch (err) {
    next(err)
  }
})
