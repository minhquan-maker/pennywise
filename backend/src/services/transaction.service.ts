import { prisma } from '../lib/prisma.js'
import { monthRange } from '../lib/dates.js'

export interface TransactionFilters {
  month?: string
  categoryId?: string
  search?: string
  type?: 'expense' | 'income'
  limit?: number
}

function buildWhere(userId: string, filters?: TransactionFilters) {
  const where: Record<string, unknown> = { userId }
  if (filters?.month) {
    const { start, end } = monthRange(filters.month)
    where.date = { gte: start, lt: end }
  }
  if (filters?.categoryId) where.categoryId = filters.categoryId
  if (filters?.type) where.type = filters.type
  if (filters?.search) {
    where.OR = [
      { note: { contains: filters.search } },
      { category: { name: { contains: filters.search } } },
    ]
  }
  return where
}

export const transactionService = {
  async getAll(userId: string, filters?: TransactionFilters) {
    return prisma.transaction.findMany({
      where: buildWhere(userId, filters),
      include: { category: true },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      take: filters?.limit,
    })
  },

  async create(
    userId: string,
    data: { categoryId: string; amount: number; note?: string | null; date: Date; type: string }
  ) {
    return prisma.transaction.create({
      data: { ...data, userId },
      include: { category: true },
    })
  },

  async update(
    id: string,
    userId: string,
    data: { categoryId?: string; amount?: number; note?: string | null; date?: Date; type?: string }
  ) {
    return prisma.transaction.update({
      where: { id, userId },
      data,
      include: { category: true },
    })
  },

  async delete(id: string, userId: string) {
    return prisma.transaction.delete({ where: { id, userId } })
  },

  async clear(userId: string, month?: string) {
    return prisma.transaction.deleteMany({ where: buildWhere(userId, { month }) })
  },
}
