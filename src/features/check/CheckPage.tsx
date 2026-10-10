import { Navigate, useParams } from 'react-router'
import { FIRST_QUESTION_PATH, parseStep } from './questions'
import { QuestionPage } from './QuestionPage'

/**
 * /check/:step — one question per page. An unknown step goes to question 1.
 * `key` remounts the page per question, so focus moves to the new heading and errors reset.
 */
export function CheckPage() {
  const { step } = useParams()
  const n = parseStep(step)
  if (n === null) return <Navigate to={FIRST_QUESTION_PATH} replace />
  return <QuestionPage key={n} step={n} />
}
