import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/** Home ("/") and the setup flow ("/setup/:step") on a 360px phone. Each test starts with empty storage. */

/** The e2e tsconfig has no DOM lib; this is the little we read inside page.evaluate. */
declare const document: {
  querySelectorAll(selector: string): Iterable<{
    tagName: string
    textContent: string | null
    getBoundingClientRect(): { right: number }
  }>
}

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

async function expectNoAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(WCAG).analyze()
  expect(results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([])
}

/** Nothing inside the main landmark may stick out past the 360px phone width. */
async function expectMainReflows(page: Page) {
  const overflowing = await page.evaluate(() =>
    [...document.querySelectorAll('main *')]
      .filter((el) => el.getBoundingClientRect().right > 362)
      .map((el) => `${el.tagName}: ${(el.textContent ?? '').slice(0, 40)}`),
  )
  expect(overflowing).toEqual([])
}

async function seed(page: Page, prefs: Record<string, unknown> = {}) {
  await page.goto('/')
  await page.evaluate((p) => {
    const person = { id: 'person_rahul', name: 'Rahul', relation: 'Son', phone: '+91 98765 43210' }
    localStorage.setItem(
      'ruko:v1',
      JSON.stringify({
        version: 1,
        state: {
          prefs: { lang: 'en', textScale: 1, contrast: 'standard', easyRead: false, readAloud: false, motion: 'reduce', designNotes: false, ...p },
          setup: { elderName: 'Kamla Devi', completed: true, codeWord: 'Gulmohar', drillCompletedAt: null },
          people: [person],
          rules: [{ id: 'rule_default', enabled: true, payee: 'new', minAmount: 10000, waitMinutes: 60, askPersonId: person.id }],
          sharing: { alertsDuringCall: true, transferPauses: true },
        },
      }),
    )
  }, prefs)
}

test.describe('home: before setup', () => {
  test('puts language first and can switch the whole screen to Hindi', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.getByRole('heading', { level: 1, name: 'Welcome to Ruko' })).toBeAttached()
    await expect(page.getByText('If someone on a call says you are under arrest, press Ruko.')).toBeVisible()
    await expectNoAxeViolations(page)
    await expectMainReflows(page)

    await page.getByText('हिंदी', { exact: true }).click()
    await expect(page.locator('html')).toHaveAttribute('lang', 'hi')
    await expect(page.getByRole('link', { name: 'परिवार के साथ सेट करें (5 मिनट)' })).toBeVisible()
    await expectNoAxeViolations(page)
  })

  test('"Try the demo" loads Kamla and Rahul and shows Home organised by time', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Try the demo' }).click()
    await expect(page.getByText('Demo loaded: Kamla Devi and her son Rahul')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1, name: 'Namaste, Kamla Devi' })).toBeVisible()
    await expect(page.getByRole('heading', { level: 1, name: 'Namaste, Kamla Devi' })).toBeFocused()

    await expect(page.getByRole('region', { name: /^Before\W+Your safety plan$/ })).toBeVisible()
    await expect(page.getByRole('region', { name: /^During\W+On a call right now\?$/ })).toBeVisible()
    await expect(page.getByRole('region', { name: /^After\W+Money already sent\?$/ })).toBeVisible()
    await expectNoAxeViolations(page)
    await expectMainReflows(page)
  })
})

test.describe('home: set up', () => {
  test('pressing RUKO opens the calm pause screen', async ({ page }) => {
    await seed(page)
    await page.reload()
    await page.getByRole('button', { name: /Press if a call scares you/ }).click()
    await expect(page).toHaveURL(/\/pause$/)
  })

  test('the demo scam call is labelled Demo and opens the simulated call', async ({ page }) => {
    await seed(page)
    await page.reload()
    await expect(page.getByText('A pretend “officer” calls you. Nothing real happens.')).toBeVisible()
    await page.getByRole('button', { name: 'Try a demo scam call' }).click()
    await expect(page).toHaveURL(/\/call$/)
  })

  test('the code word stays hidden until asked for', async ({ page }) => {
    await seed(page)
    await page.reload()
    const before = page.getByRole('region', { name: /^Before\W+Your safety plan$/ })
    await expect(before.getByText('Gulmohar')).toHaveCount(0)
    await before.getByRole('button', { name: 'Show code word' }).click()
    await expect(before.getByText('Gulmohar')).toBeVisible()
  })

  test('editing one answer from Home comes straight back to Home', async ({ page }) => {
    await seed(page)
    await page.reload()
    await page.getByRole('link', { name: 'Edit Calm-moment rule' }).click()
    await expect(page).toHaveURL(/\/setup\/rules\?from=home$/)
    await expect(page.getByText('Changing your plan')).toBeVisible()
    await page.getByText('₹25,000', { exact: true }).click()
    await page.getByRole('button', { name: 'Save and go back' }).click()
    await expect(page).toHaveURL(/\/$/)
    await expect(
      page.getByText('Sending more than ₹25,000 to someone new? Ruko waits 1 hour and asks Rahul first.'),
    ).toBeVisible()
  })

  test('passes axe in high contrast mode (colour contrast included)', async ({ page }) => {
    await seed(page, { contrast: 'high' })
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-contrast', 'high')
    await expectNoAxeViolations(page)
  })

  test('reflows at 200% text in Hindi with high contrast', async ({ page }) => {
    await seed(page, { lang: 'hi', contrast: 'high', textScale: 2 })
    for (const route of ['/', '/setup/person', '/setup/rules', '/setup/sharing', '/setup/done']) {
      await page.goto(route)
      await expect(page.locator('h1')).toHaveCount(1)
      await expectMainReflows(page)
    }
  })
})

