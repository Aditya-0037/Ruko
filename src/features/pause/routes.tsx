import type { RouteObject } from 'react-router'
import { PausePage } from './PausePage'
import { TellPage } from './TellPage'

export const routes: RouteObject[] = [
  { path: 'pause', element: <PausePage /> },
  { path: 'tell', element: <TellPage /> },
]
