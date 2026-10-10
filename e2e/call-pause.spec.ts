import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/**
 * Hero flow, "during" part: practice call → RUKO → calm card (call keeps running) → Tell Rahul.
 * Runs on a 360px phone viewport (see playwright.config.ts).
 */

type Prefs = Record<string, unknown>

/** Seed the persisted store once per tab: demo profile (Kamla + Rahul), no incident yet. */
async function seed(page: Page, opts: { prefs?: Prefs; sharing?: Record<string, boolean> } = {}) {
  await page.addInitScript((o) => {
    if (sessionStorage.getItem('seeded')) return
    const state = {
      prefs: {
        lang: 'en',
        textScale: 1,
        contrast: 'standard',
        easyRead: false,
        readAloud: false,
        motion: 'reduce',
        designNotes: false,
        ...o.prefs,
      },
      setup: { elderName: 'Kamla Devi', completed: true, codeWord: 'Gulmohar', drillCompletedAt: null },
      people: [{ id: 'person_rahul', name: 'Rahul', relation: 'Son', phone: '+91 98765 43210' }],
      rules: [
        { id: 'rule_default', enabled: true, payee: 'new', minAmount: 10000, waitMinutes: 60, askPersonId: 'person_rahul' },
      ],
      sharing: { alertsDuringCall: true, transferPauses: true, ...o.sharing },
      incident: {
        id: null,
        startedAt: null,
        callActive: false,
        callStartedAt: null,
        callerLabel: '',
        pauseOpenedAt: null,
        answers: {},
        alertSentAt: null,
        alertPersonId: null,
        familySeenAt: null,
        familyDecision: null,
        familyDecidedAt: null,
        transfer: null,
      },
    }
    localStorage.setItem('ruko:v1', JSON.stringify({ state, version: 1 }))
    sessionStorage.setItem('seeded', '1')
  }, opts)
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

async function expectNoHorizontalScroll(page: Page) {
  // A string expression keeps this file free of DOM typings (it runs in the page).
  const overflow = await page.evaluate<number>('document.documentElement.scrollWidth - window.innerWidth')
  expect(overflow).toBeLessThanOrEqual(1)
}

const callBar = (page: Page) => page.getByRole('complementary', { name: /call still running/i })

test.describe('practice call → calm card → tell my person', () => {
  test('hero flow keeps the call running and tells Rahul', async ({ page }) => {
    await seed(page)
    await page.goto('/call')

    // Ringing: clearly a demo, big labelled choices.
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.getByText('Demo call', { exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { level: 2, name: 'Officer Vikram Singh' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Decline' })).toBeVisible()
    await expectNoAxeViolations(page)
    await expectNoHorizontalScroll(page)

    // Connected: timer + first subtitle; RUKO is at thumb reach.
    await page.getByRole('button', { name: 'Accept' }).click()
    const tile = page.getByRole('region', { name: 'Officer Vikram Singh' })
    await expect(tile.getByText(/your aadhaar is linked to a money-laundering case/i)).toBeVisible()
    await expect(tile.getByText(/^00:0\d$/)).toBeVisible()
    const ruko = page.getByRole('button', { name: /ruko — pause safely/i })
    await expect(ruko).toBeInViewport()
    await expectNoAxeViolations(page)

    // Transcript for people who cannot follow moving captions.
    await page.getByRole('button', { name: /show full transcript/i }).click()
    await expect(page.getByRole('region', { name: /what the caller has said/i })).toBeVisible()

    // RUKO → calm card, without hanging up.
    await ruko.click()
    await expect(page).toHaveURL(/\/pause$/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('You are safe. Take a breath.')
    await expect(page.getByText(/real police never arrest anyone on a video call/i)).toBeVisible()
    await expect(callBar(page)).toBeVisible()
    await expect(callBar(page)).toContainText(/cbi mumbai \(demo\)/i)
    await expect(callBar(page)).toContainText(/the caller cannot see ruko/i)
    await expectNoAxeViolations(page)
    await expectNoHorizontalScroll(page)

    // Tell Rahul: transparent preview, in-button progress words, announced success.
    await page.getByRole('link', { name: 'Tell Rahul' }).click()
    await expect(page).toHaveURL(/\/tell$/)
    await expect(page.getByRole('region', { name: /what rahul will see/i })).toContainText('Kamla Devi pressed Ruko')
    await page.getByRole('button', { name: 'Tell Rahul' }).click()
    await expect(page.getByRole('button', { name: 'Telling Rahul…' })).toBeVisible()
    const success = page.getByRole('status').filter({ hasText: 'Rahul has been told and will call you soon.' })
    await expect(success).toBeVisible()
    await expect(success).toContainText('You do not need to say anything to the caller.')
    await expect(page.getByRole('link', { name: 'Call Rahul' })).toHaveAttribute('href', 'tel:+919876543210')
    await expectNoAxeViolations(page)

    // The call is still running: return to it, then end the demo.
    await callBar(page).getByRole('link', { name: /return to call/i }).click()
    await expect(page).toHaveURL(/\/call$/)
    await expect(page.getByRole('button', { name: /ruko — pause safely/i })).toBeVisible()
    await page.getByRole('button', { name: /end demo/i }).click()
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByText(/you can always hang up on someone who scares you/i)).toBeVisible()
    await expect(callBar(page)).toHaveCount(0)
  })

  test('declining the ringing call goes home with reassurance', async ({ page }) => {
    await seed(page)
    await page.goto('/call')
    await page.getByRole('button', { name: 'Decline' }).click()
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByText(/you can always hang up on someone who scares you/i)).toBeVisible()
  })

  test('the call bar can end the call from any screen', async ({ page }) => {
    await seed(page)
    await page.goto('/call')
    await page.getByRole('button', { name: 'Accept' }).click()
    await page.getByRole('button', { name: /ruko — pause safely/i }).click()
    await expect(callBar(page)).toBeVisible()
    await callBar(page).getByRole('button', { name: /end call/i }).click()
    await expect(callBar(page)).toHaveCount(0)
    await expect(page.getByRole('heading', { level: 1 })).toBeFocused()
  })

  test('alerts switched off: no message is sent, a call is offered instead', async ({ page }) => {
    await seed(page, { sharing: { alertsDuringCall: false } })
    await page.goto('/tell')
    await expect(page.getByText(/you chose to keep alerts off during calls/i)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Tell Rahul' })).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Call Rahul' })).toHaveAttribute('href', 'tel:+919876543210')
    await expect(page.getByRole('link', { name: /change alert settings/i })).toHaveAttribute('href', '/setup/sharing')
    await expectNoAxeViolations(page)
  })
})

test.describe('adapted: Hindi, high contrast, 200% text', () => {
  const prefs = { lang: 'hi', contrast: 'high', textScale: 2 }

  for (const route of ['/call', '/pause', '/tell']) {
    test(`${route} reflows with no axe violations`, async ({ page }) => {
      await seed(page, { prefs })
      await page.goto(route)
      await expect(page.locator('h1')).toHaveCount(1)
      await expect(page.locator('html')).toHaveAttribute('lang', 'hi')
      await expectNoAxeViolations(page)
      await expectNoHorizontalScroll(page)
    })
  }

  test('connected call stays usable at 200% text', async ({ page }) => {
    await seed(page, { prefs })
    await page.goto('/call')
    await page.getByRole('button', { name: 'उठाएँ' }).click()
    await expect(page.getByRole('button', { name: /रुको — एक पल रुकिए/ })).toBeVisible()
    await expectNoAxeViolations(page)
    await expectNoHorizontalScroll(page)
  })
})
