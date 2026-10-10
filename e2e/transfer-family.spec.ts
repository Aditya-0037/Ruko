import { expect, test, type BrowserContext, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/**
 * Transfer pause (Kamla's phone), the family view (Rahul's phone), and the two-phone demo stage.
 * Phone viewport (360px) unless a test says otherwise. Both phones share one origin, so the store
 * syncs between pages through the browser's storage event — no server.
 */

const SCAM_PAYEE = 'RBI Safe Account – Verification'
const KAMLA_FRAME = 'iframe[title="Kamla’s phone: Ruko as Kamla sees it"]'
const RAHUL_FRAME = 'iframe[title="Rahul’s phone: Ruko family view"]'

interface SeedOptions {
  prefs?: Record<string, unknown>
  sharing?: Record<string, boolean>
  /** Start with ₹2,00,000 to a new person already paused by the rule. */
  pausedTransfer?: boolean
  /** Leave Ruko un-set-up (the demo stage loads the profile itself). */
  empty?: boolean
}

/** Seed the persisted store once per browser context, before any page script runs. */
async function seed(context: BrowserContext, opts: SeedOptions = {}) {
  await context.addInitScript((o: SeedOptions) => {
    if (localStorage.getItem('ruko:e2e-seeded')) return
    localStorage.setItem('ruko:e2e-seeded', '1')
    if (o.empty) return
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
        ...o.prefs,
      },
      setup: { elderName: 'Kamla Devi', completed: true, codeWord: 'Gulmohar', drillCompletedAt: null },
      people: [{ id: 'person_rahul', name: 'Rahul', relation: 'Son', phone: '+91 98765 43210' }],
      rules: [
        { id: 'rule_default', enabled: true, payee: 'new', minAmount: 10000, waitMinutes: 60, askPersonId: 'person_rahul' },
      ],
      sharing: { alertsDuringCall: true, transferPauses: true, ...o.sharing },
      incident: {
        id: o.pausedTransfer ? 'incident_e2e' : null,
        startedAt: o.pausedTransfer ? now : null,
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
        transfer: o.pausedTransfer
          ? {
              amount: 200000,
              payeeName: 'RBI Safe Account – Verification',
              payeeIsNew: true,
              requestedAt: now,
              status: 'paused',
              ruleId: 'rule_default',
              unlockAt: now + 60 * 60_000,
              askPersonId: 'person_rahul',
            }
          : null,
      },
    }
    localStorage.setItem('ruko:v1', JSON.stringify({ state, version: 1 }))
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

const lockCard = (page: Page) => page.getByRole('region', { name: 'The protective wait' })

test.describe('transfer pause — Kamla’s phone', () => {
  test('the simulated bank app pauses ₹2,00,000 to a new person; cancel keeps it safe', async ({ page, context }) => {
    await seed(context)
    await page.goto('/transfer')

    await expect(page.locator('h1')).toHaveCount(1)
    const app = page.getByRole('region', { name: 'Simulated bank app' })
    await expect(app.getByText(SCAM_PAYEE)).toBeVisible()
    await expect(app.getByText('New payee')).toBeVisible()
    await expect(app.getByLabel('Amount in rupees (₹)')).toHaveValue('2,00,000')
    await expect(page.getByText('Ruko works alongside your bank app.')).toBeVisible()
    await expectNoHorizontalScroll(page)
    await expectNoAxeViolations(page)

    await app.getByRole('button', { name: 'Send money' }).click()
    await expect(page).toHaveURL(/\/transfer\/paused$/)
    await expect(
      page.getByRole('heading', { level: 1, name: 'You are sending ₹2,00,000 to a new person.' }),
    ).toBeVisible()
    await expect(
      page.getByText('When I send more than ₹10,000 to someone new, wait 1 hour and ask Rahul first.'),
    ).toBeVisible()
    await expect(lockCard(page).getByRole('timer')).toHaveText(/^(1:00:00|59:\d\d)$/)
    await expect(lockCard(page).getByText('Waiting for Rahul to see this…')).toBeVisible()
    await expect(page.getByRole('button', { name: /anyway/ })).toHaveCount(0)
    await expectNoHorizontalScroll(page)
    await expectNoAxeViolations(page)

    await page.getByRole('button', { name: 'Cancel transfer — keep my money safe' }).click()
    const done = page.getByRole('heading', { level: 1, name: 'Transfer cancelled. Your ₹2,00,000 is safe.' })
    await expect(done).toBeVisible()
    await expect(done).toBeFocused()
    await expect(page.getByRole('link', { name: 'Call 1930' })).toHaveAttribute('href', 'tel:1930')
    await expectNoAxeViolations(page)
  })

  test('a small payment goes straight through: friction only where money can be lost', async ({ page, context }) => {
    await seed(context)
    await page.goto('/transfer')
    await page.getByRole('button', { name: 'Try ₹500' }).click()
    await page.getByRole('button', { name: 'Send money' }).click()
    await expect(page.getByRole('heading', { level: 3, name: '₹500 sent' })).toBeFocused()
    await expect(page.getByText('Ruko stayed out of the way')).toBeVisible()
    await expect(page).toHaveURL(/\/transfer$/)
    await expectNoAxeViolations(page)
  })

  test('send anyway appears only after the wait, then the golden hour is one tap away', async ({ page, context }) => {
    await seed(context, { pausedTransfer: true })
    await page.goto('/transfer/paused')
    await expect(page.getByRole('button', { name: /anyway/ })).toHaveCount(0)

    await page.getByRole('button', { name: 'Demo control: end the wait now' }).click()
    await expect(lockCard(page).getByText('The wait is over.', { exact: true })).toBeFocused()
    await page.getByRole('button', { name: 'Send ₹2,00,000 anyway' }).click()

    await expect(page.getByRole('heading', { level: 1, name: '₹2,00,000 sent' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Get help now (golden hour)' })).toHaveAttribute('href', '/golden-hour')
    await expectNoAxeViolations(page)
  })

  test('reflows at 200% text in high contrast and Hindi, with no horizontal scroll', async ({ page, context }) => {
    await seed(context, { pausedTransfer: true, prefs: { textScale: 2, contrast: 'high', lang: 'hi' } })
    await page.goto('/transfer/paused')
    await expect(
      page.getByRole('heading', { level: 1, name: 'आप एक नए व्यक्ति को ₹2,00,000 भेज रहे हैं।' }),
    ).toBeVisible()
    await expect(page.getByRole('button', { name: 'पेमेंट रद्द करें — मेरे पैसे बचाएँ' })).toBeVisible()
    await expectNoHorizontalScroll(page)
    await expectNoAxeViolations(page)

    await page.goto('/transfer')
    await expectNoHorizontalScroll(page)
    await expectNoAxeViolations(page)
  })
})

test.describe('family loop — two phones in one browser', () => {
  test('Rahul sees the pause, blocks it, and Kamla’s screen updates live', async ({ context }) => {
    await seed(context)
    const kamla = await context.newPage()
    const rahul = await context.newPage()

    await rahul.goto('/family')
    await expect(rahul.getByRole('heading', { level: 1, name: 'Rahul’s phone' })).toBeVisible()
    await expect(rahul.getByRole('heading', { level: 2, name: 'All quiet.' })).toBeVisible()
    await expectNoAxeViolations(rahul)

    await kamla.goto('/transfer')
    await kamla.getByRole('button', { name: 'Send money' }).click()
    await expect(
      kamla.getByRole('heading', { level: 1, name: 'You are sending ₹2,00,000 to a new person.' }),
    ).toBeVisible()

    // Rahul's phone, already open, gets the paused transfer without a reload.
    const card = rahul.getByRole('article', { name: /Maa is trying to send ₹2,00,000 to a new person/ })
    await expect(card).toBeVisible()
    await expect(card.getByText('Ruko paused it for 1 hour', { exact: false })).toBeVisible()
    await expectNoHorizontalScroll(rahul)
    await expectNoAxeViolations(rahul)

    // …and Kamla's phone learns that he has seen it.
    await expect(lockCard(kamla).getByText('Rahul has seen this.')).toBeVisible()

    await card.getByRole('button', { name: 'Block this transfer' }).click()
    await expect(
      rahul.getByRole('heading', { level: 2, name: 'You blocked this transfer. Maa’s ₹2,00,000 is safe.' }),
    ).toBeFocused()
    await expect(
      kamla.getByRole('heading', { level: 1, name: 'Transfer cancelled. Your ₹2,00,000 is safe.' }),
    ).toBeVisible()
    await expect(kamla.getByText('Rahul blocked it from their phone.')).toBeVisible()
    await expectNoAxeViolations(kamla)
  })

  test('approve unlocks sending on Kamla’s phone, and Undo puts the pause back', async ({ context }) => {
    await seed(context, { pausedTransfer: true })
    const kamla = await context.newPage()
    const rahul = await context.newPage()
    await kamla.goto('/transfer/paused')
    await rahul.goto('/family')

    await rahul.getByRole('button', { name: 'Approve sending ₹2,00,000' }).click()
    await expect(lockCard(kamla).getByText('Unlocked by Rahul.')).toBeVisible()
    await expect(kamla.getByRole('button', { name: 'Send ₹2,00,000 anyway' })).toBeVisible()

    await rahul.getByRole('button', { name: 'Undo', exact: true }).click()
    await expect(rahul.getByRole('button', { name: 'Block this transfer' })).toBeVisible()
    await expect(kamla.getByRole('button', { name: 'Send ₹2,00,000 anyway' })).toHaveCount(0)
    await expect(lockCard(kamla).getByRole('timer')).toBeVisible()
  })

  test('dignity first: no payment details when Kamla chose not to share them', async ({ page, context }) => {
    await seed(context, { pausedTransfer: true, sharing: { transferPauses: false } })
    await page.goto('/family')
    await expect(page.getByRole('heading', { level: 2, name: 'All quiet.' })).toBeVisible()
    await expect(page.getByText(/is trying to send/)).toHaveCount(0)
    await expect(
      page.getByText('Maa chose not to share payment details, so you will not see payments here.'),
    ).toBeVisible()
    await expectNoAxeViolations(page)
  })
})

test.describe('demo stage — two phones, one loop', () => {
  test.use({ viewport: { width: 1280, height: 900 } })

  test('runs the whole loop across two live phone frames', async ({ page, context }) => {
    await seed(context, { empty: true })
    await page.goto('/demo')
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.getByText(/start here: load the demo profile/i)).toBeVisible()

    const kamlaBox = await page.locator(KAMLA_FRAME).boundingBox()
    const rahulBox = await page.locator(RAHUL_FRAME).boundingBox()
    expect(kamlaBox && rahulBox && rahulBox.x >= kamlaBox.x + kamlaBox.width - 1).toBe(true)

    const kamla = page.frameLocator(KAMLA_FRAME)
    const rahul = page.frameLocator(RAHUL_FRAME)

    await page.getByRole('button', { name: 'Load demo profile' }).click()
    await expect(rahul.getByRole('heading', { level: 1, name: 'Rahul’s phone' })).toBeVisible()
    await expect(rahul.getByRole('heading', { level: 2, name: 'All quiet.' })).toBeVisible()

    await page.getByRole('button', { name: 'Open the bank app on Kamla’s phone' }).click()
    await kamla.getByRole('button', { name: 'Send money' }).click()
    await expect(
      kamla.getByRole('heading', { level: 1, name: 'You are sending ₹2,00,000 to a new person.' }),
    ).toBeVisible()
    await expect(page.getByRole('region', { name: 'What is happening now' }).getByText('₹2,00,000 paused')).toBeVisible()

    await rahul.getByRole('button', { name: 'Block this transfer' }).click()
    await expect(
      kamla.getByRole('heading', { level: 1, name: 'Transfer cancelled. Your ₹2,00,000 is safe.' }),
    ).toBeVisible()
    await expect(
      page.getByRole('region', { name: 'What is happening now' }).getByText('₹2,00,000 blocked by Rahul'),
    ).toBeVisible()
    await expectNoAxeViolations(page)
  })

  test('starts the scam call on Kamla’s phone, and Reset brings both phones back', async ({ page, context }) => {
    await seed(context)
    await page.goto('/demo')
    await page.getByRole('button', { name: 'Start the scam call on Kamla’s phone' }).click()
    await expect(page.locator(KAMLA_FRAME)).toHaveAttribute('src', '/call')
    await expect(page.frameLocator(KAMLA_FRAME).locator('h1')).toHaveCount(1)

    await page.getByRole('button', { name: 'Reset' }).click()
    await expect(page.locator(KAMLA_FRAME)).toHaveAttribute('src', '/')
    await expect(page.frameLocator(RAHUL_FRAME).getByRole('heading', { level: 2, name: 'All quiet.' })).toBeVisible()
  })
})

test.describe('demo stage on a phone', () => {
  test('stacks the two phones without horizontal scroll', async ({ page, context }) => {
    await seed(context)
    await page.goto('/demo')
    const kamlaBox = await page.locator(KAMLA_FRAME).boundingBox()
    const rahulBox = await page.locator(RAHUL_FRAME).boundingBox()
    expect(kamlaBox && rahulBox && rahulBox.y >= kamlaBox.y + kamlaBox.height - 1).toBe(true)
    await expectNoHorizontalScroll(page)
  })
})
