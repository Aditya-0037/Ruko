import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { defaultPrefs, useStore } from '../../state/store'
import { expectNoAxeViolations, renderRoute, withDemoProfile } from '../../test/utils'
import { nearestScaleIndex, parseScale, samePrefs, scalePercent } from './textScale'

const originalMatchMedia = window.matchMedia

/** Pretend the phone (OS) reports these media queries as true. */
function mockPhoneSettings(...queries: string[]) {
  window.matchMedia = ((query: string) => ({
    matches: queries.includes(query),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia
}

afterEach(() => {
  window.matchMedia = originalMatchMedia
  document.documentElement.removeAttribute('data-contrast')
  document.documentElement.style.removeProperty('--text-scale')
})

const prefs = () => useStore.getState().prefs

describe('/adapt — Adapt to me', () => {
  it('shows the live preview and every control, with no axe violations', async () => {
    withDemoProfile()
    renderRoute('/adapt')

    expect(screen.getByRole('heading', { level: 1, name: 'Adapt to me' })).toBeInTheDocument()
    const preview = screen.getByRole('figure')
    expect(within(preview).getByText('You are safe. Take a breath.')).toBeInTheDocument()
    expect(within(preview).getByText('No changes yet. Ruko is following your phone.')).toBeInTheDocument()

    expect(screen.getByRole('radio', { name: 'English' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'हिंदी' })).toHaveAttribute('value', 'hi')
    expect(screen.getByRole('button', { name: 'Smaller' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Bigger' })).toBeInTheDocument()
    for (const size of ['100%', '115%', '130%', '150%', '175%', '200%']) {
      expect(screen.getByRole('radio', { name: size })).toBeInTheDocument()
    }
    expect(screen.getByRole('switch', { name: 'High contrast' })).toHaveAttribute('aria-checked', 'false')
    expect(screen.getByRole('switch', { name: 'Easy Read' })).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: 'Read aloud' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Follow my phone' })).toBeChecked()
    expect(screen.getByRole('switch', { name: 'Show design notes (for judges)' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /see everything ruko does for accessibility/i })).toHaveAttribute(
      'href',
      '/accessibility',
    )

    await expectNoAxeViolations()
  })

  it('switches the whole app to Hindi instantly, with each language named in its own script', async () => {
    const user = userEvent.setup()
    renderRoute('/adapt')

    await user.click(screen.getByRole('radio', { name: 'हिंदी' }))

    expect(prefs().lang).toBe('hi')
    expect(screen.getByRole('heading', { level: 1, name: 'मेरे हिसाब से बदलें' })).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('hi')
    // Labels keep their own language so screen readers pronounce them correctly.
    expect(screen.getByText('English', { selector: 'span' })).toHaveAttribute('lang', 'en')
    expect(screen.getByText('Language')).toHaveAttribute('lang', 'en')
    await expectNoAxeViolations()
  })

  it('changes text size with Smaller / Bigger buttons and named sizes, never by dragging', async () => {
    const user = userEvent.setup()
    renderRoute('/adapt')

    const smaller = screen.getByRole('button', { name: 'Smaller' })
    const bigger = screen.getByRole('button', { name: 'Bigger' })
    expect(smaller).toHaveAttribute('aria-disabled', 'true')

    await user.click(smaller)
    expect(prefs().textScale).toBe(1)

    await user.click(bigger)
    expect(prefs().textScale).toBe(1.15)
    expect(document.querySelector('output')).toHaveTextContent('Current size 115%')
    expect(screen.getByRole('radio', { name: '115%' })).toBeChecked()
    expect(document.documentElement.style.getPropertyValue('--text-scale')).toBe('1.15')

    await user.click(screen.getByRole('radio', { name: '200%' }))
    expect(prefs().textScale).toBe(2)
    expect(bigger).toHaveAttribute('aria-disabled', 'true')
    await user.click(bigger)
    expect(prefs().textScale).toBe(2)

    await user.click(smaller)
    expect(prefs().textScale).toBe(1.75)
    expect(within(screen.getByRole('figure')).getByText('Text 175%')).toBeInTheDocument()
  })

  it('turns on high contrast, Easy Read, read aloud and reduced motion', async () => {
    const user = userEvent.setup()
    renderRoute('/adapt')

    await user.click(screen.getByRole('switch', { name: 'High contrast' }))
    expect(prefs().contrast).toBe('high')
    expect(document.documentElement.dataset.contrast).toBe('high')
    expect(screen.getByRole('switch', { name: 'High contrast' })).toHaveAttribute('aria-checked', 'true')

    await user.click(screen.getByRole('switch', { name: 'Easy Read' }))
    expect(prefs().easyRead).toBe(true)
    // Easy Read swaps in the shorter sentence straight away.
    expect(screen.getByText('Make Ruko easier for you. Changes work straight away.')).toBeInTheDocument()
    expect(
      within(screen.getByRole('figure')).getByText(
        'Police never arrest anyone on a video call. You do not have to pay.',
      ),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('switch', { name: 'Read aloud' }))
    expect(prefs().readAloud).toBe(true)

    await user.click(screen.getByRole('radio', { name: 'Reduce' }))
    expect(prefs().motion).toBe('reduce')
    expect(screen.getByText('Ruko will not animate. Screens change without moving.')).toBeInTheDocument()

    const chips = within(screen.getByRole('list', { name: 'Your changes:' })).getAllByRole('listitem')
    expect(chips.map((c) => c.textContent)).toEqual(['High contrast', 'Easy Read', 'Read aloud', 'Less movement'])
    await expectNoAxeViolations()
  })

  it('shows design notes for judges when switched on', async () => {
    const user = userEvent.setup()
    renderRoute('/adapt')
    expect(screen.queryByRole('complementary', { name: /you choose/i })).not.toBeInTheDocument()

    await user.click(screen.getByRole('switch', { name: 'Show design notes (for judges)' }))

    expect(prefs().designNotes).toBe(true)
    expect(
      screen.getByRole('complementary', { name: 'Design note: You choose. Ruko never guesses.' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('complementary', { name: 'Design note: Buttons, not a slider' })).toBeInTheDocument()
    await expectNoAxeViolations()
  })

  it("resets to the phone's settings but keeps the language, with an Undo", async () => {
    const user = userEvent.setup()
    useStore.getState().setPrefs({ lang: 'hi', textScale: 1.5, contrast: 'high', easyRead: true, motion: 'full' })
    renderRoute('/adapt')

    await user.click(screen.getByRole('button', { name: 'फ़ोन की सेटिंग पर वापस जाएँ' }))
    expect(prefs()).toEqual({ ...defaultPrefs, lang: 'hi' })
    expect(await screen.findByText('फ़ोन की सेटिंग वापस लग गई।')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'वापस लें' }))
    expect(prefs()).toMatchObject({ lang: 'hi', textScale: 1.5, contrast: 'high', easyRead: true, motion: 'full' })
  })

  it('says so when there is nothing to reset', async () => {
    const user = userEvent.setup()
    renderRoute('/adapt')
    await user.click(screen.getByRole('button', { name: "Reset to my phone's settings" }))
    expect(await screen.findByText("You are already using your phone's settings.")).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Undo' })).not.toBeInTheDocument()
  })

  it('gently suggests high contrast when the phone asks for more contrast', async () => {
    const user = userEvent.setup()
    mockPhoneSettings('(prefers-contrast: more)')
    renderRoute('/adapt')

    expect(screen.getByText('Your phone asks for stronger contrast')).toBeInTheDocument()
    await expectNoAxeViolations()
    await user.click(screen.getByRole('button', { name: 'Turn on high contrast' }))

    expect(prefs().contrast).toBe('high')
    expect(screen.queryByText('Your phone asks for stronger contrast')).not.toBeInTheDocument()
    // Focus lands on the control that changed, never lost.
    expect(screen.getByRole('switch', { name: 'High contrast' })).toHaveFocus()
    expect(await screen.findByText('High contrast is on.')).toBeInTheDocument()
  })

  it('lets the person say "Not now" to a suggestion', async () => {
    const user = userEvent.setup()
    mockPhoneSettings('(prefers-contrast: more)')
    renderRoute('/adapt')
    await user.click(screen.getByRole('button', { name: 'Not now' }))
    expect(prefs().contrast).toBe('standard')
    expect(screen.queryByText('Your phone asks for stronger contrast')).not.toBeInTheDocument()
  })

  it('offers to keep reduced motion when the phone asks for less movement', async () => {
    const user = userEvent.setup()
    mockPhoneSettings('(prefers-reduced-motion: reduce)')
    renderRoute('/adapt')

    expect(screen.getByText('Your phone asks for less movement, so Ruko moves less.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Always move less' }))
    expect(prefs().motion).toBe('reduce')
    expect(screen.getByRole('radio', { name: 'Reduce' })).toHaveFocus()
  })

  it('does not suggest anything when the related setting is already chosen', () => {
    mockPhoneSettings('(prefers-contrast: more)', '(prefers-reduced-motion: reduce)')
    useStore.getState().setPrefs({ contrast: 'high', motion: 'full' })
    renderRoute('/adapt')
    expect(screen.queryByText('Your phone asks for stronger contrast')).not.toBeInTheDocument()
    expect(screen.queryByText('Your phone asks for less movement')).not.toBeInTheDocument()
  })

  it('keeps the preview button text tied to the trusted person', async () => {
    renderRoute('/adapt')
    expect(within(screen.getByRole('figure')).getByText('Tell my family')).toBeInTheDocument()
    withDemoProfile()
    await waitFor(() => expect(within(screen.getByRole('figure')).getByText('Tell Rahul')).toBeInTheDocument())
  })
})

describe('text scale helpers', () => {
  it('finds the nearest named size and formats it', () => {
    expect(nearestScaleIndex(1)).toBe(0)
    expect(nearestScaleIndex(1.4)).toBe(2)
    expect(nearestScaleIndex(3)).toBe(5)
    expect(scalePercent(1.15)).toBe(115)
    expect(parseScale('1.75')).toBe(1.75)
    expect(parseScale('1.6')).toBeUndefined()
  })
  it('compares preferences field by field', () => {
    expect(samePrefs(defaultPrefs, { ...defaultPrefs })).toBe(true)
    expect(samePrefs(defaultPrefs, { ...defaultPrefs, easyRead: true })).toBe(false)
  })
})
