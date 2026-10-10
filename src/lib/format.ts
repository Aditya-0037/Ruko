import type { Lang } from '../state/types'

const localeFor = (lang: Lang) => (lang === 'hi' ? 'hi-IN' : 'en-IN')

/** ₹2,00,000 — Indian digit grouping, no paise. */
export function formatINR(amount: number, lang: Lang = 'en'): string {
  return new Intl.NumberFormat(localeFor(lang), {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

/** 2,00,000 — Indian digit grouping without the currency symbol. */
export function formatNumberIN(amount: number, lang: Lang = 'en'): string {
  return new Intl.NumberFormat(localeFor(lang), { maximumFractionDigits: 0 }).format(amount)
}

/** "03:07" for call timers; "1:02:09" past an hour. */
export function formatClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

/** Whole minutes, rounded down, never negative. */
export function minutesBetween(fromMs: number, toMs: number): number {
  return Math.max(0, Math.floor((toMs - fromMs) / 60000))
}

/** "10:42 am" style local time for complaint packs and status timelines. */
export function formatTime(ms: number, lang: Lang = 'en'): string {
  return new Intl.DateTimeFormat(localeFor(lang), { hour: 'numeric', minute: '2-digit' }).format(ms)
}

/** "10 Oct 2026, 10:42 am" */
export function formatDateTime(ms: number, lang: Lang = 'en'): string {
  return new Intl.DateTimeFormat(localeFor(lang), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(ms)
}

/** Keep only digits; used for amounts typed with commas or ₹. */
export function parseAmount(input: string): number {
  const digits = input.replace(/[^0-9]/g, '')
  return digits ? Number(digits) : 0
}
