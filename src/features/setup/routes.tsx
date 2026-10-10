import { Navigate, type RouteObject } from 'react-router'
import { SetupPage } from './SetupPage'

export const routes: RouteObject[] = [
  { path: 'setup', element: <Navigate to="/setup/language" replace /> },
  { path: 'setup/:step', element: <SetupPage /> },
]
