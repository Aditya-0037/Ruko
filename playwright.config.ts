import { defineConfig, devices } from '@playwright/test'
import { existsSync } from 'node:fs'

// The cloud container ships a pre-installed Chromium; use it when present instead of downloading one.
const preinstalled = '/opt/pw-browsers/chromium'
const launchOptions = existsSync(preinstalled) ? { executablePath: preinstalled } : {}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
    ...devices['Pixel 7'],
    viewport: { width: 360, height: 780 },
    launchOptions,
  },
  projects: [{ name: 'phone', use: { browserName: 'chromium' } }],
  webServer: {
    command: 'npm run build && npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
    timeout: 180_000,
  },
})
