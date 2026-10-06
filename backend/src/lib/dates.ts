// All calendar math is done in UTC. The client stores a transaction's calendar day as
// UTC midnight ("2026-10-06" -> 2026-10-06T00:00:00.000Z), so grouping by UTC keeps the
// day/month a user picked stable regardless of the server's or the viewer's time zone.

export const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/

export function isValidMonth(month: unknown): month is string {
  return typeof month === 'string' && MONTH_REGEX.test(month)
}

export function parseMonth(month: string): { year: number; monthIndex: number } {
  const [y, m] = month.split('-')
  return { year: parseInt(y, 10), monthIndex: parseInt(m, 10) - 1 }
}

export function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

export function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function currentMonth(now = new Date()): string {
  return monthKey(now)
}

export function addMonths(month: string, delta: number): string {
  const { year, monthIndex } = parseMonth(month)
  return monthKey(new Date(Date.UTC(year, monthIndex + delta, 1)))
}

/** [start, end) of a month in UTC. */
export function monthRange(month: string): { start: Date; end: Date } {
  const { year, monthIndex } = parseMonth(month)
  return {
    start: new Date(Date.UTC(year, monthIndex, 1)),
    end: new Date(Date.UTC(year, monthIndex + 1, 1)),
  }
}

export function daysInMonth(month: string): number {
  const { year, monthIndex } = parseMonth(month)
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate()
}

/** Ordered list of `count` month keys ending at `lastMonth` (inclusive). */
export function monthSeries(lastMonth: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => addMonths(lastMonth, i - count + 1))
}

/**
 * How far into `month` we are, as an elapsed-day count.
 * Past months are fully elapsed, future months have 0 elapsed days.
 */
export function elapsedDays(month: string, now = new Date()): number {
  const total = daysInMonth(month)
  const cur = currentMonth(now)
  if (month < cur) return total
  if (month > cur) return 0
  return now.getUTCDate()
}

/** Normalise any date-ish input to UTC midnight of the calendar day it names. */
export function toUtcDay(input: string | Date): Date | null {
  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const d = new Date(`${input}T00:00:00.000Z`)
    return isNaN(d.getTime()) ? null : d
  }
  const d = new Date(input)
  if (isNaN(d.getTime())) return null
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}
