import { Router } from 'express'
import { signToken } from '../utils/jwt.util.js'
import { userService } from '../services/user.service.js'
import { categoryService } from '../services/category.service.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

export const authRouter = Router()

authRouter.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body

    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, password, and name are required' })
      return
    }

    const existing = await userService.findByEmail(email)
    if (existing) {
      res.status(409).json({ error: 'Email already in use' })
      return
    }

    const user = await userService.create(email, password, name)
    await categoryService.seedDefaultCategories(user.id)

    const token = signToken(user.id)
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name, currency: user.currency },
    })
  } catch (err) {
    next(err)
  }
})

authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' })
      return
    }

    const user = await userService.verifyPassword(email, password)
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }

    const token = signToken(user.id)
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, currency: user.currency },
    })
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
    const { name, currency } = req.body
    const user = await userService.update(req.userId!, { name, currency })
    res.json({ user })
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
