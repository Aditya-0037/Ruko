import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import '@fontsource-variable/noto-sans'
import '@fontsource-variable/noto-sans-devanagari'
import './design-system/tokens.css'
import './design-system/global.css'
import { createAppRouter } from './app/router'
import { startCrossTabSync } from './state/sync'

startCrossTabSync()

if (import.meta.env.PROD) {
  void import('virtual:pwa-register').then(({ registerSW }) => registerSW({ immediate: true }))
}

const router = createAppRouter()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
