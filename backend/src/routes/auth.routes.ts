import { Router, type Request } from 'express'
import { signToken } from '../utils/jwt.util.js'
import { comparePassword, hashPassword } from '../utils/bcrypt.util.js'
import { userService } from '../services/user.service.js'
import { categoryService } from '../services/category.service.js'
import { demoService } from '../services/demo.service.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { prisma } from '../lib/prisma.js'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Simple in-memory throttle: at most MAX_ATTEMPTS failed logins per email+IP per window
const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 8
const failedLogins = new Map<string, { count: number; first: number }>()

function throttleKey(req: Request, email: string) {
  return `${req.ip}:${email}`
}

function isThrottled(key: string) {
  const entry = failedLogins.get(key)
  if (!entry) return false
  if (Date.now() - entry.first > WINDOW_MS) {
    failedLogins.delete(key)
    return false
  }
  return entry.count >= MAX_ATTEMPTS
}

function recordFailure(key: string) {
  const entry = failedLogins.get(key)
  if (!entry || Date.now() - entry.first > WINDOW_MS) failedLogins.set(key, { count: 1, first: Date.now() })
  else entry.count++
}

const publicUser = (user: { id: string; email: string; name: string; currency: string; isDemo?: boolean }) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  currency: user.currency,
  isDemo: user.isDemo ?? false,
})

export const authRouter = Router()

authRouter.post('/register', async (req, res, next) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : ''
    const password = typeof req.body.password === 'string' ? req.body.password : ''
    const name = typeof req.body.name === 'string' ? req.body.name.trim().slice(0, 60) : ''

    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, password, and name are required' })
      return
    }
    if (!EMAIL_REGEX.test(email)) {
      res.status(400).json({ error: 'Please enter a valid email address' })
      return
    }
    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters' })
      return
    }

    const existing = await userService.findByEmail(email)
    if (existing) {
      res.status(409).json({ error: 'Email already in use' })
      return
    }

    const user = await userService.create(email, password, name)
    await categoryService.seedDefaultCategories(user.id)

    res.status(201).json({ token: signToken(user.id), user: publicUser(user) })
  } catch (err) {
    next(err)
  }
})

authRouter.post('/login', async (req, res, next) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : ''
    const password = typeof req.body.password === 'string' ? req.body.password : ''

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' })
      return
    }

    const key = throttleKey(req, email)
    if (isThrottled(key)) {
      res.status(429).json({ error: 'Too many attempts. Try again in a few minutes.' })
      return
    }

    const user = await userService.verifyPassword(email, password)
    if (!user) {
      recordFailure(key)
      res.status(401).json({ error: 'Invalid email or password' })
      return
    }
    failedLogins.delete(key)

    res.json({ token: signToken(user.id), user: publicUser(user) })
  } catch (err) {
    next(err)
  }
})

/** Creates a throwaway account pre-filled with 6 months of realistic data. */
authRouter.post('/demo', async (_req, res, next) => {
  try {
    const user = await demoService.createDemoUser()
    res.status(201).json({ token: signToken(user.id), user: publicUser(user) })
  } catch (err) {
    next(err)
  }
})

authRouter.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await userService.findById(req.userId!)
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }
    res.json({ user })
  } catch (err) {
    next(err)
  }
})

authRouter.put('/me', authMiddleware, async (req, res, next) => {
  try {
    const name = typeof req.body.name === 'string' ? req.body.name.trim().slice(0, 60) : undefined
    const currency = typeof req.body.currency === 'string' ? req.body.currency.trim().toUpperCase() : undefined
    if (name !== undefined && !name) {
      res.status(400).json({ error: 'Name cannot be empty' })
      return
    }
    if (currency !== undefined && !['USD', 'VND'].includes(currency)) {
      res.status(400).json({ error: 'Currency must be USD or VND' })
      return
    }
    const user = await userService.update(req.userId!, { name, currency })
    res.json({ user })
  } catch (err) {
    next(err)
  }
})

authRouter.put('/password', authMiddleware, async (req, res, next) => {
  try {
    const current = typeof req.body.currentPassword === 'string' ? req.body.currentPassword : ''
    const next_ = typeof req.body.newPassword === 'string' ? req.body.newPassword : ''
    if (next_.length < 8) {
      res.status(400).json({ error: 'New password must be at least 8 characters' })
      return
    }
    const user = await prisma.user.findUnique({ where: { id: req.userId! } })
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }
    if (user.isDemo) {
      res.status(403).json({ error: 'Demo accounts cannot change password' })
      return
    }
    if (!(await comparePassword(current, user.passwordHash))) {
      res.status(400).json({ error: 'Current password is incorrect' })
      return
    }
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(next_) } })
    res.json({ message: 'Password updated' })
  } catch (err) {
    next(err)
  }
})

authRouter.delete('/me', authMiddleware, async (req, res, next) => {
  try {
    await userService.delete(req.userId!)
    res.json({ message: 'Account deleted' })
  } catch (err) {
    next(err)
  }
})
