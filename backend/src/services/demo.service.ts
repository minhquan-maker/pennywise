import { randomBytes } from 'node:crypto'
import { prisma } from '../lib/prisma.js'
import { hashPassword } from '../utils/bcrypt.util.js'
import { categoryService } from './category.service.js'
import { addMonths, currentMonth, daysInMonth, elapsedDays, monthRange, monthSeries } from '../lib/dates.js'

const DEMO_TTL_MS = 24 * 60 * 60 * 1000

/** Small deterministic PRNG so demo data looks organic but is reproducible per account. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// [category, notes, min, max, expected occurrences per month, weekend bias]
const SPEND_PATTERNS: [string, string[], number, number, number, number][] = [
  ['Food', ['Groceries', 'Lunch with team', 'Coffee', 'Dinner out', 'Bakery', 'Takeaway'], 4, 48, 22, 1.4],
  ['Transport', ['Metro card top-up', 'Uber', 'Fuel', 'Parking'], 3, 45, 9, 0.8],
  ['Shopping', ['Sneakers', 'Books', 'Home supplies', 'Gift'], 15, 120, 3, 1.6],
  ['Entertainment', ['Cinema', 'Concert tickets', 'Streaming', 'Bowling'], 8, 60, 4, 2],
  ['Health', ['Pharmacy', 'Gym class', 'Vitamins'], 10, 55, 2, 1],
]

export const demoService = {
  async createDemoUser() {
    // Housekeeping: demo accounts expire after a day
    await prisma.user.deleteMany({ where: { isDemo: true, createdAt: { lt: new Date(Date.now() - DEMO_TTL_MS) } } })

    const id = randomBytes(6).toString('hex')
    const user = await prisma.user.create({
      data: {
        email: `demo-${id}@pennywise.demo`,
        name: 'Demo User',
        passwordHash: await hashPassword(randomBytes(24).toString('hex')),
        isDemo: true,
      },
    })
    await categoryService.seedDefaultCategories(user.id)
    const categories = await prisma.category.findMany({ where: { userId: user.id } })
    const byName = new Map(categories.map((c) => [c.name, c]))

    const rand = mulberry32(parseInt(id.slice(0, 8), 16))
    const cur = currentMonth()
    const months = monthSeries(cur, 6)
    const txns: { userId: string; categoryId: string; amount: number; note: string; date: Date; type: string }[] = []

    months.forEach((month, mi) => {
      const { start } = monthRange(month)
      const lastDay = month === cur ? Math.max(elapsedDays(month), 1) : daysInMonth(month)
      const day = (d: number) => new Date(start.getTime() + (d - 1) * 86_400_000)
      const push = (cat: string, amount: number, note: string, d: number) => {
        const c = byName.get(cat)
        if (!c || d > lastDay) return
        txns.push({ userId: user.id, categoryId: c.id, amount: Math.round(amount * 100) / 100, note, date: day(d), type: c.type })
      }

      // Income
      push('Salary', 3200, 'Monthly salary', 1)
      if (rand() < 0.6) push('Freelance', 250 + rand() * 650, 'Freelance project', 10 + Math.floor(rand() * 15))

      // Fixed bills
      push('Bills', 950, 'Rent', 2)
      push('Bills', 55 + rand() * 25, 'Electricity', 12)
      push('Bills', 35, 'Internet', 15)
      push('Bills', 12.99, 'Phone plan', 18)

      // Variable spending, gently rising food/entertainment trend for an interesting forecast
      for (const [cat, notes, min, max, perMonth, weekendBias] of SPEND_PATTERNS) {
        const drift = cat === 'Food' || cat === 'Entertainment' ? 1 + mi * 0.06 : 1
        const count = Math.round(perMonth * (0.8 + rand() * 0.4))
        for (let i = 0; i < count; i++) {
          let d = 1 + Math.floor(rand() * daysInMonth(month))
          const weekday = day(d).getUTCDay()
          if (weekendBias > 1 && weekday !== 0 && weekday !== 6 && rand() < (weekendBias - 1) / weekendBias) {
            d = Math.min(daysInMonth(month), d + (6 - weekday)) // nudge to Saturday
          }
          push(cat, (min + rand() * (max - min)) * drift, notes[Math.floor(rand() * notes.length)], d)
        }
      }
    })

    await prisma.transaction.createMany({ data: txns })

    const budgetPlan: [string, number][] = [
      ['Food', 520],
      ['Transport', 160],
      ['Shopping', 200],
      ['Entertainment', 120],
      ['Bills', 1100],
    ]
    await prisma.budget.createMany({
      data: [addMonths(cur, -1), cur].flatMap((month) =>
        budgetPlan.map(([name, amount]) => ({ userId: user.id, categoryId: byName.get(name)!.id, amount, month }))
      ),
    })

    return user
  },
}
