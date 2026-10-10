// Renders the Ruko mark into PWA PNG icons using the local Chromium (run: node scripts/generate-icons.mjs).
import { chromium } from '@playwright/test'
import { existsSync, readFileSync } from 'node:fs'

const svg = readFileSync('public/favicon.svg', 'utf8')
const executablePath = existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined
const browser = await chromium.launch({ executablePath })
const page = await browser.newPage()

async function render(size, file, { maskable = false } = {}) {
  await page.setViewportSize({ width: size, height: size })
  const pad = maskable ? size * 0.2 : size * 0.08
  await page.setContent(`<html><body style="margin:0;background:${maskable ? '#FFFBF5' : 'transparent'};display:grid;place-items:center;width:${size}px;height:${size}px">
    <div style="width:${size - pad * 2}px;height:${size - pad * 2}px">${svg.replace('<svg ', '<svg width="100%" height="100%" ')}</div></body></html>`)
  await page.screenshot({ path: file, omitBackground: !maskable })
  console.log('wrote', file)
}

await render(192, 'public/icons/icon-192.png')
await render(512, 'public/icons/icon-512.png')
await render(512, 'public/icons/icon-maskable-512.png', { maskable: true })
await browser.close()
