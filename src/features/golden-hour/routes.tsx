import { Navigate, type RouteObject } from 'react-router'
import { EvidencePage } from './EvidencePage'
import { GoldenHourPage } from './GoldenHourPage'
import { paths } from './model'
import { PackPage } from './PackPage'
import { StatusPage } from './StatusPage'

export const routes: RouteObject[] = [
  { path: 'golden-hour', element: <GoldenHourPage /> },
  // Static segments rank above the dynamic one, so only unknown sections reach the redirect.
  { path: 'golden-hour/evidence', element: <EvidencePage /> },
  { path: 'golden-hour/pack', element: <PackPage /> },
  { path: 'golden-hour/status', element: <StatusPage /> },
  { path: 'golden-hour/:section', element: <Navigate to={paths.main} replace /> },
]
