import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/**
 * Script check: three questions, one per page (Yes / No / Not sure), then a result that lists
 * exactly which answers matched. Runs on a 360px phone viewport (see playwright.config.ts).
 */

type Prefs = Record<string, unknown>
type Answers = Record<string, 'yes' | 'no' | 'unsure'>

const Q1 = 'Did they tell you to keep this secret, even from your family?'
const Q2 = 'Did they ask you to move money to a safe or verification account?'
const Q3 = 'Are they keeping you on a video call, or telling you not to hang up?'

/** Seed the persisted store once per tab: demo profile (Kamla + Rahul), optional answers. */
async function seed(page: Page, opts: { prefs?: Prefs; answers?: Answers; noPerson?: boolean } = {}) {
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
      people: o.noPerson ? [] : [{ id: 'person_rahul', name: 'Rahul', relation: 'Son', phone: '+91 98765 43210' }],
      rules: [
        { id: 'rule_default', enabled: true, payee: 'new', minAmount: 10000, waitMinutes: 60, askPersonId: 'person_rahul' },
      ],
      sharing: { alertsDuringCall: true, transferPauses: true },
      incident: {
        id: null,
        startedAt: null,
        callActive: false,
        callStartedAt: null,
        callerLabel: '',
        pauseOpenedAt: null,
        answers: o.answers ?? {},
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

/** A radio by its answer. "No" must be exact: "Not sure — It is okay not to know." also contains "no". */
const radio = (page: Page, label: string) =>
  page.getByRole('radio', { name: label, exact: label !== 'Not sure' && label !== 'पक्का नहीं पता' })

/** Tap an answer the way a person does: on its visible label. */
async function choose(page: Page, question: string, label: string) {
  await page.getByRole('group', { name: question }).getByText(label, { exact: true }).click()
  await expect(radio(page, label)).toBeChecked()
}

/** The verdict's reasons: the list that follows the "why" heading. */
const reasons = (page: Page, why = 'Why Ruko says this') =>
  page.getByRole('heading', { level: 2, name: why }).locator('..').getByRole('listitem')

test.describe('script check', () => {
  test('three questions → a scam result that names exactly which answers matched', async ({ page }) => {
    await seed(page)
    await page.goto('/check/1')

    // Question 1: the question is the page title and the name of the answer group.
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(Q1)
    await expect(page.getByText('Step 1 of 3')).toBeVisible()
    await expect(page.getByRole('group', { name: Q1 })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/pause')
    await expectNoAxeViolations(page)
    await expectNoHorizontalScroll(page)

    // Continue is never disabled: with no answer, a message appears and takes focus.
    const continueButton = page.getByRole('button', { name: 'Continue' })
    await expect(continueButton).toBeEnabled()
    await continueButton.click()
    const error = page.locator('p', { hasText: 'Please choose one answer. If you do not know, choose Not sure.' })
    await expect(error).toBeVisible()
    await expect(error).toBeFocused()
    await expect(page).toHaveURL(/\/check\/1$/)
    await expectNoAxeViolations(page)

    await choose(page, Q1, 'Yes')
    await expect(error).toHaveCount(0)
    await continueButton.click()

    // Question 2.
    await expect(page).toHaveURL(/\/check\/2$/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(Q2)
    await expect(page.getByRole('heading', { level: 1 })).toBeFocused()
    await expect(page.getByText('Step 2 of 3')).toBeVisible()
    await choose(page, Q2, 'Not sure')
    await page.getByRole('button', { name: 'Continue' }).click()

    // Question 3: the last button says where it goes.
    await expect(page).toHaveURL(/\/check\/3$/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(Q3)
    await choose(page, Q3, 'Yes')
    await page.getByRole('button', { name: 'See the result' }).click()

    // Result: plain headline, the two matched reasons (not the "not sure" one), then next steps.
    await expect(page).toHaveURL(/\/check\/result$/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('This matches a digital-arrest scam.')
    await expect(page.getByRole('heading', { level: 2, name: 'Why Ruko says this' })).toBeVisible()
    await expect(reasons(page)).toHaveCount(2)
    await expect(reasons(page).nth(0)).toContainText('They asked you to keep it secret.')
    await expect(reasons(page).nth(0)).toContainText('Real police never ask you to hide an investigation from your family.')
    await expect(reasons(page).nth(1)).toContainText('They are keeping you on a video call.')
    await expect(page.getByText('It is safe to hang up now.')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Tell Rahul' })).toHaveAttribute('href', '/tell')
    await expect(page.getByRole('link', { name: 'Call 1930' })).toHaveAttribute('href', 'tel:1930')
    await expect(page.getByRole('heading', { level: 2, name: 'What real officers do' })).toBeVisible()
    await expectNoAxeViolations(page)
    await expectNoHorizontalScroll(page)

    // Change my answers: back to question 1 with the answers still there.
    await page.getByRole('link', { name: 'Change my answers' }).click()
    await expect(page).toHaveURL(/\/check\/1$/)
    await expect(radio(page, 'Yes')).toBeChecked()
  })

  test('all "No" → no warning signs, with a reminder and a way home', async ({ page }) => {
    await seed(page)
    await page.goto('/check/1')
    for (const q of [Q1, Q2, Q3]) {
      await choose(page, q, 'No')
      await page.getByRole('button', { name: q === Q3 ? 'See the result' : 'Continue' }).click()
    }
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('No warning signs from your answers.')
    await expect(page.getByText('Never share an OTP or PIN. An OTP is the code that comes in an SMS.')).toBeVisible()
    await expect(page.getByText('It is safe to hang up now.')).toHaveCount(0)
    await expectNoAxeViolations(page)
    await page.getByRole('link', { name: 'Back to home' }).click()
    await expect(page).toHaveURL(/\/$/)
  })

  test('"Not sure" → treat it as a scam until Rahul checks', async ({ page }) => {
    await seed(page, { answers: { secrecy: 'no', moneyMove: 'unsure', videoHold: 'no' } })
    await page.goto('/check/result')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Treat this call as a scam until Rahul checks.')
    await expect(page.getByText('You were not sure if they asked you to move money.')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Tell Rahul' })).toBeVisible()
    await expectNoAxeViolations(page)
  })

  test('without a trusted person the next step still makes sense', async ({ page }) => {
    await seed(page, { noPerson: true, answers: { secrecy: 'unsure', moneyMove: 'no', videoHold: 'no' } })
    await page.goto('/check/result')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Treat this call as a scam until someone you trust checks.',
    )
    await expect(page.getByRole('link', { name: 'Tell someone you trust' })).toHaveAttribute('href', '/tell')
  })

  test('back goes to the previous question, then to the calm card', async ({ page }) => {
    await seed(page, { answers: { secrecy: 'yes' } })
    await page.goto('/check/2')
    await page.getByRole('link', { name: 'Back' }).click()
    await expect(page).toHaveURL(/\/check\/1$/)
    await expect(radio(page, 'Yes')).toBeChecked()
    await page.getByRole('link', { name: 'Back' }).click()
    await expect(page).toHaveURL(/\/pause$/)
  })

  test('arrow keys change the answer', async ({ page }) => {
    await seed(page)
    await page.goto('/check/1')
    await choose(page, Q1, 'Yes')
    await radio(page, 'Yes').focus()
    await page.keyboard.press('ArrowDown')
    await expect(radio(page, 'No')).toBeChecked()
    await expect(radio(page, 'No')).toBeFocused()
  })

  test('an unknown step goes to question 1', async ({ page }) => {
    await seed(page)
    await page.goto('/check/9')
    await expect(page).toHaveURL(/\/check\/1$/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(Q1)
  })

  test('design notes explain the rules-based result', async ({ page }) => {
    await seed(page, { prefs: { designNotes: true }, answers: { secrecy: 'yes', moneyMove: 'no', videoHold: 'no' } })
    await page.goto('/check/result')
    await expect(page.getByRole('complementary', { name: /rules you can explain, not an ai verdict/i })).toBeVisible()
    await expectNoAxeViolations(page)
  })
})

test.describe('script check adapted: Hindi, high contrast, 200% text', () => {
  const prefs = { lang: 'hi', contrast: 'high', textScale: 2 }
  const answers: Answers = { secrecy: 'yes', moneyMove: 'unsure', videoHold: 'yes' }

  for (const route of ['/check/1', '/check/2', '/check/3', '/check/result']) {
    test(`${route} reflows with no axe violations`, async ({ page }) => {
      await seed(page, { prefs, answers })
      await page.goto(route)
      await expect(page.locator('h1')).toHaveCount(1)
      await expect(page.locator('html')).toHaveAttribute('lang', 'hi')
      await expectNoAxeViolations(page)
      await expectNoHorizontalScroll(page)
    })
  }

  test('the error message works in Hindi at 200% text', async ({ page }) => {
    await seed(page, { prefs })
    await page.goto('/check/1')
    await page.getByRole('button', { name: 'आगे बढ़ें' }).click()
    const error = page.locator('p', { hasText: 'कृपया एक जवाब चुनिए।' })
    await expect(error).toBeFocused()
    await expectNoAxeViolations(page)
    await expectNoHorizontalScroll(page)
  })

  for (const contrast of ['standard', 'high']) {
    for (const answersFor of [
      { name: 'scam', a: { secrecy: 'yes', moneyMove: 'yes', videoHold: 'yes' } as Answers },
      { name: 'clear', a: { secrecy: 'no', moneyMove: 'no', videoHold: 'no' } as Answers },
    ]) {
      test(`result (${answersFor.name}) at 200% text, ${contrast} contrast, English`, async ({ page }) => {
        await seed(page, { prefs: { textScale: 2, contrast, designNotes: true }, answers: answersFor.a })
        await page.goto('/check/result')
        await expect(page.locator('h1')).toHaveCount(1)
        await expectNoAxeViolations(page)
        await expectNoHorizontalScroll(page)
      })
    }
  }
})
