import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { errorHandler } from './middleware/error.middleware.js'
import { authRouter } from './routes/auth.routes.js'
import { categoryRouter } from './routes/category.routes.js'
import { transactionRouter } from './routes/transaction.routes.js'
import { budgetRouter } from './routes/budget.routes.js'
import { analyticsRouter } from './routes/analytics.routes.js'
import { aiRouter } from './routes/ai.routes.js'
import { exportRouter } from './routes/export.routes.js'

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set')
}

const app = express()
const PORT = process.env.PORT || 3000

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:4173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}))

app.use(express.json())

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/auth', authRouter)
app.use('/api/categories', categoryRouter)
app.use('/api/transactions', transactionRouter)
app.use('/api/budgets', budgetRouter)
app.use('/api/analytics', analyticsRouter)
app.use('/api/ai', aiRouter)
app.use('/api/export', exportRouter)

// Error handler
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`PennyWise API running on http://localhost:${PORT}`)
})
