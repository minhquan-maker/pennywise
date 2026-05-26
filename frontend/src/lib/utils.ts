import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  if (currency === 'VND') {
    return `${amount.toLocaleString('vi-VN')} VND`
  }
  return `$${amount.toFixed(2)}`
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function formatMonth(monthStr: string): string {
  const [year, m] = monthStr.split('-')
  const d = new Date(parseInt(year), parseInt(m) - 1)
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export function getPasswordStrength(password: string): number {
  if (!password) return 0
  let score = 0
  if (password.length >= 8)  score++
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password) || /[^a-zA-Z0-9]/.test(password)) score++
  return score
}
