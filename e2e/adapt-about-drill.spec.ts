import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/**
 * Adapt to me (/adapt), Accessibility label (/accessibility), How Ruko was designed (/about)
 * and the rehearsal drill (/drill), on a 360px phone.
 */

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

async function expectNoAxe(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze()
  const summary = results.violations.map(
    (v) =>
      `${v.id}: ${v.help} → ${v.nodes
        .map((n) => n.target.join(' '))
        .slice(0, 3)
        .join(' | ')}`,
  )
  expect(summary).toEqual([])
}

/** The page never scrolls sideways (string form: e2e files are type-checked without DOM types). */
async function expectNoSidewaysScroll(page: Page) {
  const overflow = (await page.evaluate('document.documentElement.scrollWidth - window.innerWidth')) as number
  expect(overflow).toBeLessThanOrEqual(1)
}

/** Seed the persisted store once per test (demo family; optional prefs). */
async function seed(page: Page, prefs: Record<string, unknown> = {}, withFamily = true) {
  await page.addInitScript(
    ({ p, family }) => {
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
          ...p,
        },
        setup: family
          ? { elderName: 'Kamla Devi', completed: true, codeWord: 'Gulmohar', drillCompletedAt: null }
          : { elderName: '', completed: false, codeWord: '', drillCompletedAt: null },
        people: family ? [{ id: 'person_rahul', name: 'Rahul', relation: 'Son', phone: '+91 98765 43210' }] : [],
        rules: [],
        sharing: { alertsDuringCall: true, transferPauses: true },
      }
      localStorage.setItem('ruko:v1', JSON.stringify({ state, version: 1 }))
      sessionStorage.setItem('seeded', '1')
    },
    { p: prefs, family: withFamily },
  )
}

