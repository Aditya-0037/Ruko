import { formatINR } from '../../lib/format'
import { useStore } from '../../state/store'
import type { CalmRule, IncidentState, Lang, SharingState, TransferRequest, TrustedPerson } from '../../state/types'

export type T = (key: string, vars?: Record<string, string | number>) => string

/* ---------------- the practice scenario ---------------- */

/** What a "digital arrest" caller typically pushes for: a big sum to a "safe" or "verification" account. */
export const SCAM_PAYEE = { name: 'RBI Safe Account – Verification', digits: '4821', initials: 'RS' } as const
/** Someone she pays every month, for trying a saved payee. */
export const SAVED_PAYEE = { name: 'Gupta Medical Store', digits: '0937', initials: 'GM' } as const
export const SCAM_AMOUNT = 200_000
export const SMALL_AMOUNT = 500
/** Up to ₹99,99,99,999 — enough for any real transfer, short enough to read. */
export const MAX_AMOUNT_DIGITS = 10

/* ---------------- words ---------------- */

/** "1 hour" · "15 minutes" · "4 hours" — for use inside a sentence as the object of "wait". */
export function waitText(t: T, minutes: number): string {
  if (minutes >= 60 && minutes % 60 === 0) {
    const hours = minutes / 60
    return hours === 1 ? t('transfer.wait.hour') : t('transfer.wait.hours', { count: hours })
  }
  return t('transfer.wait.minutes', { count: minutes })
}

/** "for 1 hour" · "1 घंटे के लिए" (Hindi needs the oblique form). */
export function waitForText(t: T, minutes: number): string {
  if (minutes >= 60 && minutes % 60 === 0) {
    const hours = minutes / 60
    return hours === 1 ? t('transfer.waitFor.hour') : t('transfer.waitFor.hours', { count: hours })
  }
  return t('transfer.waitFor.minutes', { count: minutes })
}

/**
 * The amount the way people say it aloud: "2 lakh rupees", "2 lakh 34 thousand 567 rupees".
 * Exact, never rounded, so it can be used to double-check the digits.
 */
export function amountInWords(t: T, amount: number): string {
  const whole = Math.max(0, Math.floor(amount))
  const crore = Math.floor(whole / 10_000_000)
  const lakh = Math.floor((whole % 10_000_000) / 100_000)
  const thousand = Math.floor((whole % 100_000) / 1000)
  const rest = whole % 1000
  const parts: string[] = []
  if (crore) parts.push(t('transfer.words.crore', { n: crore }))
  if (lakh) parts.push(t('transfer.words.lakh', { n: lakh }))
  if (thousand) parts.push(t('transfer.words.thousand', { n: thousand }))
  if (rest || parts.length === 0) parts.push(String(rest))
  return t('transfer.words.rupees', { words: parts.join(' ') })
}

/** Key + values for the rule as a plain first-person sentence ("When I send more than ₹10,000…"). */
export function ruleCopy(
  t: T,
  lang: Lang,
  rule: CalmRule | null,
  person: TrustedPerson | null,
): { key: string; vars: Record<string, string> } {
  if (!rule) return { key: 'transfer.paused.ruleFallback', vars: {} }
  const base = rule.payee === 'any' ? 'transfer.paused.rule.any' : 'transfer.paused.rule.new'
  const name = person?.name.trim() ?? ''
  return {
    key: name ? base : `${base}.solo`,
    vars: { amount: formatINR(rule.minAmount, lang), wait: waitText(t, rule.waitMinutes), name },
  }
}

/** The rule the elder relies on most: the first enabled one, else none. */
export function primaryRule(rules: CalmRule[]): CalmRule | null {
  return rules.find((r) => r.enabled) ?? null
}

/* ---------------- the family loop ---------------- */

export type LoopStatus = 'blocked' | 'approved' | 'calling' | 'noPerson' | 'notShared' | 'seen' | 'waiting'

/**
 * Where the family loop stands for the current transfer, in priority order.
 * "Seen" counts only if the trusted person looked after this transfer was requested.
 */
export function loopStatus(incident: IncidentState, sharing: SharingState, hasPerson: boolean): LoopStatus {
  const tr = incident.transfer
  if (tr?.status === 'blocked') return 'blocked'
  if (tr?.status === 'approved') return 'approved'
  if (!hasPerson) return 'noPerson'
  if (incident.familyDecision === 'calling') return 'calling'
  if (!sharing.transferPauses) return 'notShared'
  if (tr && incident.familySeenAt !== null && incident.familySeenAt >= tr.requestedAt) return 'seen'
  return 'waiting'
}

/** Can the elder send now? Only after the wait she chose, or once her person approved. */
export function isUnlocked(tr: TransferRequest, now: number): boolean {
  if (tr.status === 'approved') return true
  return tr.status === 'paused' && tr.unlockAt !== null && tr.unlockAt <= now
}

/* ---------------- local store helpers ----------------
 * The shared store has no actions for these yet. They live here until the integrator promotes
 * them (see sharedChangeRequests). Each is a no-op unless the transfer is in the right state.
 */

/** Demo control: end the protective wait now (judges should not have to wait an hour). */
export function endWaitNow(now = Date.now()): void {
  useStore.setState((s) => {
    const tr = s.incident.transfer
    if (!tr || tr.status !== 'paused') return s
    return { incident: { ...s.incident, transfer: { ...tr, unlockAt: now } } }
  })
}

/** "Send anyway" — allowed only once unlocked. Her money, her choice. */
export function sendAfterWait(now = Date.now()): void {
  useStore.setState((s) => {
    const tr = s.incident.transfer
    if (!tr || !isUnlocked(tr, now)) return s
    return { incident: { ...s.incident, transfer: { ...tr, status: 'sent' as const } } }
  })
}

/** "+91 98765 43210" → "tel:+919876543210" (same format as the shared HelpSheet). */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^+0-9]/g, '')}`
}
