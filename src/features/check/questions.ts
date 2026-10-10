import { SIGNALS } from '../../lib/scamSignals'
import type { CheckAnswer, SignalId } from '../../state/types'

/** Questions in the order they are asked (one per page). */
export const QUESTIONS: SignalId[] = [...SIGNALS].sort((a, b) => a.order - b.order).map((s) => s.id)

export const TOTAL_QUESTIONS = QUESTIONS.length

export const FIRST_QUESTION_PATH = '/check/1'
export const RESULT_PATH = '/check/result'

/** "2" → 2. Anything else ("0", "4", "abc", "1.5") → null, so the route can redirect to question 1. */
export function parseStep(param: string | undefined): number | null {
  if (!param || !/^[1-9]\d*$/.test(param)) return null
  const n = Number(param)
  return n <= TOTAL_QUESTIONS ? n : null
}

export function signalAt(step: number): SignalId {
  return QUESTIONS[step - 1]
}

export function stepOf(id: SignalId): number {
  return QUESTIONS.indexOf(id) + 1
}

export function questionPath(step: number): string {
  return `/check/${step}`
}

/** Continue: the next question, or the result after the last one. */
export function nextPath(step: number): string {
  return step < TOTAL_QUESTIONS ? questionPath(step + 1) : RESULT_PATH
}

/** Back: the previous question, or the calm card from question 1. */
export function backPath(step: number): string {
  return step > 1 ? questionPath(step - 1) : '/pause'
}

/** Copy key for how an answer is shown in "Your answers". */
export function answerLabelKey(answer: CheckAnswer | undefined): string {
  switch (answer) {
    case 'yes':
      return 'common.yes'
    case 'no':
      return 'common.no'
    case 'unsure':
      return 'common.notSure'
    default:
      return 'check.answer.notAnswered'
  }
}
