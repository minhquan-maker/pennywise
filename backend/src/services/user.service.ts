import { prisma } from '../lib/prisma.js'
import { hashPassword, comparePassword } from '../utils/bcrypt.util.js'

export const userService = {
  async create(email: string, password: string, name: string) {
    const passwordHash = await hashPassword(password)
    return prisma.user.create({
      data: { email, passwordHash, name },
    })
  },

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } })
  },

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, currency: true, createdAt: true },
    })
  },

  async update(id: string, data: { name?: string; currency?: string }) {
    return prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, name: true, currency: true },
    })
  },

  async delete(id: string) {
    return prisma.user.delete({ where: { id } })
  },

  async verifyPassword(email: string, password: string) {
    const user = await this.findByEmail(email)
    if (!user) return null
    const valid = await comparePassword(password, user.passwordHash)
    if (!valid) return null
    return user
  },
}
