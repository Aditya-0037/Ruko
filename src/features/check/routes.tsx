import { Navigate, type RouteObject } from 'react-router'
import { CheckPage } from './CheckPage'

export const routes: RouteObject[] = [
  { path: 'check', element: <Navigate to="/check/1" replace /> },
  { path: 'check/:step', element: <CheckPage /> },
]
