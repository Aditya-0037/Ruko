import type { RouteObject } from 'react-router'
import { TransferPage } from './TransferPage'

export const routes: RouteObject[] = [
  { path: 'transfer', element: <TransferPage /> },
  { path: 'transfer/paused', element: <TransferPage /> },
]
