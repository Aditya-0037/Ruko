import { formatINR } from '../../lib/format'
import type { CalmRule, Lang, SharingState, TrustedPerson } from '../../state/types'

type T = (key: string, vars?: Record<string, string | number>) => string

export const AMOUNT_OPTIONS = [5000, 10000, 25000, 50000] as const
export const WAIT_OPTIONS = [15, 60, 240] as const
export const RECOMMENDED_AMOUNT = 10000
export const RECOMMENDED_WAIT = 60

export const DEFAULT_RULE: Omit<CalmRule, 'id' | 'askPersonId'> = {
  enabled: true,
  payee: 'new',
  minAmount: RECOMMENDED_AMOUNT,
  waitMinutes: RECOMMENDED_WAIT,
}

/** Relations are stored in English (stable for other screens) and shown in the chosen language. */
export const RELATIONS = ['Son', 'Daughter', 'Spouse', 'Friend', 'Neighbour', 'Other'] as const
export type Relation = (typeof RELATIONS)[number]

export function relationLabel(t: T, relation: string): string {
  const known = RELATIONS.find((r) => r === relation)
  return known ? t(`setup.person.relation.${known.toLowerCase()}`) : relation
}

/** "15 minutes" / "1 hour" — for option labels. */
export function waitLabel(t: T, minutes: number): string {
  return (WAIT_OPTIONS as readonly number[]).includes(minutes)
    ? t(`setup.rules.wait.${minutes}`)
    : t('setup.rules.waitFor.minutes', { count: minutes })
}

/** "1 hour" / "1 घंटे तक" — inside a sentence (Hindi needs the oblique form). */
export function waitPhrase(t: T, minutes: number): string {
  return (WAIT_OPTIONS as readonly number[]).includes(minutes)
    ? t(`setup.rules.waitFor.${minutes}`)
    : t('setup.rules.waitFor.minutes', { count: minutes })
}

export function askPersonFor(rule: Pick<CalmRule, 'askPersonId'>, people: TrustedPerson[]): TrustedPerson | null {
  return people.find((p) => p.id === rule.askPersonId) ?? people[0] ?? null
}

const personName = (p: TrustedPerson | null) => p?.name.trim() || ''

/** First person, said by the elder: "If I send more than ₹10,000 to someone new, Ruko will wait 1 hour and ask Rahul." */
export function rulePreview(t: T, lang: Lang, rule: Omit<CalmRule, 'id'>, people: TrustedPerson[]): string {
  const name = personName(askPersonFor(rule, people)) || t('setup.rules.myPerson')
  return t(rule.payee === 'any' ? 'setup.rules.preview.any' : 'setup.rules.preview.new', {
    amount: formatINR(rule.minAmount, lang),
    wait: waitPhrase(t, rule.waitMinutes),
    name,
  })
}

/** Second person, for the plan summary: "Sending more than ₹10,000 to someone new? Ruko waits 1 hour and asks Rahul first." */
export function ruleSummary(t: T, lang: Lang, rule: Omit<CalmRule, 'id'>, people: TrustedPerson[]): string {
  const name = personName(askPersonFor(rule, people)) || t('setup.rules.yourPerson')
  return t(rule.payee === 'any' ? 'setup.plan.rule.any' : 'setup.plan.rule.new', {
    amount: formatINR(rule.minAmount, lang),
    wait: waitPhrase(t, rule.waitMinutes),
    name,
  })
}

/** What family can see, in words. */
export function sharingSummary(t: T, sharing: SharingState): string {
  if (sharing.alertsDuringCall && sharing.transferPauses) return t('setup.plan.sharing.both')
  if (sharing.alertsDuringCall) return t('setup.plan.sharing.alerts')
  if (sharing.transferPauses) return t('setup.plan.sharing.pauses')
  return t('setup.plan.sharing.none')
}

/** The first trusted person's name, or a warm fallback ("your trusted person"). */
export function firstPersonName(t: T, people: TrustedPerson[], fallbackKey = 'setup.rules.yourPerson'): string {
  return people.find((p) => p.name.trim())?.name.trim() ?? t(fallbackKey)
}
