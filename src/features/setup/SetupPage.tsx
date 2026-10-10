import type { ComponentType } from 'react'
import { Navigate, useParams } from 'react-router'
import { CodeWordStep } from './steps/CodeWordStep'
import { DoneStep } from './steps/DoneStep'
import { LanguageStep } from './steps/LanguageStep'
import { NameStep } from './steps/NameStep'
import { PersonStep } from './steps/PersonStep'
import { RulesStep } from './steps/RulesStep'
import { SharingStep } from './steps/SharingStep'
import { isSetupStep, stepPath, type SetupStep } from './steps'

const STEP_COMPONENTS: Record<SetupStep, ComponentType> = {
  language: LanguageStep,
  name: NameStep,
  person: PersonStep,
  rules: RulesStep,
  'code-word': CodeWordStep,
  sharing: SharingStep,
  done: DoneStep,
}

/** /setup/:step — one question per page. Unknown steps go back to the first question. */
export function SetupPage() {
  const { step } = useParams()
  if (!isSetupStep(step)) return <Navigate to={stepPath('language')} replace />
  const Step = STEP_COMPONENTS[step]
  // Keyed by step so each page mounts fresh: focus moves to its heading and local state resets.
  return <Step key={step} />
}
