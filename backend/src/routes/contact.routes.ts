import { Router } from 'express'
import { prisma } from '../lib/prisma.js'

export const contactRouter = Router()

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TOPICS = ['general', 'feedback', 'bug', 'partnership'] as const
const WINDOW_MS = 60 * 60 * 1000
const MAX_PER_WINDOW = 5
const recent = new Map<string, number[]>()

/** Optional: forward to a Slack/Discord incoming webhook (both read one of these keys). */
async function forward(text: string) {
  const url = process.env.CONTACT_WEBHOOK_URL
  if (!url) return
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, content: text.slice(0, 1900) }),
      signal: AbortSignal.timeout(5000),
    })
  } catch (err) {
    console.warn('[contact webhook]', (err as Error).message)
  }
}

contactRouter.post('/', async (req, res, next) => {
  try {
    // Honeypot: real users never fill the hidden "website" field
    if (typeof req.body.website === 'string' && req.body.website.trim()) {
      res.status(201).json({ message: 'Thanks — we will be in touch.' })
      return
    }

    const name = typeof req.body.name === 'string' ? req.body.name.trim().slice(0, 80) : ''
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase().slice(0, 120) : ''
    const message = typeof req.body.message === 'string' ? req.body.message.trim().slice(0, 2000) : ''
    const topic = TOPICS.includes(req.body.topic) ? (req.body.topic as string) : 'general'

    if (!name || !email || !message) {
      res.status(400).json({ error: 'Name, email and message are required' })
      return
    }
    if (!EMAIL_REGEX.test(email)) {
      res.status(400).json({ error: 'Please enter a valid email address' })
      return
    }
    if (message.length < 10) {
      res.status(400).json({ error: 'Message is a little short — tell us a bit more' })
      return
    }

    const key = req.ip ?? 'unknown'
    const now = Date.now()
    const hits = (recent.get(key) ?? []).filter((t) => now - t < WINDOW_MS)
    if (hits.length >= MAX_PER_WINDOW) {
      res.status(429).json({ error: 'Too many messages. Please try again later.' })
      return
    }
    recent.set(key, [...hits, now])

    await prisma.contactMessage.create({ data: { name, email, topic, message } })
    await forward(`📬 PennyWise contact (${topic}) from ${name} <${email}>\n${message}`)
    res.status(201).json({ message: 'Thanks — we will be in touch.' })
  } catch (err) {
    next(err)
  }
})
