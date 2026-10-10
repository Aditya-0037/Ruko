import type { CalmRule, SetupState, TrustedPerson } from '../../state/types'

/** The setup flow, in order. One question per page. */
export const SETUP_STEPS = ['language', 'name', 'person', 'rules', 'code-word', 'sharing', 'done'] as const
export type SetupStep = (typeof SETUP_STEPS)[number]

/** Steps the person may skip. Everything else needs an answer (with a clear error if missing). */
export const OPTIONAL_STEPS: readonly SetupStep[] = ['code-word']

export function isSetupStep(value: string | undefined): value is SetupStep {
  return !!value && (SETUP_STEPS as readonly string[]).includes(value)
}

export const stepPath = (step: SetupStep) => `/setup/${step}`

export function stepIndex(step: SetupStep): number {
  return SETUP_STEPS.indexOf(step)
}

export function nextStep(step: SetupStep): SetupStep | null {
  return SETUP_STEPS[stepIndex(step) + 1] ?? null
}

export function prevStep(step: SetupStep): SetupStep | null {
  const i = stepIndex(step)
  return i > 0 ? SETUP_STEPS[i - 1] : null
}

/** Where an edit started from. Editing one answer should not mean walking all seven steps again. */
export type EditOrigin = 'home' | 'done'

export function editPath(step: SetupStep, from: EditOrigin): string {
  return `${stepPath(step)}?from=${from}`
}

export function editReturnPath(from: string | null): string | null {
  if (from === 'home') return '/'
  if (from === 'done') return stepPath('done')
  return null
}

/** "Continue where you left off": the first step that still needs an answer. */
export function resumeStep(state: { setup: SetupState; people: TrustedPerson[]; rules: CalmRule[] }): SetupStep {
  if (!state.setup.elderName.trim()) return 'language'
  if (state.people.length === 0) return 'person'
  if (state.rules.length === 0) return 'rules'
  if (!state.setup.codeWord.trim()) return 'code-word'
  return 'sharing'
}
