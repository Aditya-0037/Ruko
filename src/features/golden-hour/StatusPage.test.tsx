import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { useStore } from '../../state/store'
import { expectNoAxeViolations, renderRoute, withDemoProfile } from '../../test/utils'

const stepper = () => screen.getByRole('group', { name: 'Where are you now?' })
/** The list item of the step marked "You are here". */
const current = () => within(stepper().querySelector<HTMLElement>('input:checked')!.closest('li')!)

describe('/golden-hour/status — what happens next', () => {
  it('shows five plain-words steps with icons and words, never colour alone', async () => {
    withDemoProfile()
    renderRoute('/golden-hour/status')

    expect(screen.getByRole('heading', { level: 1, name: 'What happens next' })).toBeInTheDocument()
    expect(screen.getByText('Golden hour · Step 5 of 5')).toBeInTheDocument()

    const group = stepper()
    const radios = within(group).getAllByRole('radio')
    expect(radios).toHaveLength(5)
    expect(within(group).getByRole('radio', { name: 'Complaint registered You are here' })).toBeChecked()
    expect(within(group).getByRole('radio', { name: 'Banks asked to freeze the money Coming up' })).not.toBeChecked()
    expect(within(group).getByRole('radio', { name: 'Money on hold Coming up' })).toBeInTheDocument()
    expect(within(group).getByRole('radio', { name: 'Police or court order Coming up' })).toBeInTheDocument()
    expect(within(group).getByRole('radio', { name: 'Money comes back Coming up' })).toBeInTheDocument()

    // The current step explains itself: meaning, what to do, honest wait.
    expect(current().getByText('What this means')).toBeInTheDocument()
    expect(current().getByText(/you get an acknowledgement number/i)).toBeInTheDocument()
    expect(current().getByText('What you can do')).toBeInTheDocument()
    expect(current().getByText('How long it can take')).toBeInTheDocument()

    // Honest closing.
    expect(screen.getByText('Not all money comes back.')).toBeInTheDocument()
    expect(screen.getByText(/acting in the first hour gives the best chance/i)).toBeInTheDocument()
    await expectNoAxeViolations()
  })

  it('lets her choose where she is; earlier steps become "Done"', async () => {
    withDemoProfile()
    renderRoute('/golden-hour/status')
    const group = stepper()

    await userEvent.click(within(group).getByText('Money on hold'))
    expect(useStore.getState().goldenHour.statusStep).toBe('onHold')
    expect(useStore.getState().goldenHour.checklist.track).toBe(true)

    expect(within(group).getByRole('radio', { name: 'Money on hold You are here' })).toBeChecked()
    expect(within(group).getByRole('radio', { name: 'Complaint registered Done' })).toBeInTheDocument()
    expect(within(group).getByRole('radio', { name: 'Banks asked to freeze the money Done' })).toBeInTheDocument()
    expect(within(group).getByRole('radio', { name: 'Money comes back Coming up' })).toBeInTheDocument()
    expect(current().getByText('This can take weeks or months.')).toBeInTheDocument()
    expect(current().getByText(/real police never ask for money or your otp/i)).toBeInTheDocument()

    // Arrow keys work like any radio group.
    await userEvent.keyboard('{ArrowDown}')
    expect(useStore.getState().goldenHour.statusStep).toBe('policeOrder')
  })

  it('lets her read about other steps without changing where she is', async () => {
    withDemoProfile()
    renderRoute('/golden-hour/status')
    const more = screen.getByText('Read about “Money comes back”')
    const details = more.closest('details')!
    expect(details).not.toHaveAttribute('open')
    await userEvent.click(more)
    expect(details).toHaveAttribute('open')
    expect(within(details).getByText(/the bank sends the released money back/i)).toBeInTheDocument()
    expect(useStore.getState().goldenHour.statusStep).toBe('reported')
  })

  it('saves the complaint number as she types and counts it as reported', async () => {
    withDemoProfile()
    renderRoute('/golden-hour/status')
    expect(screen.getByText('Have you reported yet?')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Call 1930 now' })).toHaveAttribute('href', 'tel:1930')

    const ack = screen.getByLabelText('Complaint number (acknowledgement number)')
    expect(ack).toHaveAccessibleDescription(/you get this number from 1930 or cybercrime\.gov\.in/i)
    await userEvent.type(ack, '31410240012345')
    expect(useStore.getState().goldenHour.ackNumber).toBe('31410240012345')
    expect(useStore.getState().goldenHour.checklist.report).toBe(true)
    // The nudge stays put while she types, so the box does not jump.
    expect(screen.getByText('Have you reported yet?')).toBeInTheDocument()

    const card = screen.getByRole('region', { name: 'Your complaint number' })
    expect(await within(card).findByText(/^saved at /i, {}, { timeout: 2000 })).toBeInTheDocument()
    await expectNoAxeViolations()
  })

  it('does not nudge to call 1930 once she has reported', () => {
    withDemoProfile()
    useStore.getState().setAckNumber('31410240012345')
    renderRoute('/golden-hour/status')
    expect(screen.queryByText('Have you reported yet?')).not.toBeInTheDocument()
  })

  it('links back to the pack and the five steps', () => {
    withDemoProfile()
    renderRoute('/golden-hour/status')
    expect(screen.getByRole('link', { name: 'Open my complaint pack' })).toHaveAttribute('href', '/golden-hour/pack')
    expect(screen.getByRole('link', { name: 'Back to my five steps' })).toHaveAttribute('href', '/golden-hour')
  })

  it('works in Hindi and in Easy Read', async () => {
    withDemoProfile()
    act(() => useStore.getState().setPrefs({ lang: 'hi', easyRead: true }))
    useStore.getState().setStatusStep('bankAsked')
    renderRoute('/golden-hour/status')
    expect(screen.getByRole('heading', { level: 1, name: 'आगे क्या होता है' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'बैंकों से पैसा रोकने को कहा गया आप यहाँ हैं' })).toBeChecked()
    expect(screen.getByText('पुलिस बैंकों से पैसा रोकने को कहती है।')).toBeInTheDocument()
    await expectNoAxeViolations()
  })
})
