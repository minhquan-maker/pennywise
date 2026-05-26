import { prisma } from '../lib/prisma.js'

export const budgetService = {
  async getAll(userId: string, month?: string) {
    const where: Record<string, unknown> = { userId }
    if (month) where.month = month

    return prisma.budget.findMany({
      where,
      include: { category: true },
    })
  },

  async upsert(userId: string, data: { categoryId: string; amount: number; month: string }) {
    return prisma.budget.upsert({
      where: {
        userId_categoryId_month: {
          userId,
          categoryId: data.categoryId,
          month: data.month,
        },
      },
      update: { amount: data.amount },
      create: { ...data, userId },
      include: { category: true },
    })
  },

  async delete(id: string, userId: string) {
    return prisma.budget.delete({ where: { id, userId } })
  },
}