test.describe('setup flow', () => {
  test('unknown steps go to the first question', async ({ page }) => {
    await page.goto('/setup/whatever')
    await expect(page).toHaveURL(/\/setup\/language$/)
    await expect(page.getByText('Step 1 of 7')).toBeVisible()
  })

  test('walks all seven steps with clear, fixable errors and autosave', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Set up with my family (5 minutes)' }).click()

    // 1 · language
    await expect(page).toHaveURL(/\/setup\/language$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Choose your language' })).toBeVisible()
    await expectNoAxeViolations(page)
    await page.getByRole('button', { name: 'Continue' }).click()

    // 2 · name — Continue is never disabled; the error says how to fix it and takes focus
    await expect(page).toHaveURL(/\/setup\/name$/)
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page.getByText('Enter the name you like to be called, like Kamla.')).toBeVisible()
    const name = page.getByRole('textbox', { name: 'Your name' })
    await expect(name).toBeFocused()
    await name.fill('Kamla Devi')
    await expect(page.getByText('Namaste, Kamla Devi')).toBeVisible()
    await expectNoAxeViolations(page)
    await page.getByRole('button', { name: 'Continue' }).click()

    // 3 · person — accepts +91, spaces and dashes
    await expect(page).toHaveURL(/\/setup\/person$/)
    await page.getByRole('textbox', { name: 'Their name' }).fill('Rahul')
    await page.getByText('Son', { exact: true }).click()
    const phone = page.getByRole('textbox', { name: 'Mobile number' })
    await phone.fill('98765 4321')
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page.getByText('This number has 9 digits. A mobile number has 10, like 98765 43210.')).toBeVisible()
    await expect(phone).toBeFocused()
    await phone.fill('+91 98765-43210')
    await expectNoAxeViolations(page)
    await expectMainReflows(page)
    await page.getByRole('button', { name: 'Continue' }).click()

    // 4 · rules — live sentence
    await expect(page).toHaveURL(/\/setup\/rules$/)
    await expect(
      page.getByText('If I send more than ₹10,000 to someone new, Ruko will wait 1 hour and ask Rahul.'),
    ).toBeVisible()
    await page.getByText('4 hours', { exact: true }).click()
    await expect(
      page.getByText('If I send more than ₹10,000 to someone new, Ruko will wait 4 hours and ask Rahul.'),
    ).toBeVisible()
    await expectNoAxeViolations(page)
    await page.getByRole('button', { name: 'Continue' }).click()

    // 5 · code word — optional
    await expect(page).toHaveURL(/\/setup\/code-word$/)
    await page.getByRole('button', { name: 'Suggest one' }).click()
    await expect(page.getByLabel('Family code word')).not.toHaveValue('')
    await expectNoAxeViolations(page)
    await page.getByRole('button', { name: 'Continue' }).click()

    // 6 · sharing — one tap to withdraw consent
    await expect(page).toHaveURL(/\/setup\/sharing$/)
    await expect(page.getByRole('heading', { level: 1, name: 'What can Rahul see?' })).toBeVisible()
    const pauses = page.getByRole('switch', { name: 'Paused payments' })
    await pauses.click()
    await expect(pauses).toHaveAttribute('aria-checked', 'false')
    await pauses.click()
    await expectNoAxeViolations(page)
    await page.getByRole('button', { name: 'Continue' }).click()

    // 7 · done
    await expect(page).toHaveURL(/\/setup\/done$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Your safety plan is ready' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Practise once with Rahul (2 min)' })).toHaveAttribute('href', '/drill')
    await expectNoAxeViolations(page)
    await expectMainReflows(page)

    // Back to Home, now set up — and it survives a reload (everything autosaved locally).
    await page.getByRole('link', { name: 'Go to home' }).click()
    await expect(page.getByRole('heading', { level: 1, name: 'Namaste, Kamla Devi' })).toBeVisible()
    await page.reload()
    await expect(page.getByRole('heading', { level: 1, name: 'Namaste, Kamla Devi' })).toBeVisible()
    await expect(
      page.getByText('Sending more than ₹10,000 to someone new? Ruko waits 4 hours and asks Rahul first.'),
    ).toBeVisible()
  })

  test('removing a person can be undone from the toast', async ({ page }) => {
    await seed(page)
    await page.goto('/setup/person')
    await page.getByRole('button', { name: 'Remove Rahul' }).click()
    await expect(page.getByText('Rahul removed')).toBeVisible()
    await page.getByRole('button', { name: 'Undo' }).click()
    await expect(page.getByRole('heading', { level: 2, name: 'Rahul' })).toBeVisible()
  })
})
