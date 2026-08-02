import { Router } from 'express'
import { categoryService } from '../services/category.service.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

export const categoryRouter = Router()

categoryRouter.use(authMiddleware)

categoryRouter.get('/', async (req, res, next) => {
  try {
    const categories = await categoryService.getAll(req.userId!)
    res.json({ categories })
  } catch (err) {
    next(err)
  }
})

categoryRouter.post('/', async (req, res, next) => {
  try {
    const { name, icon, color } = req.body
    if (!name) {
      res.status(400).json({ error: 'Name is required' })
      return
    }
    const category = await categoryService.create(req.userId!, {
      name,
      icon: icon || '💰',
      color: color || '#6366f1',
    })
    res.status(201).json({ category })
  } catch (err) {
    next(err)
  }
})

categoryRouter.put('/:id', async (req, res, next) => {
  try {
    const { name, icon, color } = req.body
    const category = await categoryService.update(req.params.id, req.userId!, { name, icon, color })
    res.json({ category })
  } catch (err) {
    next(err)
  }
})

categoryRouter.delete('/:id', async (req, res, next) => {
  try {
    try {
      await categoryService.delete(req.params.id, req.userId!)
    } catch (err) {
      const msg = (err as Error).message
      if (
        msg === 'Category not found' ||
        msg === 'Cannot delete default categories' ||
        msg.startsWith('Cannot delete category')
      ) {
        res.status(400).json({ error: msg })
        return
      }
      throw err
    }
    res.json({ message: 'Category deleted' })
  } catch (err) {
    next(err)
  }
})
