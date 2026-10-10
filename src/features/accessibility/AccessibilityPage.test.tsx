import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { useStore } from '../../state/store'
import { expectNoAxeViolations, renderRoute } from '../../test/utils'

afterEach(() => {
  document.documentElement.removeAttribute('data-contrast')
})

function contrastRows() {
  const table = screen.getByRole('table', { name: /colour pairs in/i })
  return within(table).getAllByRole('row').slice(1) // skip the header row
}

describe('/accessibility — the Accessibility label', () => {
  it('lists every supported feature with words, not just icons, and has no axe violations', async () => {
    renderRoute('/accessibility')

    expect(screen.getByRole('heading', { level: 1, name: 'Accessibility label' })).toBeInTheDocument()
    const features = within(screen.getByRole('list', { name: 'Supported features' })).getAllByRole('listitem')
    expect(features).toHaveLength(13)
    for (const name of [
      'Screen reader labels',
      'Larger text, up to 200%',
      'Sufficient contrast',
      'High contrast mode',
      'Reduced motion',
      'Hindi and English',
      'Easy Read',
      'Read aloud',
      'Works offline',
      'No time limits on you',
      'Big buttons',
      'Keyboard support',
      'Help in the same place',
    ]) {
      expect(screen.getByText(name)).toBeInTheDocument()
    }
    expect(screen.getByText('Aims for WCAG 2.2 Level AA')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Adapt Ruko to me' })).toHaveAttribute('href', '/adapt')
    expect(screen.getByRole('link', { name: 'How Ruko was designed' })).toHaveAttribute('href', '/about')

    await expectNoAxeViolations()
  })

  it('computes a contrast ratio and pass level for every token pair', () => {
    renderRoute('/accessibility')

    expect(screen.getByRole('table', { name: 'Colour pairs in standard mode' })).toBeInTheDocument()
    const rows = contrastRows()
    expect(rows).toHaveLength(11)
    expect(screen.getByText('11 of 11 pairs meet WCAG AA.')).toBeInTheDocument()

    const body = rows.find((r) => within(r).queryByRole('rowheader', { name: /body text/i }))!
    // ink-900 on paper-50 → 16.x : 1, AAA.
    expect(within(body).getByText(/^16\.\d : 1$/)).toBeInTheDocument()
    expect(within(body).getByText('Passes AAA')).toBeInTheDocument()

    const border = rows.find((r) => within(r).queryByRole('rowheader', { name: /control borders/i }))!
    expect(within(border).getByText('Needs 3.0 : 1')).toBeInTheDocument()
    expect(within(border).getByText('Passes AA')).toBeInTheDocument()

    // jsdom cannot compute CSS, so the page says honestly where the numbers came from.
    expect(screen.getByText(/calculated from ruko’s colour token values/i)).toBeInTheDocument()
  })

  it('re-measures straight away in high contrast mode', async () => {
    const user = userEvent.setup()
    renderRoute('/accessibility')

    await user.click(screen.getByRole('switch', { name: 'High contrast' }))

    expect(useStore.getState().prefs.contrast).toBe('high')
    await waitFor(() =>
      expect(screen.getByRole('table', { name: 'Colour pairs in high contrast mode' })).toBeInTheDocument(),
    )
    const body = contrastRows().find((r) => within(r).queryByRole('rowheader', { name: /body text/i }))!
    expect(within(body).getByText('21.0 : 1')).toBeInTheDocument()
    expect(screen.getByText('11 of 11 pairs meet WCAG AA.')).toBeInTheDocument()
    await expectNoAxeViolations()
  })

  it('is honest about how it is tested: automatic checks vs a manual checklist', () => {
    renderRoute('/accessibility')
    const section = screen.getByRole('region', { name: 'How we test' })
    expect(within(section).getByRole('heading', { name: 'Automatic, on every change' })).toBeInTheDocument()
    expect(within(section).getByRole('heading', { name: 'By hand, before each release' })).toBeInTheDocument()
    expect(within(section).getByText(/these are the checks we run, not a claim of results/i)).toBeInTheDocument()
  })

  it('reads naturally in Hindi', async () => {
    useStore.getState().setPrefs({ lang: 'hi' })
    renderRoute('/accessibility')
    expect(screen.getByRole('heading', { level: 1, name: 'सुलभता लेबल' })).toBeInTheDocument()
    expect(screen.getByText('11 में से 11 जोड़ियाँ WCAG AA पर खरी हैं।')).toBeInTheDocument()
    await expectNoAxeViolations()
  })
})