test.describe('/adapt — Adapt to me', () => {
  test('text size, contrast and language apply to the whole app instantly', async ({ page }) => {
    await seed(page)
    await page.goto('/adapt')
    await expect(page.locator('h1')).toHaveText('Adapt to me')
    await expectNoAxe(page)

    const html = page.locator('html')
    await page.getByRole('button', { name: 'Bigger' }).click()
    await expect(html).toHaveAttribute('style', /--text-scale:\s*1\.15/)
    await expect(page.locator('output')).toContainText('115%')

    // Named sizes: no dragging needed. At 200% nothing scrolls sideways.
    await page.getByText('200%', { exact: true }).click()
    await expect(html).toHaveAttribute('style', /--text-scale:\s*2/)
    await expectNoSidewaysScroll(page)

    await page.getByRole('switch', { name: 'High contrast' }).click()
    await expect(html).toHaveAttribute('data-contrast', 'high')
    await expectNoAxe(page)

    await page.getByText('हिंदी', { exact: true }).click()
    await expect(html).toHaveAttribute('lang', 'hi')
    await expect(page.locator('h1')).toHaveText('मेरे हिसाब से बदलें')

    // Reset keeps the language and offers Undo.
    await page.getByRole('button', { name: 'फ़ोन की सेटिंग पर वापस जाएँ' }).click()
    await expect(html).toHaveAttribute('data-contrast', 'standard')
    await expect(html).toHaveAttribute('lang', 'hi')
    await page.getByRole('button', { name: 'वापस लें' }).click()
    await expect(html).toHaveAttribute('data-contrast', 'high')
  })

  test('suggests matching the phone when it asks for less movement or more contrast', async ({ page }) => {
    await seed(page, { motion: 'system' })
    await page.emulateMedia({ reducedMotion: 'reduce', contrast: 'more' })
    await page.goto('/adapt')

    await expect(page.getByText('Your phone asks for stronger contrast')).toBeVisible()
    await page.getByRole('button', { name: 'Turn on high contrast' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-contrast', 'high')
    await expect(page.getByRole('switch', { name: 'High contrast' })).toBeFocused()

    await expect(page.getByText('Your phone asks for less movement', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Always move less' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduce')
    await expectNoAxe(page)
  })

  test('design notes switch shows the yellow notes', async ({ page }) => {
    await seed(page)
    await page.goto('/adapt')
    await page.getByRole('switch', { name: 'Show design notes (for judges)' }).click()
    await expect(page.getByRole('complementary', { name: /you choose\. ruko never guesses/i })).toBeVisible()
  })
})

test.describe('/accessibility — Accessibility label', () => {
  test('lists features and measures live contrast in both modes', async ({ page }) => {
    await seed(page)
    await page.goto('/accessibility')
    await expect(page.locator('h1')).toHaveText('Accessibility label')
    await expect(page.getByRole('list', { name: 'Supported features' }).getByRole('listitem')).toHaveCount(13)

    const table = page.getByRole('table', { name: 'Colour pairs in standard mode' })
    await expect(table.getByRole('row')).toHaveCount(12) // header + 11 pairs
    await expect(page.getByText('11 of 11 pairs meet WCAG AA.')).toBeVisible()
    // In a real browser the numbers come from the computed tokens, not the fallback copy.
    await expect(page.getByText(/measured live from the colours on this screen/i)).toBeVisible()
    await expectNoAxe(page)

    await page.getByRole('switch', { name: 'High contrast' }).click()
    const high = page.getByRole('table', { name: 'Colour pairs in high contrast mode' })
    await expect(high.getByRole('row', { name: /body text/i })).toContainText('21.0 : 1')
    await expectNoAxe(page)

    await page.getByRole('link', { name: 'Adapt Ruko to me' }).click()
    await expect(page).toHaveURL(/\/adapt$/)
  })

  test('the contrast table never makes the page scroll sideways at 200% text', async ({ page }) => {
    await seed(page, { textScale: 2 })
    await page.goto('/accessibility')
    await expect(page.getByRole('table', { name: /colour pairs/i })).toBeVisible()
    await expectNoSidewaysScroll(page)
    await expectNoAxe(page)
  })
})

test.describe('/about — How Ruko was designed', () => {
  test('the 60-second tour loads the demo family and turns on design notes everywhere', async ({ page }) => {
    await seed(page, {}, false)
    await page.goto('/about')
    await expect(page.locator('h1')).toHaveText('How Ruko was designed')
    await expect(page.getByText('₹1,935 crore')).toBeVisible()
    await expect(page.getByRole('table', { name: 'The six judging areas, mapped to Ruko' })).toBeVisible()
    await expectNoAxe(page)

    await page.getByRole('button', { name: 'Start the 60-second tour' }).click()
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByText(/yellow design notes now appear on every screen/i)).toBeVisible()
    await expect(page.getByRole('complementary', { name: /^Design note:/ }).first()).toBeVisible()
  })

  test('reads well at 200% text in English without sideways scrolling', async ({ page }) => {
    await seed(page, { textScale: 2 })
    await page.goto('/about')
    await expectNoSidewaysScroll(page)
    await expectNoAxe(page)
  })
})

test.describe('/drill — Practise the pause', () => {
  test('five forgiving steps, then a demo call', async ({ page }) => {
    await seed(page)
    await page.goto('/drill')
    await expect(page.locator('h1')).toHaveText('Practise the pause')
    await expect(page.getByText('Step 1 of 5')).toBeVisible()
    await expectNoAxe(page)

    await page.getByRole('button', { name: 'I can picture it' }).click()
    await expect(page).toHaveURL(/\?step=2$/)
    await expectNoAxe(page)

    await page.getByRole('button', { name: /ruko.*press me/i }).click()
    await expect(page.getByText('Well done! You found it.')).toBeVisible()
    await page.getByRole('button', { name: 'Show my code word' }).click()
    await expect(page.getByText('Gulmohar')).toBeVisible()
    await expectNoAxe(page)
    await page.getByRole('button', { name: 'I said it' }).click()

    await expect(page.getByRole('link', { name: 'Call Rahul' })).toHaveAttribute('href', 'tel:+919876543210')
    await expectNoAxe(page)

    // The phone's Back button goes back one step, never out of the drill.
    await page.goBack()
    await expect(page.getByRole('heading', { level: 2, name: 'Say your family code word out loud' })).toBeVisible()
    await page.goForward()

    await page.getByRole('button', { name: 'I know who to tell' }).click()
    await expect(page.getByRole('heading', { level: 2, name: 'You practised the pause!' })).toBeVisible()
    await expectNoAxe(page)
    await expectNoSidewaysScroll(page)

    await page.getByRole('button', { name: 'Practise with a demo call' }).click()
    await expect(page).toHaveURL(/\/call$/)
  })

  test('works by keyboard alone', async ({ page }) => {
    await seed(page)
    await page.goto('/drill')
    await page.getByRole('button', { name: 'I can picture it' }).focus()
    await page.keyboard.press('Enter')
    await page.getByRole('button', { name: /ruko.*press me/i }).focus()
    await page.keyboard.press('Space')
    await expect(page.getByRole('heading', { level: 2, name: 'Say your family code word out loud' })).toBeVisible()
  })

  test('step 5 at 200% text, Hindi and high contrast stays inside the screen', async ({ page }) => {
    await seed(page, { lang: 'hi', contrast: 'high', textScale: 2 })
    await page.goto('/drill?step=5')
    await expect(page.getByRole('heading', { level: 2, name: 'आपने रुकने का अभ्यास कर लिया!' })).toBeVisible()
    await expectNoSidewaysScroll(page)
    await expectNoAxe(page)
  })
})
