import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/**
 * Golden hour: money already sent → call 1930 → five steps → evidence → complaint pack → status.
 * Runs on a 360px phone viewport (see playwright.config.ts).
 */

type Prefs = Record<string, unknown>

const ROUTES = ['/golden-hour', '/golden-hour/evidence', '/golden-hour/pack', '/golden-hour/status']

/** Seed the persisted store once per tab: demo profile (Kamla + Rahul), a scam call in progress. */
async function seed(page: Page, prefs: Prefs = {}) {
  await page.addInitScript((p) => {
    if (sessionStorage.getItem('seeded')) return
    const now = Date.now()
    const state = {
      prefs: {
        lang: 'en',
        textScale: 1,
        contrast: 'standard',
        easyRead: false,
        readAloud: false,
        motion: 'reduce',
        designNotes: false,
        ...p,
      },
      setup: { elderName: 'Kamla Devi', completed: true, codeWord: 'Gulmohar', drillCompletedAt: null },
      people: [{ id: 'person_rahul', name: 'Rahul', relation: 'Son', phone: '+91 98765 43210' }],
      rules: [
        { id: 'rule_default', enabled: true, payee: 'new', minAmount: 10000, waitMinutes: 60, askPersonId: 'person_rahul' },
      ],
      sharing: { alertsDuringCall: true, transferPauses: true },
      incident: {
        id: 'incident_e2e',
        startedAt: now - 30 * 60_000,
        callActive: false,
        callStartedAt: now - 30 * 60_000,
        callerLabel: 'CBI Mumbai',
        pauseOpenedAt: now - 20 * 60_000,
        answers: {},
        alertSentAt: now - 19 * 60_000,
        alertPersonId: 'person_rahul',
        familySeenAt: null,
        familyDecision: null,
        familyDecidedAt: null,
        transfer: null,
      },
    }
    localStorage.setItem('ruko:v1', JSON.stringify({ state, version: 1 }))
    sessionStorage.setItem('seeded', '1')
  }, prefs)
}

async function expectNoAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze()
  const summary = results.violations.map(
    (v) => `${v.id}: ${v.help} → ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`,
  )
  expect(summary).toEqual([])
}

/**
 * Nothing in this feature's content (the main area and the sticky footer) pokes past a 360px
 * screen, even at 200% text. Passed as a string so it runs in the page, not in Node.
 */
async function expectContentFitsWidth(page: Page) {
  const overflow = await page.evaluate<number>(`(() => {
    const els = Array.from(document.querySelectorAll('main *, main ~ div *'))
    const right = Math.max(0, ...els.map((el) => el.getBoundingClientRect().right))
    return right - window.innerWidth
  })()`)
  expect(overflow).toBeLessThanOrEqual(1)
}

test('main screen: one big call to 1930, a calm clock and five steps', async ({ page }) => {
  await seed(page)
  await page.goto('/golden-hour')

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Money already sent? Act now.')
  const call = page.getByRole('link', { name: 'Call 1930 now' })
  await expect(call).toHaveAttribute('href', 'tel:1930')
  await expect(call).toBeInViewport()
  const box = await call.boundingBox()
  expect(box!.height).toBeGreaterThanOrEqual(56)

  const online = page.getByRole('link', { name: /report online at cybercrime\.gov\.in \(opens in a new tab\)/i })
  await expect(online).toHaveAttribute('target', '_blank')
  await expect(online).toHaveAttribute('rel', /noopener/)

  await expect(page.getByText(/^Time since you started: /)).toBeVisible()
  await expect(page.getByText('You are not to blame.')).toBeVisible()

  const steps = page.getByRole('region', { name: 'Your five steps' })
  await expect(steps.getByText('0 of 5 done')).toBeVisible()
  await steps.getByRole('checkbox', { name: 'Call 1930 or report online' }).check()
  await expect(steps.getByText('1 of 5 done')).toBeVisible()

  // Ticks are kept after a reload.
  await page.reload()
  await expect(page.getByRole('checkbox', { name: 'Call 1930 or report online' })).toBeChecked()

  await expectNoAxeViolations(page)
})

