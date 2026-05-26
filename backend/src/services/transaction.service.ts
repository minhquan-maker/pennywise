import { prisma } from '../lib/prisma.js'

export const transactionService = {
  async getAll(
    userId: string,
    filters?: { month?: string; categoryId?: string; search?: string }
  ) {
    const where: Record<string, unknown> = { userId }

    if (filters?.month) {
      const [year, m] = filters.month.split('-')
      where.date = {
        gte: new Date(parseInt(year), parseInt(m) - 1, 1),
        lt: new Date(parseInt(year), parseInt(m), 1),
      }
    }

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId
    }

    if (filters?.search) {
      where.note = { contains: filters.search }
    }

    return prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy: { date: 'desc' },
    })
  },

  async create(userId: string, data: { categoryId: string; amount: number; note?: string; date: Date }) {
    return prisma.transaction.create({
      data: { ...data, userId },
      include: { category: true },
    })
  },

  async update(id: string, userId: string, data: { categoryId?: string; amount?: number; note?: string; date?: Date }) {
    return prisma.transaction.update({
      where: { id, userId },
      data,
      include: { category: true },
    })
  },

  async delete(id: string, userId: string) {
    return prisma.transaction.delete({ where: { id, userId } })
  },
}
