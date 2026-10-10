import type { RouteObject } from 'react-router'
import { PausedPage } from './PausedPage'
import { TransferPage } from './TransferPage'

export const routes: RouteObject[] = [
  { path: 'transfer', element: <TransferPage /> },
  { path: 'transfer/paused', element: <PausedPage /> },
]