test('evidence → complaint pack → status, end to end', async ({ page }) => {
  await seed(page)
  await page.goto('/golden-hour')
  await page.getByRole('link', { name: 'Write down what you know' }).click()

  await expect(page).toHaveURL(/\/golden-hour\/evidence$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Collect evidence')
  await expect(page.getByText('Ruko never asks for your OTP, PIN or passwords')).toBeVisible()
  await page.getByLabel('Amount paid (in ₹)').fill('200000')
  await expect(page.getByText('That is ₹2,00,000 — 2 lakh rupees.')).toBeVisible()
  await page.getByLabel('Transaction ID').fill('412345678901')
  await page.getByLabel('The caller’s phone number').fill('+91 90000 11111')
  await expect(page.getByRole('status').filter({ hasText: /^Saved at / })).toBeVisible()
  await expectNoAxeViolations(page)

  await page.getByRole('button', { name: 'Done — make my complaint pack' }).click()
  await expect(page).toHaveURL(/\/golden-hour\/pack$/)
  const doc = page.getByRole('article', { name: 'Cyber fraud complaint — details' })
  await expect(doc.getByText('₹2,00,000', { exact: true })).toBeVisible()
  await expect(doc.getByText('412345678901', { exact: true })).toBeVisible()
  await expect(doc.getByText('Not known yet').first()).toBeVisible()
  await expect(doc.getByText('Alert sent to Rahul')).toBeVisible()
  await expectNoAxeViolations(page)

  // Print shows only the pack.
  await page.emulateMedia({ media: 'print' })
  await expect(doc).toBeVisible()
  await expect(page.getByRole('heading', { level: 1 })).toBeHidden()
  await expect(page.getByRole('button', { name: 'Print or save as PDF' })).toBeHidden()
  await page.emulateMedia({ media: 'screen' })

  await page.getByRole('link', { name: 'Next: what happens after you report' }).click()
  await expect(page).toHaveURL(/\/golden-hour\/status$/)
  await page.getByLabel('Complaint number (acknowledgement number)').fill('31410240012345')
  await page.getByText('Money on hold', { exact: true }).click()
  await expect(page.getByRole('radio', { name: 'Money on hold You are here' })).toBeChecked()
  await expect(page.getByText('Not all money comes back.')).toBeVisible()
  await expectNoAxeViolations(page)

  await page.getByRole('link', { name: 'Back to my five steps' }).click()
  const steps = page.getByRole('region', { name: 'Your five steps' })
  await expect(steps.getByText('Now: Money on hold')).toBeVisible()
  await expect(steps.getByRole('checkbox', { name: 'Collect evidence' })).toBeChecked()
})

test('an unknown section goes back to the golden hour screen', async ({ page }) => {
  await seed(page)
  await page.goto('/golden-hour/something-else')
  await expect(page).toHaveURL(/\/golden-hour$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Money already sent? Act now.')
})

const MODES: { name: string; prefs: Prefs }[] = [
  { name: 'Hindi', prefs: { lang: 'hi' } },
  { name: 'high contrast, 200% text', prefs: { contrast: 'high', textScale: 2 } },
  { name: 'Hindi, Easy Read, 200% text', prefs: { lang: 'hi', easyRead: true, textScale: 2 } },
  { name: 'design notes on', prefs: { designNotes: true } },
]

for (const mode of MODES) {
  test.describe(`golden hour — ${mode.name}`, () => {
    for (const route of ROUTES) {
      test(route, async ({ page }) => {
        await seed(page, mode.prefs)
        await page.goto(route)
        await expect(page.locator('h1')).toHaveCount(1)
        await expectNoAxeViolations(page)
        await expectContentFitsWidth(page)
      })
    }
  })
}
