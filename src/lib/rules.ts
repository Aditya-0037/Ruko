import type { CalmRule, TrustedPerson } from '../state/types'

export interface TransferInput {
  amount: number
  payeeIsNew: boolean
}

export type TransferDecision =
  | { action: 'allow' }
  | { action: 'pause'; rule: CalmRule; waitMinutes: number; askPerson: TrustedPerson | null }

/** Does a single rule apply to this transfer? */
export function ruleMatches(rule: CalmRule, transfer: TransferInput): boolean {
  if (!rule.enabled) return false
  if (rule.payee === 'new' && !transfer.payeeIsNew) return false
  return transfer.amount > rule.minAmount
}

/**
 * Evaluate the elder's calm-moment rules against a transfer.
 * When several rules match, the most protective one wins (longest wait; ties → lowest threshold).
 */
export function evaluateTransfer(
  transfer: TransferInput,
  rules: CalmRule[],
  people: TrustedPerson[],
): TransferDecision {
  const matching = rules.filter((r) => ruleMatches(r, transfer))
  if (matching.length === 0) return { action: 'allow' }
  const strongest = [...matching].sort(
    (a, b) => b.waitMinutes - a.waitMinutes || a.minAmount - b.minAmount,
  )[0]
  const askPerson = people.find((p) => p.id === strongest.askPersonId) ?? people[0] ?? null
  return { action: 'pause', rule: strongest, waitMinutes: strongest.waitMinutes, askPerson }
}
