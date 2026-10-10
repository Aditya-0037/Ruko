import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { useStore } from '../../state/store'
import { expectNoAxeViolations, renderRoute } from '../../test/utils'

describe('/about — How Ruko was designed', () => {
  it('tells the story for judges with real numbers and no axe violations', async () => {
    renderRoute('/about')

    expect(screen.getByRole('heading', { level: 1, name: 'How Ruko was designed' })).toBeInTheDocument()
    expect(screen.getByText('₹1,935 crore')).toBeInTheDocument()
    expect(screen.getByText('1.23 lakh')).toBeInTheDocument()
    expect(screen.getByText('₹22,845 crore')).toBeInTheDocument()
    expect(screen.getByText(/there is no “digital arrest” in indian law/i)).toBeInTheDocument()

    for (const heading of [
      'The problem',
      'The key insight',
      'Who we designed for',
      'Four design principles',
      'Where to find each judging area',
      'What we chose not to build',
      'Sources',
    ]) {
      expect(screen.getByRole('heading', { level: 2, name: heading })).toBeInTheDocument()
    }
    expect(screen.getByRole('heading', { level: 3, name: 'Kamla Devi, 68' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Rahul, 34' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'An AI verdict checker' })).toBeInTheDocument()
    expect(screen.getByText(/wait an hour before sending over ₹10,000 to someone new/i)).toBeInTheDocument()

    const principles = within(screen.getByRole('region', { name: 'Four design principles' })).getAllByRole('listitem')
    expect(principles).toHaveLength(4)

    expect(screen.getByText('Built for Hyperbloom October 2026.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'See both phones side by side' })).toHaveAttribute('href', '/demo')
    expect(screen.getByRole('link', { name: 'Read the Accessibility label' })).toHaveAttribute('href', '/accessibility')

    await expectNoAxeViolations()
  })

  it('maps all six judging areas to concrete features in a table', () => {
    renderRoute('/about')
    const table = screen.getByRole('table', { name: 'The six judging areas, mapped to Ruko' })
    const areas = within(table)
      .getAllByRole('rowheader')
      .map((th) => th.textContent)
    expect(areas).toEqual([
      'UX flows',
      'Visual UI',
      'Accessibility and inclusive design',
      'Interaction and information architecture',
      'Problem-solving and originality',
      'Polish',
    ])
  })

  it('starts the 60-second tour: demo family, design notes on, home, and an explaining toast', async () => {
    const user = userEvent.setup()
    const { router } = renderRoute('/about')

    await user.click(screen.getByRole('button', { name: 'Start the 60-second tour' }))

    const state = useStore.getState()
    expect(state.prefs.designNotes).toBe(true)
    expect(state.setup.elderName).toBe('Kamla Devi')
    expect(state.people[0]?.name).toBe('Rahul')
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
    expect(await screen.findByText(/yellow design notes now appear on every screen/i)).toBeInTheDocument()
    // Nothing of the person's own was replaced, so there is nothing to undo.
    expect(screen.queryByRole('button', { name: 'Undo' })).not.toBeInTheDocument()
  })

  it('warns and offers Undo when the tour would replace someone’s own setup', async () => {
    const user = userEvent.setup()
    useStore.getState().setElderName('Asha')
    useStore.getState().addPerson({ name: 'Meera', relation: 'Daughter', phone: '+91 90000 00000' })
    renderRoute('/about')

    expect(screen.getByText(/this replaces the setup on this phone with the demo family/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Start the 60-second tour' }))
    expect(useStore.getState().setup.elderName).toBe('Kamla Devi')

    await user.click(await screen.findByRole('button', { name: 'Undo' }))
    const state = useStore.getState()
    expect(state.setup.elderName).toBe('Asha')
    expect(state.people.map((p) => p.name)).toEqual(['Meera'])
    expect(state.prefs.designNotes).toBe(false)
  })

  it('switches design notes on and off from the page', async () => {
    const user = userEvent.setup()
    renderRoute('/about')

    const toggle = screen.getByRole('switch', { name: 'Show design notes on every screen' })
    await user.click(toggle)
    expect(useStore.getState().prefs.designNotes).toBe(true)
    expect(screen.getByRole('complementary', { name: 'Design note: A tour for busy judges' })).toBeInTheDocument()
    expect(screen.getByRole('complementary', { name: 'Design note: Why rules beat a verdict' })).toBeInTheDocument()
    await expectNoAxeViolations()

    await user.click(toggle)
    expect(useStore.getState().prefs.designNotes).toBe(false)
    expect(screen.queryByRole('complementary', { name: /a tour for busy judges/i })).not.toBeInTheDocument()
  })

  it('reads in Hindi with Indian number formatting', async () => {
    useStore.getState().setPrefs({ lang: 'hi' })
    renderRoute('/about')
    expect(screen.getByRole('heading', { level: 1, name: 'रुको कैसे डिज़ाइन किया गया' })).toBeInTheDocument()
    expect(screen.getByText('₹1,935 करोड़')).toBeInTheDocument()
    expect(screen.getByText('1.23 लाख')).toBeInTheDocument()
    await expectNoAxeViolations()
  })
})
