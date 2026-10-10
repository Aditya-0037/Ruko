import type { Evidence, StatusStep, TransferRequest } from '../../state/types'

/** Translator shape shared by t() from useT() and the fixed-language pack translator. */
export type T = (key: string, vars?: Record<string, string | number>) => string

export const paths = {
  main: '/golden-hour',
  evidence: '/golden-hour/evidence',
  pack: '/golden-hour/pack',
  status: '/golden-hour/status',
} as const

/** National Cyber Crime Reporting Portal. */
export const CYBERCRIME_URL = 'https://cybercrime.gov.in'
/** Sanchar Saathi (Chakshu): report suspected fraud calls and messages. */
export const SANCHAR_SAATHI_URL = 'https://sancharsaathi.gov.in'

/** The first hour after money leaves: the bank's best chance to hold it. */
export const GOLDEN_HOUR_MINUTES = 60

/* ---------------- the five steps ---------------- */

export type StepKey = 'report' | 'bank' | 'evidence' | 'pack' | 'track'

/** In order. Keys are stored in goldenHour.checklist. */
export const STEP_KEYS: StepKey[] = ['report', 'bank', 'evidence', 'pack', 'track']

/** Steps that have their own screen. */
export const STEP_LINKS: Partial<Record<StepKey, string>> = {
  evidence: paths.evidence,
  pack: paths.pack,
  track: paths.status,
}

/** Which of the five steps each section screen is (for "Step 3 of 5"). */
export const SECTION_STEP = { evidence: 3, pack: 4, status: 5 } as const

export function countDone(checklist: Record<string, boolean>): number {
  return STEP_KEYS.filter((k) => checklist[k]).length
}

/* ---------------- evidence ---------------- */

/** "Things to keep" ticks on the evidence screen. Not part of the five-step count. */
export const KEEP_KEYS = ['keep.screenshots', 'keep.sms', 'keep.documents'] as const

export const EVIDENCE_FIELDS: (keyof Evidence)[] = [
  'amount',
  'transactionId',
  'paidAt',
  'paidTo',
  'bankName',
  'scammerNumber',
  'notes',
]

export function countEvidence(evidence: Evidence): number {
  return EVIDENCE_FIELDS.filter((k) => evidence[k].trim() !== '').length
}

/* ---------------- what happens next ---------------- */

export const STATUS_STEPS: StatusStep[] = ['reported', 'bankAsked', 'onHold', 'policeOrder', 'refund']

export type StepState = 'done' | 'current' | 'upcoming'

export function statusState(step: StatusStep, current: StatusStep): StepState {
  const i = STATUS_STEPS.indexOf(step)
  const c = STATUS_STEPS.indexOf(current)
  if (i < c) return 'done'
  if (i === c) return 'current'
  return 'upcoming'
}

/* ---------------- words ---------------- */

/** "Time since you started: 12 min." — minute granularity, never seconds. */
export function elapsedText(t: T, minutes: number): string {
  if (minutes < 1) return t('goldenHour.timer.justNow')
  if (minutes < 60) return t('goldenHour.timer.minutes', { minutes })
  return t('goldenHour.timer.hours', { hours: Math.floor(minutes / 60), minutes: minutes % 60 })
}

/**
 * The amount the way people say it aloud: "2 lakh rupees", "1 crore 20 lakh rupees".
 * Exact, never rounded, so it can be used to double-check the digits.
 */
export function amountInWords(t: T, amount: number): string {
  const whole = Math.max(0, Math.floor(amount))
  const crore = Math.floor(whole / 10_000_000)
  const lakh = Math.floor((whole % 10_000_000) / 100_000)
  const thousand = Math.floor((whole % 100_000) / 1000)
  const rest = whole % 1000
  const parts: string[] = []
  if (crore) parts.push(t('goldenHour.words.crore', { n: crore }))
  if (lakh) parts.push(t('goldenHour.words.lakh', { n: lakh }))
  if (thousand) parts.push(t('goldenHour.words.thousand', { n: thousand }))
  if (rest || parts.length === 0) parts.push(String(rest))
  return t('goldenHour.words.rupees', { words: parts.join(' ') })
}

/* ---------------- dates ---------------- */

const pad = (n: number) => String(n).padStart(2, '0')

/** ms → "2026-10-10T10:42", the value a datetime-local input expects (local time). */
export function toLocalInputValue(ms: number): string {
  const d = new Date(ms)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** "2026-10-10T10:42" → ms (local time), or null when it is not a full date and time. */
export function parseLocalInput(value: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value.trim())
  if (!m) return null
  const [, y, mo, d, h, mi] = m.map(Number)
  const ms = new Date(y, mo - 1, d, h, mi).getTime()
  return Number.isNaN(ms) ? null : ms
}

export function sameDay(a: number, b: number): boolean {
  const x = new Date(a)
  const y = new Date(b)
  return x.getFullYear() === y.getFullYear() && x.getMonth() === y.getMonth() && x.getDate() === y.getDate()
}

/* ---------------- incident ---------------- */

/** A transfer that actually left the account (no pause, or family approved it). */
export function moneyLeft(transfer: TransferRequest | null): transfer is TransferRequest {
  return !!transfer && (transfer.status === 'sent' || transfer.status === 'approved')
}
