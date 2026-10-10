import type { CheckAnswer, SignalId } from '../state/types'

/**
 * The three questions of the script check. Each maps to a well-documented "digital arrest"
 * tactic. Rules, not an AI verdict: the result lists exactly which answers triggered it.
 * Copy for each question/reason lives in features/check/strings.ts under
 * `check.q.<id>`, `check.q.<id>.help` and `check.reason.<id>`.
 */
export const SIGNALS: { id: SignalId; order: number }[] = [
  { id: 'secrecy', order: 1 }, // told to keep it secret, even from family
  { id: 'moneyMove', order: 2 }, // asked to move money to a "safe" / "verification" account
  { id: 'videoHold', order: 3 }, // kept on a video call / told not to hang up
]

export type AssessmentLevel = 'scam' | 'unsure' | 'clear'

export interface Assessment {
  level: AssessmentLevel
  /** Signals answered "yes". */
  matched: SignalId[]
  /** Signals answered "not sure". */
  unsure: SignalId[]
  /** Questions not answered yet. */
  missing: SignalId[]
}

/**
 * Any "yes" → scam pattern. No "yes" but any "not sure" (or unanswered) → treat as unsure
 * and ask the trusted person. Only three clear "no" answers → no warning signs found.
 */
export function assessAnswers(answers: Partial<Record<SignalId, CheckAnswer>>): Assessment {
  const matched: SignalId[] = []
  const unsure: SignalId[] = []
  const missing: SignalId[] = []
  for (const { id } of SIGNALS) {
    const a = answers[id]
    if (a === 'yes') matched.push(id)
    else if (a === 'unsure') unsure.push(id)
    else if (a === undefined) missing.push(id)
  }
  const level: AssessmentLevel = matched.length > 0 ? 'scam' : unsure.length > 0 || missing.length > 0 ? 'unsure' : 'clear'
  return { level, matched, unsure, missing }
}
