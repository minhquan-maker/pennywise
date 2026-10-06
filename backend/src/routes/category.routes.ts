import { Router } from 'express'
import { categoryService, CATEGORY_TYPES } from '../services/category.service.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { prisma } from '../lib/prisma.js'

export const categoryRouter = Router()

categoryRouter.use(authMiddleware)

const COLOR_REGEX = /^#[0-9a-fA-F]{6}$/

function cleanName(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const name = value.trim().slice(0, 30)
  return name || null
}

function cleanIcon(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null
  return [...value.trim()].slice(0, 2).join('')
}

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
    const name = cleanName(req.body.name)
    if (!name) {
      res.status(400).json({ error: 'Name is required' })
      return
    }
    const type = req.body.type ?? 'expense'
    if (!CATEGORY_TYPES.includes(type)) {
      res.status(400).json({ error: 'type must be expense or income' })
      return
    }
    if (req.body.color !== undefined && !COLOR_REGEX.test(req.body.color)) {
      res.status(400).json({ error: 'color must be a hex value like #5CF03A' })
      return
    }
    const duplicate = await prisma.category.findFirst({ where: { userId: req.userId!, name, type } })
    if (duplicate) {
      res.status(409).json({ error: `A ${type} category named "${name}" already exists` })
      return
    }
    const category = await categoryService.create(req.userId!, {
      name,
      icon: cleanIcon(req.body.icon) ?? '💰',
      color: req.body.color ?? '#7C8CFF',
      type,
    })
    res.status(201).json({ category })
  } catch (err) {
    next(err)
  }
})

categoryRouter.put('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.category.findFirst({ where: { id: req.params.id, userId: req.userId! } })
    if (!existing) {
      res.status(404).json({ error: 'Category not found' })
      return
    }
    const data: { name?: string; icon?: string; color?: string } = {}
    if (req.body.name !== undefined) {
      const name = cleanName(req.body.name)
      if (!name) {
        res.status(400).json({ error: 'Name cannot be empty' })
        return
      }
      data.name = name
    }
    if (req.body.icon !== undefined) {
      const icon = cleanIcon(req.body.icon)
      if (!icon) {
        res.status(400).json({ error: 'Icon cannot be empty' })
        return
      }
      data.icon = icon
    }
    if (req.body.color !== undefined) {
      if (!COLOR_REGEX.test(req.body.color)) {
        res.status(400).json({ error: 'color must be a hex value like #5CF03A' })
        return
      }
      data.color = req.body.color
    }
    const category = await categoryService.update(req.params.id, req.userId!, data)
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
