import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Money formatting. VND has no minor unit; `compact` gives 1.2K / 3.4M for tight spaces (chart axes). */
export function formatCurrency(amount: number, currency: string = 'USD', opts: { compact?: boolean; sign?: boolean } = {}): string {
  const value = Number.isFinite(amount) ? amount : 0
  const sign = opts.sign && value > 0 ? '+' : ''
  if (currency === 'VND') {
    const body = opts.compact
      ? new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
      : Math.round(value).toLocaleString('vi-VN')
    return `${sign}${body} ₫`
  }
  const body = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: opts.compact ? 'compact' : 'standard',
    maximumFractionDigits: opts.compact ? 1 : 2,
    minimumFractionDigits: opts.compact ? 0 : 2,
  }).format(value)
  return `${sign}${body}`
}

export function currencySymbol(currency: string) {
  return currency === 'VND' ? '₫' : '$'
}

// Transaction dates are calendar days stored as UTC midnight — always format them in UTC.
export function formatDate(dateStr: string, opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }): string {
  return new Date(dateStr).toLocaleDateString('en-US', { ...opts, timeZone: 'UTC' })
}

export function formatDayHeading(dateStr: string): string {
  const day = dateStr.slice(0, 10)
  const today = todayISO()
  if (day === today) return 'Today'
  if (day === shiftDay(today, -1)) return 'Yesterday'
  return formatDate(dateStr, { weekday: 'long', month: 'short', day: 'numeric' })
}

/** Local calendar day as YYYY-MM-DD (what the user means by "today"). */
export function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function shiftDay(day: string, delta: number): string {
  const d = new Date(`${day}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + delta)
  return d.toISOString().slice(0, 10)
}

export function getCurrentMonth(): string {
  return todayISO().slice(0, 7)
}

export function addMonths(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(Date.UTC(y, m - 1 + delta, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

export function formatMonth(monthStr: string, style: 'long' | 'short' = 'long'): string {
  const [year, m] = monthStr.split('-').map(Number)
  return new Date(Date.UTC(year, m - 1, 1)).toLocaleDateString('en-US', {
    month: style,
    year: style === 'long' ? 'numeric' : '2-digit',
    timeZone: 'UTC',
  })
}

export function formatPercent(fraction: number | null | undefined, digits = 0): string {
  if (fraction === null || fraction === undefined || !Number.isFinite(fraction)) return '—'
  return `${(fraction * 100).toFixed(digits)}%`
}

export function greeting(date = new Date()): string {
  const h = date.getHours()
  if (h < 5) return 'Good night'
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export function getPasswordStrength(password: string): number {
  if (!password) return 0
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password) || /[^a-zA-Z0-9]/.test(password)) score++
  return score
}

export function apiError(err: unknown, fallback: string): string {
  return (err as { response?: { data?: { error?: string } } })?.response?.data?.error || fallback
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
