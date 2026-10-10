import type { RouteObject } from 'react-router'
import { GoldenHourPage } from './GoldenHourPage'

export const routes: RouteObject[] = [
  { path: 'golden-hour', element: <GoldenHourPage /> },
  { path: 'golden-hour/:section', element: <GoldenHourPage /> },
]
