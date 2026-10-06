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
import { isDatabaseConfigured } from './lib/prisma.js'

// Missing config should produce a clear API error, not a crashed serverless function
const configError = !process.env.JWT_SECRET
  ? 'Server misconfigured: JWT_SECRET is not set. Add it in the hosting environment variables and redeploy.'
  : !isDatabaseConfigured
    ? 'Database not configured. Connect a Postgres database (Vercel → Storage → Neon) and redeploy.'
    : null
if (configError) console.error('[config]', configError)

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

// All endpoints live on one router. It is mounted at /api (local dev, Docker, Vercel when the
// prefix is forwarded) and at / (in case the platform strips the /api prefix before routing).
const api = express.Router()

api.get('/health', (_req, res) => {
  res.json({ status: configError ? 'misconfigured' : 'ok', error: configError ?? undefined, database: isDatabaseConfigured, jwt: !!process.env.JWT_SECRET, ai: isAiConfigured(), timestamp: new Date().toISOString() })
})
api.use((_req, res, next) => {
  if (!configError) return next()
  res.status(503).json({ error: configError })
})
api.use('/auth', authRouter)
api.use('/categories', categoryRouter)
api.use('/transactions', transactionRouter)
api.use('/budgets', budgetRouter)
api.use('/analytics', analyticsRouter)
api.use('/ai', aiRouter)
api.use('/export', exportRouter)
api.use('/contact', contactRouter)
api.use((_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

app.use('/api', api)
app.use(api)

// Error handler
app.use(errorHandler)

// Vercel imports the default export as a serverless handler; everywhere else we listen on a port
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`PennyWise API running on http://localhost:${PORT}`)
  })
}

export default app
