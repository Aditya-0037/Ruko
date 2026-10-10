import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { useStore } from '../../state/store'
import { expectNoAxeViolations, renderRoute, withDemoProfile } from '../../test/utils'
import { SEND_DELAY_MS } from './TellPage'

describe('/tell — Tell my person', () => {
  it('shows exactly what Rahul will see and what is not shared, before anything is sent', async () => {
    withDemoProfile()
    renderRoute('/tell')

    expect(screen.getByRole('heading', { level: 1, name: 'Tell Rahul' })).toBeInTheDocument()
    expect(screen.getByText(/ruko will quietly send rahul this message/i)).toBeInTheDocument()

    const preview = screen.getByRole('region', { name: /what rahul will see/i })
    const figure = within(preview).getByRole('figure')
    expect(figure.querySelector('figcaption')).toHaveTextContent('Preview of Rahul’s phone')
    expect(within(preview).getByText('Kamla Devi pressed Ruko')).toBeInTheDocument()
    expect(within(preview).getByText(/kamla devi may be on a scam call\. the caller says they are from cbi mumbai/i)).toBeInTheDocument()

    expect(screen.getByText(/^not shared:/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /what happens next/i })).toBeInTheDocument()
    expect(useStore.getState().incident.alertSentAt).toBeNull()

    await expectNoAxeViolations()
  })

  it('shows "Telling Rahul…" in the button, then sends, announces and moves focus to the result', async () => {
    withDemoProfile()
    renderRoute('/tell')
    const status = screen.getAllByRole('status').find((el) => el.closest('main'))!
    expect(status).toBeEmptyDOMElement()

    await userEvent.click(screen.getByRole('button', { name: 'Tell Rahul' }))
    const busy = screen.getByRole('button', { name: 'Telling Rahul…' })
    expect(busy).toHaveAttribute('aria-busy', 'true')
    expect(useStore.getState().incident.alertSentAt).toBeNull()

    // A second press while sending does nothing.
    await userEvent.click(busy)

    expect(
      await within(status).findByText('Rahul has been told and will call you soon.', {}, { timeout: SEND_DELAY_MS + 1500 }),
    ).toBeInTheDocument()
    expect(within(status).getByText('You do not need to say anything to the caller.')).toBeInTheDocument()
    expect(within(status).getByText(/^sent at /i)).toBeInTheDocument()

    const { incident } = useStore.getState()
    expect(incident.alertSentAt).not.toBeNull()
    expect(incident.alertPersonId).toBe('person_rahul')
    expect(status.firstElementChild).toHaveFocus()

    // Next steps are now the main thing on the page.
    expect(screen.getByRole('link', { name: 'Check this call' })).toHaveAttribute('href', '/check/1')
    expect(screen.getByRole('link', { name: 'Call Rahul' })).toHaveAttribute('href', 'tel:+919876543210')
    expect(screen.getByRole('link', { name: /back to the calm card/i })).toHaveAttribute('href', '/pause')
    await expectNoAxeViolations()
  })

  it('shows the sent state with the time if the alert already went in this incident', async () => {
    withDemoProfile()
    useStore.getState().sendAlert('person_rahul')
    renderRoute('/tell')
    expect(screen.getByText('Rahul has been told and will call you soon.')).toBeInTheDocument()
    expect(screen.getByText(/^sent at /i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tell Rahul' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tell Rahul again' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /the message rahul got/i })).toBeInTheDocument()
    await expectNoAxeViolations()
  })

  it('respects alerts being switched off: explains, offers a call and a way to change it', async () => {
    withDemoProfile()
    useStore.getState().setSharing({ alertsDuringCall: false })
    renderRoute('/tell')
    expect(screen.getByText(/alerts during calls are off/i)).toBeInTheDocument()
    expect(screen.getByText(/you chose to keep alerts off during calls/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Call Rahul' })).toHaveAttribute('href', 'tel:+919876543210')
    expect(screen.getByRole('link', { name: /change alert settings/i })).toHaveAttribute('href', '/setup/sharing')
    expect(screen.queryByRole('button', { name: 'Tell Rahul' })).not.toBeInTheDocument()
    await expectNoAxeViolations()
  })

  it('without a trusted person, offers to add one', async () => {
    renderRoute('/tell')
    expect(screen.getByRole('heading', { level: 1, name: /tell someone you trust/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /add a trusted person/i })).toHaveAttribute('href', '/setup/person')
    await expectNoAxeViolations()
  })

  it('sends the alert anyway if she leaves while it is sending', async () => {
    withDemoProfile()
    const { router } = renderRoute('/tell')
    await userEvent.click(screen.getByRole('button', { name: 'Tell Rahul' }))
    await act(() => router.navigate('/pause'))
    expect(useStore.getState().incident.alertSentAt).not.toBeNull()
  })

  it('works in Hindi', () => {
    withDemoProfile()
    useStore.getState().setPrefs({ lang: 'hi' })
    renderRoute('/tell')
    expect(screen.getByRole('heading', { level: 1, name: 'Rahul को बताएँ' })).toBeInTheDocument()
    expect(screen.getByText(/कॉल करने वाला ख़ुद को सीबीआई मुंबई से बता रहा है/)).toBeInTheDocument()
  })
})
