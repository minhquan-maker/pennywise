import { prisma } from '../lib/prisma.js'

const DEFAULT_CATEGORIES = [
  { name: 'Food', icon: '🍔', color: '#ef4444', isDefault: true },
  { name: 'Transport', icon: '🚌', color: '#3b82f6', isDefault: true },
  { name: 'Shopping', icon: '🛍️', color: '#8b5cf6', isDefault: true },
  { name: 'Entertainment', icon: '🎬', color: '#f59e0b', isDefault: true },
  { name: 'Bills', icon: '📄', color: '#64748b', isDefault: true },
  { name: 'Health', icon: '💊', color: '#10b981', isDefault: true },
  { name: 'Other', icon: '💰', color: '#6366f1', isDefault: true },
]

export const categoryService = {
  async seedDefaultCategories(userId: string) {
    const existing = await prisma.category.findFirst({ where: { userId, isDefault: true } })
    if (existing) return

    await prisma.category.createMany({
      data: DEFAULT_CATEGORIES.map((cat) => ({ ...cat, userId })),
    })
  },

  async getAll(userId: string) {
    return prisma.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    })
  },

  async create(userId: string, data: { name: string; icon: string; color: string }) {
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
    return prisma.category.delete({ where: { id, userId } })
  },
}
