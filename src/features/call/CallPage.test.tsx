import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { useStore } from '../../state/store'
import { expectNoAxeViolations, renderRoute, withDemoProfile } from '../../test/utils'
import { CAPTION_INTERVAL_MS } from './script'

/** Put the store in a connected call that started `agoMs` ago. */
function connectedCall(agoMs: number) {
  const startedAt = Date.now() - agoMs
  useStore.setState((s) => ({
    incident: {
      ...s.incident,
      id: 'incident_test',
      startedAt,
      callActive: true,
      callStartedAt: startedAt,
      callerLabel: 'CBI Mumbai',
    },
  }))
}

describe('/call — ringing', () => {
  it('is clearly labelled as a demo, starts the call once and has no axe violations', async () => {
    withDemoProfile()
    renderRoute('/call')

    expect(screen.getByRole('heading', { level: 1, name: /practice call from officer vikram singh/i })).toBeInTheDocument()
    expect(screen.getByText('Demo call')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Officer Vikram Singh' })).toBeInTheDocument()
    expect(screen.getByText('CBI Mumbai')).toBeInTheDocument()
    expect(screen.getByText(/not in your contacts/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Accept' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Decline' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /end demo/i })).toBeInTheDocument()

    // No Help button or top bar on the full-screen simulation.
    expect(screen.queryByRole('button', { name: /^help$/i })).not.toBeInTheDocument()

    const { incident } = useStore.getState()
    expect(incident.callActive).toBe(true)
    expect(incident.callerLabel).toBe('CBI Mumbai')

    await expectNoAxeViolations()
  })

  it('does not restart a call that is already running', () => {
    withDemoProfile()
    connectedCall(20_000)
    renderRoute('/call')
    expect(useStore.getState().incident.id).toBe('incident_test')
    // An active call opens straight into the connected view.
    expect(screen.getByRole('button', { name: /ruko — pause safely/i })).toBeInTheDocument()
  })

  it('switches off the ringing animation under reduced motion', () => {
    withDemoProfile()
    useStore.getState().setPrefs({ motion: 'reduce' })
    const { container } = renderRoute('/call')
    expect(container.querySelector('[data-animated]')).toHaveAttribute('data-animated', 'false')
  })

  it('keeps the ringing animation when motion is allowed', () => {
    withDemoProfile()
    useStore.getState().setPrefs({ motion: 'full' })
    const { container } = renderRoute('/call')
    expect(container.querySelector('[data-animated]')).toHaveAttribute('data-animated', 'true')
  })

  it('Decline ends the call, goes home and reassures with a toast', async () => {
    withDemoProfile()
    const { router } = renderRoute('/call')
    await userEvent.click(screen.getByRole('button', { name: 'Decline' }))
    expect(useStore.getState().incident.callActive).toBe(false)
    expect(router.state.location.pathname).toBe('/')
    expect(await screen.findByText(/you can always hang up on someone who scares you/i)).toBeInTheDocument()
  })

  it('Hindi: translated caller, no mixed scripts', () => {
    withDemoProfile()
    useStore.getState().setPrefs({ lang: 'hi' })
    renderRoute('/call')
    expect(screen.getByRole('heading', { level: 2, name: 'ऑफ़िसर विक्रम सिंह' })).toBeInTheDocument()
    expect(screen.getByText('सीबीआई मुंबई')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'उठाएँ' })).toBeInTheDocument()
  })
})

describe('/call — connected', () => {
  it('Accept connects, restarts the timer at 00:00, shows the first caption and moves focus', async () => {
    withDemoProfile()
    renderRoute('/call')
    await userEvent.click(screen.getByRole('button', { name: 'Accept' }))

    const caller = screen.getByRole('heading', { level: 2, name: 'Officer Vikram Singh' })
    expect(caller).toHaveFocus()
    expect(screen.getByText(/00:0\d/)).toBeInTheDocument()
    const tile = screen.getByRole('region', { name: 'Officer Vikram Singh' })
    expect(within(tile).getByText(/your aadhaar is linked to a money-laundering case/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ruko — pause safely/i })).toBeInTheDocument()
    await expectNoAxeViolations()
  })

  it('moves through the script every ~6 seconds and never uses a live region for captions', () => {
    withDemoProfile()
    connectedCall(CAPTION_INTERVAL_MS * 2 + 500)
    const { container } = renderRoute('/call')
    const tile = screen.getByRole('region', { name: 'Officer Vikram Singh' })
    expect(within(tile).getByText('Do not tell anyone, not even your family.')).toBeInTheDocument()
    expect(within(tile).queryByText('Your Aadhaar is linked to a money-laundering case.')).not.toBeInTheDocument()
    expect(within(tile).getByText('00:12')).toBeInTheDocument()
    expect(container.querySelector('main [aria-live]')).toBeNull()
    expect(container.querySelector('main [role="status"]')).toBeNull()
  })

  it('offers the full transcript, with the scam sign behind each line', async () => {
    withDemoProfile()
    connectedCall(CAPTION_INTERVAL_MS * 3 + 100)
    renderRoute('/call')
    const toggle = screen.getByRole('button', { name: /show full transcript/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('heading', { name: /what the caller has said/i })).not.toBeInTheDocument()

    await userEvent.click(toggle)
    expect(screen.getByRole('button', { name: /hide transcript/i })).toHaveAttribute('aria-expanded', 'true')
    const transcript = screen.getByRole('region', { name: /what the caller has said/i })
    const items = within(transcript).getAllByRole('listitem')
    expect(items).toHaveLength(4)
    expect(within(transcript).getByText(/there is no digital arrest in indian law/i)).toBeInTheDocument()
    expect(within(transcript).getAllByText(/scam sign/i)).toHaveLength(4)
    await expectNoAxeViolations()
  })

  it('RUKO opens the calm card WITHOUT ending the call, and the call bar appears there', async () => {
    withDemoProfile()
    connectedCall(8_000)
    const { router } = renderRoute('/call')
    await userEvent.click(screen.getByRole('button', { name: /ruko — pause safely/i }))

    expect(router.state.location.pathname).toBe('/pause')
    const { incident } = useStore.getState()
    expect(incident.callActive).toBe(true)
    expect(incident.pauseOpenedAt).not.toBeNull()
    expect(screen.getByRole('complementary', { name: /call still running/i })).toBeInTheDocument()
  })

  it('Hang up and End demo both end the call and go home', async () => {
    withDemoProfile()
    connectedCall(3_000)
    const { router } = renderRoute('/call')
    await userEvent.click(screen.getByRole('button', { name: /hang up/i }))
    expect(useStore.getState().incident.callActive).toBe(false)
    expect(router.state.location.pathname).toBe('/')
  })

  it('shows design notes only when Design notes is on', () => {
    withDemoProfile()
    connectedCall(1_000)
    useStore.getState().setPrefs({ designNotes: true })
    renderRoute('/call')
    expect(screen.getByRole('complementary', { name: /help without hanging up/i })).toBeInTheDocument()
  })
})
