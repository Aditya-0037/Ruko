import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { useStore } from '../../state/store'
import { expectNoAxeViolations, renderRoute, withDemoProfile } from '../../test/utils'

const path = (router: { state: { location: { pathname: string } } }) => router.state.location.pathname

describe('home — before setup (welcome)', () => {
  it('introduces Ruko with a one-sentence promise, language first, and setup one tap away', async () => {
    renderRoute('/')
    expect(screen.getByRole('heading', { level: 1, name: 'Welcome to Ruko' })).toBeInTheDocument()
    expect(screen.getByText('Pause. Check. Get help.')).toBeInTheDocument()
    expect(screen.getByText('If someone on a call says you are under arrest, press Ruko.')).toBeInTheDocument()

    const language = screen.getByRole('group', { name: 'Language' })
    expect(within(language).getByRole('radio', { name: 'English' })).toBeChecked()
    expect(within(language).getByText('हिंदी')).toHaveAttribute('lang', 'hi')

    expect(screen.getByRole('link', { name: 'Set up with my family (5 minutes)' })).toHaveAttribute(
      'href',
      '/setup/language',
    )
    expect(screen.getByRole('link', { name: 'For judges: how Ruko was designed' })).toHaveAttribute('href', '/about')
    expect(screen.getByRole('heading', { level: 2, name: 'How Ruko helps' })).toBeInTheDocument()
    await expectNoAxeViolations()
  })

  it('switches the whole screen to Hindi from the first screen', async () => {
    const user = userEvent.setup()
    renderRoute('/')
    await user.click(screen.getByRole('radio', { name: 'हिंदी' }))
    expect(useStore.getState().prefs.lang).toBe('hi')
    expect(await screen.findByRole('heading', { level: 1, name: 'रुको में आपका स्वागत है' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'परिवार के साथ सेट करें (5 मिनट)' })).toBeInTheDocument()
    expect(within(screen.getByRole('group', { name: 'भाषा' })).getByText('English')).toHaveAttribute('lang', 'en')
    await expectNoAxeViolations()
  })

  it('"Try the demo" loads Kamla and Rahul, confirms it, moves focus to the new heading, and can be undone', async () => {
    const user = userEvent.setup()
    renderRoute('/')
    await user.click(screen.getByRole('button', { name: 'Try the demo' }))

    expect(await screen.findByText('Demo loaded: Kamla Devi and her son Rahul')).toBeInTheDocument()
    const heading = await screen.findByRole('heading', { level: 1, name: 'Namaste, Kamla Devi' })
    await waitFor(() => expect(heading).toHaveFocus())
    expect(useStore.getState().people.map((p) => p.name)).toEqual(['Rahul'])

    await user.click(screen.getByRole('button', { name: 'Undo' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Welcome to Ruko' })).toBeInTheDocument()
    expect(useStore.getState().people).toEqual([])
  })

  it('offers to continue where the person left off', () => {
    useStore.getState().setElderName('Kamla')
    renderRoute('/')
    expect(screen.getByRole('link', { name: 'Continue setting up' })).toHaveAttribute('href', '/setup/person')
  })
})

describe('home — set up', () => {
  it('greets by name and puts the Ruko button first', async () => {
    withDemoProfile()
    renderRoute('/')
    expect(screen.getByRole('heading', { level: 1, name: 'Namaste, Kamla Devi' })).toBeInTheDocument()
    expect(screen.getByText('Your safety plan is on.')).toBeInTheDocument()
    const ruko = screen.getByRole('button', { name: /RUKO.*Press if a call scares you/ })
    expect(ruko).toHaveAccessibleDescription('It will not hang up the call. Nothing is sent until you choose.')
    await expectNoAxeViolations()
  })

  it('pressing RUKO opens the calm screen', async () => {
    const user = userEvent.setup()
    withDemoProfile()
    const { router } = renderRoute('/')
    await user.click(screen.getByRole('button', { name: /Press if a call scares you/ }))
    await waitFor(() => expect(path(router)).toBe('/pause'))
    expect(useStore.getState().incident.pauseOpenedAt).not.toBeNull()
  })

  it('organises everything by time: Before, During, After', () => {
    withDemoProfile()
    renderRoute('/')
    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
    expect(headings.slice(0, 3)).toEqual([
      'Before: Your safety plan',
      'During: On a call right now?',
      'After: Money already sent?',
    ])
  })

  it('Before: shows the plan in plain words, with a code-word reveal and edit links', async () => {
    const user = userEvent.setup()
    withDemoProfile()
    renderRoute('/')
    const before = screen.getByRole('region', { name: /Before: Your safety plan/ })
    expect(within(before).getByText('Rahul')).toBeInTheDocument()
    expect(
      within(before).getByText('Sending more than ₹10,000 to someone new? Ruko waits 1 hour and asks Rahul first.'),
    ).toBeInTheDocument()
    expect(within(before).getByText('Not practised yet')).toBeInTheDocument()
    expect(within(before).getByRole('link', { name: 'Edit Calm-moment rule' })).toHaveAttribute(
      'href',
      '/setup/rules?from=home',
    )

    expect(within(before).queryByText('Gulmohar')).not.toBeInTheDocument()
    await user.click(within(before).getByRole('button', { name: 'Show code word' }))
    expect(within(before).getByText('Gulmohar')).toBeInTheDocument()
    await user.click(within(before).getByRole('button', { name: 'Hide code word' }))
    expect(within(before).queryByText('Gulmohar')).not.toBeInTheDocument()

    expect(within(before).getByRole('link', { name: 'Practise a scam call (2 min)' })).toHaveAttribute('href', '/drill')
  })

  it('During: the demo scam call is clearly labelled and starts the simulated call', async () => {
    const user = userEvent.setup()
    withDemoProfile()
    const { router } = renderRoute('/')
    const during = screen.getByRole('region', { name: /During/ })
    const demo = within(during).getByRole('button', { name: 'Try a demo scam call' })
    expect(demo).toHaveAccessibleDescription(/Demo.*A pretend “officer” calls you\. Nothing real happens\./)
    await user.click(demo)
    await waitFor(() => expect(path(router)).toBe('/call'))
    expect(useStore.getState().incident.callActive).toBe(true)
  })

  it('During: "Help me with this call" opens the pause screen', async () => {
    const user = userEvent.setup()
    withDemoProfile()
    const { router } = renderRoute('/')
    await user.click(screen.getByRole('button', { name: 'Help me with this call' }))
    await waitFor(() => expect(path(router)).toBe('/pause'))
  })

  it('After: golden-hour help and 1930 are one tap away', () => {
    withDemoProfile()
    renderRoute('/')
    const after = screen.getByRole('region', { name: /After/ })
    expect(within(after).getByRole('link', { name: 'Show me what to do now' })).toHaveAttribute('href', '/golden-hour')
    expect(within(after).getByRole('link', { name: 'Call 1930, the Cyber Crime Helpline' })).toHaveAttribute(
      'href',
      'tel:1930',
    )
  })

  it('has quiet links for adapting, demos and judges', () => {
    withDemoProfile()
    renderRoute('/')
    const more = screen.getByRole('navigation', { name: 'More' })
    const hrefs = within(more)
      .getAllByRole('link')
      .map((a) => a.getAttribute('href'))
    expect(hrefs).toEqual(['/adapt', '/family', '/demo', '/accessibility', '/about'])
  })

  it('"Start again" clears the plan with Undo instead of a confirm dialog', async () => {
    const user = userEvent.setup()
    withDemoProfile()
    renderRoute('/')
    await user.click(screen.getByRole('button', { name: 'Start again with an empty plan' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Welcome to Ruko' })).toBeInTheDocument()
    expect(screen.getByText('Your plan was cleared from this phone.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Undo' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Namaste, Kamla Devi' })).toBeInTheDocument()
    expect(useStore.getState().setup.codeWord).toBe('Gulmohar')
  })

  it('nudges to finish an unfinished setup', () => {
    useStore.getState().addPerson({ name: 'Rahul', relation: 'Son', phone: '+91 98765 43210' })
    renderRoute('/')
    expect(screen.getByRole('heading', { level: 1, name: 'Namaste' })).toBeInTheDocument()
    expect(screen.getByText('Your safety plan is not finished yet.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Finish setting up' })).toHaveAttribute('href', '/setup/language')
  })

  it('works in Hindi with design notes on, with no axe violations', async () => {
    withDemoProfile()
    useStore.getState().setPrefs({ lang: 'hi', designNotes: true })
    renderRoute('/')
    expect(screen.getByRole('heading', { level: 1, name: 'नमस्ते, Kamla Devi जी' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /रुको.*कॉल से डर लगे तो दबाएँ/ })).toBeInTheDocument()
    expect(screen.getByRole('complementary', { name: /समय के हिसाब से/ })).toBeInTheDocument()
    await expectNoAxeViolations()
  })
})
