import { createBrowserRouter, type RouteObject } from 'react-router'
import { App } from './App'
import { NotFoundPage } from './NotFoundPage'
import { routes as home } from '../features/home/routes'
import { routes as setup } from '../features/setup/routes'
import { routes as call } from '../features/call/routes'
import { routes as pause } from '../features/pause/routes'
import { routes as check } from '../features/check/routes'
import { routes as transfer } from '../features/transfer/routes'
import { routes as family } from '../features/family/routes'
import { routes as demo } from '../features/demo/routes'
import { routes as goldenHour } from '../features/golden-hour/routes'
import { routes as adapt } from '../features/adapt/routes'
import { routes as accessibility } from '../features/accessibility/routes'
import { routes as about } from '../features/about/routes'
import { routes as drill } from '../features/drill/routes'

export const appRoutes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      ...home,
      ...setup,
      ...call,
      ...pause,
      ...check,
      ...transfer,
      ...family,
      ...demo,
      ...goldenHour,
      ...adapt,
      ...accessibility,
      ...about,
      ...drill,
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]

export function createAppRouter() {
  return createBrowserRouter(appRoutes)
}
