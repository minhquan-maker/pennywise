import { prisma } from '../lib/prisma.js'

const DEFAULT_CATEGORIES = [
  { name: 'Food', icon: '🍔', color: '#F97362', type: 'expense' },
  { name: 'Transport', icon: '🚌', color: '#5B9DFF', type: 'expense' },
  { name: 'Shopping', icon: '🛍️', color: '#B48CFF', type: 'expense' },
  { name: 'Entertainment', icon: '🎬', color: '#FFC24B', type: 'expense' },
  { name: 'Bills', icon: '📄', color: '#8FA3B8', type: 'expense' },
  { name: 'Health', icon: '💊', color: '#3DDBB4', type: 'expense' },
  { name: 'Other', icon: '💰', color: '#7C8CFF', type: 'expense' },
  { name: 'Salary', icon: '💼', color: '#5CF03A', type: 'income' },
  { name: 'Freelance', icon: '💻', color: '#A6F56B', type: 'income' },
  { name: 'Gifts & Other', icon: '🎁', color: '#D8FBC6', type: 'income' },
]

export const CATEGORY_TYPES = ['expense', 'income'] as const

export const categoryService = {
  /** Idempotently add any missing default categories (also back-fills income defaults for older accounts). */
  async seedDefaultCategories(userId: string) {
    const existing = await prisma.category.findMany({
      where: { userId, isDefault: true },
      select: { name: true, type: true },
    })
    const have = new Set(existing.map((c) => `${c.type}:${c.name}`))
    const missing = DEFAULT_CATEGORIES.filter((c) => !have.has(`${c.type}:${c.name}`))
    if (missing.length) {
      await prisma.category.createMany({
        data: missing.map((cat) => ({ ...cat, userId, isDefault: true })),
      })
    }
  },

  async getAll(userId: string) {
    await this.seedDefaultCategories(userId)
    return prisma.category.findMany({
      where: { userId },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    })
  },

  async create(userId: string, data: { name: string; icon: string; color: string; type: string }) {
    return prisma.category.create({
      data: { ...data, userId, isDefault: false },
    })
  },

  async update(id: string, userId: string, data: { name?: string; icon?: string; color?: string }) {
    return prisma.category.update({
      where: { id, userId },
      data,
    })
  },

  async delete(id: string, userId: string) {
    const category = await prisma.category.findFirst({ where: { id, userId } })
    if (!category) throw new Error('Category not found')

    if (category.isDefault) throw new Error('Cannot delete default categories')

    const txCount = await prisma.transaction.count({ where: { categoryId: id } })
    if (txCount > 0) {
      throw new Error(`Cannot delete category "${category.name}" — ${txCount} transaction(s) still use it. Reassign or delete them first.`)
    }

    await prisma.budget.deleteMany({ where: { categoryId: id, userId } })
    return prisma.category.delete({ where: { id, userId } })
  },
}
