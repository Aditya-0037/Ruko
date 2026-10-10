import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { useStore } from '../../state/store'
import { expectNoAxeViolations, renderRoute, withDemoProfile } from '../../test/utils'

const path = (router: { state: { location: { pathname: string } } }) => router.state.location.pathname
const continueButton = () => screen.getByRole('button', { name: /continue/i })

describe('setup flow', () => {
  it('sends unknown steps (and /setup) to the first question', async () => {
    const { router } = renderRoute('/setup/nope')
    expect(await screen.findByRole('heading', { level: 1, name: 'Choose your language' })).toBeInTheDocument()
    expect(path(router)).toBe('/setup/language')
    expect(screen.getByText('Step 1 of 7')).toBeInTheDocument()
  })

  it('language: switching changes the whole UI immediately and offers each option in its own script', async () => {
    const user = userEvent.setup()
    renderRoute('/setup/language')
    const hindi = screen.getByRole('radio', { name: /हिंदी/ })
    expect(hindi.closest('label')).toHaveAttribute('lang', 'hi')
    // The question is repeated in the other language so a Hindi reader can still find their way.
    expect(screen.getByText('अपनी भाषा चुनें')).toHaveAttribute('lang', 'hi')
    await expectNoAxeViolations()

    await user.click(hindi)
    expect(useStore.getState().prefs.lang).toBe('hi')
    expect(await screen.findByRole('heading', { level: 1, name: 'अपनी भाषा चुनें' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /आगे बढ़ें/ })).toBeInTheDocument()
    expect(screen.getByText('Choose your language')).toHaveAttribute('lang', 'en')
    await expectNoAxeViolations()
  })

  it('name: says how to fix an empty answer, focuses the field, and autosaves', async () => {
    const user = userEvent.setup()
    const { router } = renderRoute('/setup/name')
    expect(screen.getByRole('link', { name: /back/i })).toHaveAttribute('href', '/setup/language')

    await user.click(continueButton())
    const input = screen.getByRole('textbox', { name: 'Your name' })
    expect(screen.getByText('Enter the name you like to be called, like Kamla.')).toBeInTheDocument()
    expect(input).toHaveAttribute('aria-invalid', 'true')
    await waitFor(() => expect(input).toHaveFocus())
    expect(path(router)).toBe('/setup/name')

    await user.type(input, 'Kamla Devi')
    expect(useStore.getState().setup.elderName).toBe('Kamla Devi')
    expect(input).not.toHaveAttribute('aria-invalid')
    expect(screen.getByText('Namaste, Kamla Devi')).toBeInTheDocument()
    await expectNoAxeViolations()

    await user.click(continueButton())
    await waitFor(() => expect(path(router)).toBe('/setup/person'))
  })

  it('person: needs one person, explains phone mistakes, and accepts +91 with spaces and dashes', async () => {
    const user = userEvent.setup()
    const { router } = renderRoute('/setup/person')

    await user.click(continueButton())
    expect(screen.getByText('Add at least one person. Enter their name, like Rahul.')).toBeInTheDocument()
    const name = screen.getByRole('textbox', { name: 'Their name' })
    await waitFor(() => expect(name).toHaveFocus())

    await user.type(name, 'Rahul')
    expect(useStore.getState().people).toMatchObject([{ name: 'Rahul' }])
    expect(screen.getByRole('heading', { level: 2, name: 'Rahul' })).toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: 'Son' }))
    expect(useStore.getState().people[0].relation).toBe('Son')

    const phone = screen.getByRole('textbox', { name: 'Mobile number' })
    await user.type(phone, '12345')
    await user.click(continueButton())
    expect(
      screen.getByText('This number has 5 digits. A mobile number has 10, like 98765 43210.'),
    ).toBeInTheDocument()
    await waitFor(() => expect(phone).toHaveFocus())
    expect(path(router)).toBe('/setup/person')
    await expectNoAxeViolations()

    await user.clear(phone)
    await user.type(phone, '+91 98765-43210')
    await user.click(continueButton())
    await waitFor(() => expect(path(router)).toBe('/setup/rules'))
    expect(useStore.getState().people[0].phone).toBe('+91 98765 43210')
  })

  it('person: adds more people and removes with an Undo toast instead of a confirm dialog', async () => {
    const user = userEvent.setup()
    withDemoProfile()
    renderRoute('/setup/person')
    expect(screen.getByRole('heading', { level: 2, name: 'Rahul' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Add another person' }))
    const names = screen.getAllByRole('textbox', { name: 'Their name' })
    expect(names).toHaveLength(2)
    await waitFor(() => expect(names[1]).toHaveFocus())
    await user.type(names[1], 'Priya')
    await user.click(screen.getAllByRole('radio', { name: 'Daughter' })[1])
    expect(useStore.getState().people.map((p) => p.name)).toEqual(['Rahul', 'Priya'])
    await expectNoAxeViolations()

    await user.click(screen.getByRole('button', { name: 'Remove Priya' }))
    expect(useStore.getState().people.map((p) => p.name)).toEqual(['Rahul'])
    expect(await screen.findByText('Priya removed')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Add another person' })).toHaveFocus())

    await user.click(screen.getByRole('button', { name: 'Undo' }))
    expect(useStore.getState().people.map((p) => p.name)).toEqual(['Rahul', 'Priya'])
    expect(screen.getByRole('heading', { level: 2, name: 'Priya' })).toBeInTheDocument()
  })

  it('person: removing the only person leaves an empty card, and Undo brings them back', async () => {
    const user = userEvent.setup()
    withDemoProfile()
    renderRoute('/setup/person')
    await user.click(screen.getByRole('button', { name: 'Remove Rahul' }))
    expect(useStore.getState().people).toEqual([])
    expect(screen.getByRole('heading', { level: 2, name: 'New person' })).toBeInTheDocument()
    await user.click(await screen.findByRole('button', { name: 'Undo' }))
    expect(useStore.getState().people.map((p) => p.name)).toEqual(['Rahul'])
    expect(screen.getAllByRole('textbox', { name: 'Their name' })).toHaveLength(1)
  })

  it('rules: shows a live sentence and stores exactly one rule', async () => {
    const user = userEvent.setup()
    withDemoProfile()
    useStore.setState({ rules: [] })
    const { router } = renderRoute('/setup/rules')

    expect(
      screen.getByText('If I send more than ₹10,000 to someone new, Ruko will wait 1 hour and ask Rahul.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /₹10,000/ })).toBeChecked()
    await expectNoAxeViolations()

    await user.click(screen.getByRole('radio', { name: /₹25,000/ }))
    await user.click(screen.getByRole('radio', { name: /^Anyone/ }))
    await user.click(screen.getByRole('radio', { name: /4 hours/ }))
    expect(useStore.getState().rules).toHaveLength(1)
    expect(useStore.getState().rules[0]).toMatchObject({ minAmount: 25000, payee: 'any', waitMinutes: 240 })
    expect(
      screen.getByText('If I send more than ₹25,000 to anyone, Ruko will wait 4 hours and ask Rahul.'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /not sure\? use the recommended rule/i }))
    expect(useStore.getState().rules[0]).toMatchObject({ minAmount: 10000, payee: 'new', waitMinutes: 60 })

    await user.click(continueButton())
    await waitFor(() => expect(path(router)).toBe('/setup/code-word'))
    expect(useStore.getState().rules).toHaveLength(1)
  })

  it('rules: saves the recommended rule on Continue even if nothing was touched', async () => {
    const user = userEvent.setup()
    withDemoProfile()
    useStore.setState({ rules: [] })
    renderRoute('/setup/rules')
    await user.click(continueButton())
    expect(useStore.getState().rules).toMatchObject([{ minAmount: 10000, payee: 'new', waitMinutes: 60, askPersonId: 'person_rahul' }])
  })

  it('rules: without a trusted person, explains what to add first', () => {
    renderRoute('/setup/rules')
    expect(screen.getByText('Add a trusted person first, so Ruko knows who to ask.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Add a trusted person' })).toHaveAttribute('href', '/setup/person')
    expect(
      screen.getByText('If I send more than ₹10,000 to someone new, Ruko will wait 1 hour and ask my trusted person.'),
    ).toBeInTheDocument()
  })

  it('code word: suggests a friendly word, shows and hides it, and can be skipped', async () => {
    const user = userEvent.setup()
    const { router } = renderRoute('/setup/code-word')
    const input = screen.getByLabelText('Family code word')
    expect(input).toHaveAttribute('type', 'text')
    await expectNoAxeViolations()

    await user.click(screen.getByRole('button', { name: 'Suggest one' }))
    const word = useStore.getState().setup.codeWord
    expect(['Gulmohar', 'Chameli', 'Imli', 'Kesar', 'Mogra', 'Jamun', 'Champa', 'Elaichi', 'Rajnigandha', 'Peepal']).toContain(word)
    expect(input).toHaveValue(word)

    await user.click(screen.getByRole('button', { name: 'Hide code word' }))
    expect(input).toHaveAttribute('type', 'password')
    await user.click(screen.getByRole('button', { name: 'Show code word' }))
    expect(input).toHaveAttribute('type', 'text')

    await user.click(screen.getByRole('button', { name: 'Skip for now' }))
    await waitFor(() => expect(path(router)).toBe('/setup/sharing'))
  })

  it('code word: hides an existing word by default', () => {
    withDemoProfile()
    renderRoute('/setup/code-word')
    expect(screen.getByLabelText('Family code word')).toHaveAttribute('type', 'password')
  })

  it('sharing: consent is one tap to give and one tap to withdraw; location and messages are never shared', async () => {
    const user = userEvent.setup()
    withDemoProfile()
    renderRoute('/setup/sharing')
    expect(screen.getByRole('heading', { level: 1, name: 'What can Rahul see?' })).toBeInTheDocument()
    expect(screen.getByText('You can turn this off any time, in one tap.')).toBeInTheDocument()
    expect(screen.getByText('Your location')).toBeInTheDocument()
    expect(screen.getByText('Your messages')).toBeInTheDocument()

    const alerts = screen.getByRole('switch', { name: 'Alerts during a scary call' })
    const pauses = screen.getByRole('switch', { name: 'Paused payments' })
    expect(alerts).toHaveAttribute('aria-checked', 'true')
    await user.click(alerts)
    await user.click(pauses)
    expect(useStore.getState().sharing).toEqual({ alertsDuringCall: false, transferPauses: false })
    expect(screen.getByText(/Sharing is off\. Rahul will not be told anything/)).toBeInTheDocument()
    await expectNoAxeViolations()

    await user.click(alerts)
    expect(useStore.getState().sharing.alertsDuringCall).toBe(true)
  })

  it('sharing: without a named person, the copy still reads naturally', async () => {
    const user = userEvent.setup()
    renderRoute('/setup/sharing')
    expect(screen.getByRole('heading', { level: 1, name: 'What can your trusted person see?' })).toBeInTheDocument()
    await user.click(screen.getByRole('switch', { name: 'Alerts during a scary call' }))
    await user.click(screen.getByRole('switch', { name: 'Paused payments' }))
    expect(screen.getByText(/Sharing is off\. Nobody will be told anything/)).toBeInTheDocument()
  })

  it('done: completes setup and summarises the whole plan with edit links', async () => {
    withDemoProfile()
    useStore.setState((s) => ({ setup: { ...s.setup, completed: false } }))
    renderRoute('/setup/done')
    expect(screen.getByRole('heading', { level: 1, name: 'Your safety plan is ready' })).toBeInTheDocument()
    await waitFor(() => expect(useStore.getState().setup.completed).toBe(true))

    const summary = screen.getByRole('region', { name: 'Your plan' })
    expect(within(summary).getByText('Kamla Devi')).toBeInTheDocument()
    expect(within(summary).getByText('Rahul')).toBeInTheDocument()
    expect(
      within(summary).getByText('Sending more than ₹10,000 to someone new? Ruko waits 1 hour and asks Rahul first.'),
    ).toBeInTheDocument()
    expect(within(summary).getByRole('link', { name: 'Edit Trusted person' })).toHaveAttribute(
      'href',
      '/setup/person?from=done',
    )
    expect(screen.getByRole('link', { name: 'Practise once with Rahul (2 min)' })).toHaveAttribute('href', '/drill')
    expect(screen.getByRole('link', { name: 'Go to home' })).toHaveAttribute('href', '/')
    await expectNoAxeViolations()
  })

  it('editing one answer from Home returns to Home instead of walking every step again', async () => {
    const user = userEvent.setup()
    withDemoProfile()
    const { router } = renderRoute('/setup/name?from=home')
    expect(screen.getByText('Changing your plan')).toBeInTheDocument()
    expect(screen.queryByText(/Step \d of 7/)).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back/i })).toHaveAttribute('href', '/')
    await user.click(screen.getByRole('button', { name: 'Save and go back' }))
    await waitFor(() => expect(path(router)).toBe('/'))
  })

  it('walks the whole flow with the keyboard-friendly happy path', async () => {
    const user = userEvent.setup()
    const { router } = renderRoute('/setup/language')
    await user.click(continueButton())
    await waitFor(() => expect(path(router)).toBe('/setup/name'))
    await user.type(screen.getByRole('textbox', { name: 'Your name' }), 'Kamla{Enter}')
    await waitFor(() => expect(path(router)).toBe('/setup/person'))
    await user.type(screen.getByRole('textbox', { name: 'Their name' }), 'Rahul')
    await user.click(screen.getByRole('radio', { name: 'Son' }))
    await user.type(screen.getByRole('textbox', { name: 'Mobile number' }), '9876543210')
    await user.click(continueButton())
    await waitFor(() => expect(path(router)).toBe('/setup/rules'))
    await user.click(continueButton())
    await waitFor(() => expect(path(router)).toBe('/setup/code-word'))
    await user.click(screen.getByRole('button', { name: 'Skip for now' }))
    await waitFor(() => expect(path(router)).toBe('/setup/sharing'))
    await user.click(continueButton())
    await waitFor(() => expect(path(router)).toBe('/setup/done'))
    const s = useStore.getState()
    expect(s.setup).toMatchObject({ elderName: 'Kamla', completed: true })
    expect(s.people).toMatchObject([{ name: 'Rahul', relation: 'Son', phone: '+91 98765 43210' }])
    expect(s.rules).toMatchObject([{ minAmount: 10000, waitMinutes: 60, payee: 'new', askPersonId: s.people[0].id }])
  })

  it('shows design notes for judges when they are switched on', async () => {
    withDemoProfile()
    useStore.getState().setPrefs({ designNotes: true })
    renderRoute('/setup/rules')
    expect(screen.getByRole('complementary', { name: /A pause you choose yourself/ })).toBeInTheDocument()
    await expectNoAxeViolations()
  })
})
