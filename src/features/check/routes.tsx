import { Navigate, type RouteObject } from 'react-router'
import { CheckPage } from './CheckPage'
import { FIRST_QUESTION_PATH } from './questions'
import { ResultPage } from './ResultPage'

export const routes: RouteObject[] = [
  { path: 'check', element: <Navigate to={FIRST_QUESTION_PATH} replace /> },
  // Static segment ranks above the dynamic one, so /check/result never reaches CheckPage.
  { path: 'check/result', element: <ResultPage /> },
  { path: 'check/:step', element: <CheckPage /> },
]
