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
import { contactRouter } from './routes/contact.routes.js'
import { isAiConfigured } from './services/ai.service.js'

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set')
}

const app = express()
app.set('trust proxy', 1)
app.disable('x-powered-by')
const PORT = process.env.PORT || 3000

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:4173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

// Entries may use a "*" wildcard, e.g. https://*.vercel.app for preview deployments
const originMatchers = allowedOrigins.map((o) =>
  o.includes('*') ? new RegExp(`^${o.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[a-z0-9-]+')}$`, 'i') : o
)

app.use(cors({
  origin: (origin, cb) => {
    // Same-origin and non-browser requests have no Origin header
    if (!origin) return cb(null, true)
    cb(null, originMatchers.some((m) => (typeof m === 'string' ? m === origin : m.test(origin))))
  },
  credentials: true,
}))

app.use(express.json({ limit: '100kb' }))

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', ai: isAiConfigured(), timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/auth', authRouter)
app.use('/api/categories', categoryRouter)
app.use('/api/transactions', transactionRouter)
app.use('/api/budgets', budgetRouter)
app.use('/api/analytics', analyticsRouter)
app.use('/api/ai', aiRouter)
app.use('/api/export', exportRouter)
app.use('/api/contact', contactRouter)

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Error handler
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`PennyWise API running on http://localhost:${PORT}`)
})
