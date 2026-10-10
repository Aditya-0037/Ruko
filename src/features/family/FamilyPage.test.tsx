import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { useStore } from '../../state/store'
import { expectNoAxeViolations, renderRoute, withDemoProfile } from '../../test/utils'
import { SCAM_PAYEE } from '../transfer/transferModel'
import { SEEN_DELAY_MS } from './familyActions'

const pauseScamTransfer = () =>
  useStore.getState().requestTransfer({ amount: 200000, payeeName: SCAM_PAYEE.name, payeeIsNew: true })

const card = (name: RegExp | string) => screen.getByRole('article', { name })

describe('/family — Rahul’s phone', () => {
  it('is calm when nothing is happening, and explains what an alert looks like', async () => {
    withDemoProfile()
    renderRoute('/family')

    expect(screen.getByRole('heading', { level: 1, name: 'Rahul’s phone' })).toBeInTheDocument()
    expect(screen.getByText('Family view')).toBeInTheDocument()
    expect(
      screen.getByText('You are Kamla Devi’s trusted person. Kamla Devi decides what you see.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'All quiet.' })).toBeInTheDocument()
    expect(screen.getByText('Ruko tells you only when Maa needs you.')).toBeInTheDocument()
    expect(screen.getByText('When Maa presses Ruko during a call and chooses to tell you.')).toBeInTheDocument()
    expect(screen.getByText('When Maa’s own rule pauses a big payment to someone new.')).toBeInTheDocument()
    expect(screen.getByText('Maa’s messages, bank balance or location.')).toBeInTheDocument()

    const example = screen.getByRole('figure', { name: 'Example: this is what an alert looks like' })
    expect(within(example).getByText('Maa opened Ruko during a call. Possible digital-arrest scam.')).toBeInTheDocument()
    // The example is a drawing, not a live control.
    expect(screen.queryByRole('button', { name: 'Call Maa' })).not.toBeInTheDocument()
    expect(screen.queryByRole('article')).not.toBeInTheDocument()

    await expectNoAxeViolations()
  })

  it('shows one alert when Maa asks for help, with her check answers, and simulates calling her', async () => {
    withDemoProfile()
    const s = useStore.getState()
    s.startCall()
    s.sendAlert('person_rahul')
    s.answerCheck('secrecy', 'yes')
    s.answerCheck('moneyMove', 'unsure')
    renderRoute('/family')

    const alert = card('Maa opened Ruko during a call. Possible digital-arrest scam.')
    expect(within(alert).getByText('Alert')).toBeInTheDocument()
    expect(within(alert).getByText('Just now')).toBeInTheDocument()
    expect(within(alert).getByText('The caller says they are from CBI Mumbai.')).toBeInTheDocument()
    const signs = within(alert).getByRole('region', { name: 'Maa’s answers to Ruko’s check' })
    expect(within(signs).getByText('Said yes to these scam signs:')).toBeInTheDocument()
    expect(within(signs).getByText('Told to keep it secret, even from family')).toBeInTheDocument()
    expect(within(signs).getByText('Not sure about:')).toBeInTheDocument()
    expect(within(signs).getByText('Asked to move money to a “safe” account')).toBeInTheDocument()

    // Seen is reported to Maa's phone shortly after it is on screen.
    await waitFor(() => expect(useStore.getState().incident.familySeenAt).not.toBeNull(), {
      timeout: SEEN_DELAY_MS + 1500,
    })
    await expectNoAxeViolations()

    await userEvent.click(within(alert).getByRole('button', { name: 'Call Maa' }))
    expect(useStore.getState().incident.familyDecision).toBe('calling')
    const panel = screen.getByRole('region', { name: 'Calling Maa…' })
    expect(within(panel).getByRole('heading', { level: 2, name: 'Calling Maa…' })).toHaveFocus()
    expect(within(panel).getByText('Practice call. No real call is made.')).toBeInTheDocument()
    expect(within(panel).getByText('Ask Maa to hang up. Real police never arrest anyone on a video call.')).toBeInTheDocument()
    expect(within(panel).getByText('Say your family code word, so Maa knows it is really you.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Call Maa' })).not.toBeInTheDocument()
    await expectNoAxeViolations()

    await userEvent.click(within(panel).getByRole('button', { name: 'End call' }))
    expect(screen.queryByRole('region', { name: 'Calling Maa…' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveFocus()
  })

  it('lets Rahul block a paused transfer in one tap', async () => {
    withDemoProfile()
    pauseScamTransfer()
    renderRoute('/family')

    const transfer = card(
      `Maa is trying to send ₹2,00,000 to a new person (${SCAM_PAYEE.name}). Ruko paused it for 1 hour.`,
    )
    expect(within(transfer).getByText('Payment paused')).toBeInTheDocument()
    expect(within(transfer).getByText('The wait ends in 60 min, unless you decide first.')).toBeInTheDocument()
    expect(within(transfer).getByRole('button', { name: 'Approve sending ₹2,00,000' })).toBeInTheDocument()
    expect(within(transfer).getByRole('button', { name: 'Call Maa' })).toBeInTheDocument()
    await expectNoAxeViolations()

    await userEvent.click(within(transfer).getByRole('button', { name: 'Block this transfer' }))
    expect(useStore.getState().incident.transfer?.status).toBe('blocked')
    expect(useStore.getState().incident.familyDecision).toBe('block')
    const heading = screen.getByRole('heading', { level: 2, name: 'You blocked this transfer. Maa’s ₹2,00,000 is safe.' })
    expect(heading).toHaveFocus()
    expect(screen.getByText('Ruko has told Maa on their phone.')).toBeInTheDocument()
    expect(screen.getByText('Payment blocked')).toBeInTheDocument()
    expect(screen.queryByText('Payment paused')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Block this transfer' })).not.toBeInTheDocument()
    await expectNoAxeViolations()
  })

  it('approving is literal and can be undone, from the toast or at any time after', async () => {
    withDemoProfile()
    pauseScamTransfer()
    renderRoute('/family')

    await userEvent.click(screen.getByRole('button', { name: 'Approve sending ₹2,00,000' }))
    expect(useStore.getState().incident.transfer?.status).toBe('approved')
    expect(screen.getByText('You approved sending ₹2,00,000.')).toBeInTheDocument()

    // 8-second Undo toast…
    await userEvent.click(screen.getByRole('button', { name: 'Undo' }))
    expect(useStore.getState().incident.transfer?.status).toBe('paused')
    expect(useStore.getState().incident.familyDecision).toBeNull()
    expect(screen.getByText('Approval undone. The payment is paused again.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Block this transfer' })).toBeInTheDocument()

    // …and a persistent Undo, because a toast is a time limit.
    await userEvent.click(screen.getByRole('button', { name: 'Approve sending ₹2,00,000' }))
    expect(
      screen.getByRole('heading', { level: 2, name: 'You approved sending ₹2,00,000. The payment can now be sent.' }),
    ).toHaveFocus()
    await userEvent.click(screen.getByRole('button', { name: 'Undo approval' }))
    expect(useStore.getState().incident.transfer?.status).toBe('paused')
  })

  it('respects Maa’s choice not to share payment details (dignity first)', async () => {
    withDemoProfile()
    useStore.getState().setSharing({ transferPauses: false })
    useStore.getState().sendAlert('person_rahul')
    pauseScamTransfer()
    renderRoute('/family')

    expect(screen.queryByText(/is trying to send/)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Block this transfer' })).not.toBeInTheDocument()
    expect(screen.getByText('Maa chose not to share transfer details.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Call Maa' })).toBeInTheDocument()
    await expectNoAxeViolations()
  })

  it('stays quiet (and never reports "seen") when nothing shared is happening', async () => {
    withDemoProfile()
    useStore.getState().setSharing({ transferPauses: false })
    pauseScamTransfer()
    renderRoute('/family')

    expect(screen.getByRole('heading', { level: 2, name: 'All quiet.' })).toBeInTheDocument()
    expect(
      screen.getByText('Maa chose not to share payment details, so you will not see payments here.'),
    ).toBeInTheDocument()
    await new Promise((r) => setTimeout(r, SEEN_DELAY_MS + 200))
    expect(useStore.getState().incident.familySeenAt).toBeNull()
  })

  it('marks a transfer that arrives after an earlier alert as seen too', async () => {
    withDemoProfile()
    useStore.getState().sendAlert('person_rahul')
    useStore.setState((s) => ({ incident: { ...s.incident, familySeenAt: Date.now() - 60_000 } }))
    const tr = pauseScamTransfer()
    renderRoute('/family')
    await waitFor(
      () => expect(useStore.getState().incident.familySeenAt).toBeGreaterThanOrEqual(tr.requestedAt),
      { timeout: SEEN_DELAY_MS + 1500 },
    )
  })

  it('shows what happened when Maa cancelled or sent after the wait', async () => {
    withDemoProfile()
    pauseScamTransfer()
    useStore.getState().cancelTransfer()
    const { unmount } = renderRoute('/family')
    expect(screen.getByRole('heading', { level: 2, name: 'Maa cancelled this transfer. The ₹2,00,000 is safe.' }))
      .toBeInTheDocument()
    unmount()

    pauseScamTransfer()
    useStore.setState((s) => ({ incident: { ...s.incident, transfer: { ...s.incident.transfer!, status: 'sent' } } }))
    renderRoute('/family')
    expect(screen.getByRole('heading', { level: 2, name: 'Maa sent ₹2,00,000 after the wait.' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Call 1930' })).toHaveAttribute('href', 'tel:1930')
    await expectNoAxeViolations()
  })

  it('uses the elder’s name when the trusted person is not her child', () => {
    withDemoProfile()
    useStore.getState().updatePerson('person_rahul', { relation: 'Friend' })
    useStore.getState().sendAlert('person_rahul')
    renderRoute('/family')
    expect(screen.getByRole('button', { name: 'Call Kamla Devi' })).toBeInTheDocument()
    expect(card('Kamla Devi opened Ruko during a call. Possible digital-arrest scam.')).toBeInTheDocument()
  })

  it('offers the demo family when nothing is set up', async () => {
    renderRoute('/family')
    expect(screen.getByRole('heading', { level: 1, name: 'Family phone' })).toBeInTheDocument()
    expect(screen.getByText('Ruko is not set up on this phone yet')).toBeInTheDocument()
    await expectNoAxeViolations()
    await userEvent.click(screen.getByRole('button', { name: 'Load the demo family' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Rahul’s phone' })).toBeInTheDocument()
  })

  it('works in Hindi', () => {
    withDemoProfile()
    useStore.getState().setPrefs({ lang: 'hi' })
    pauseScamTransfer()
    renderRoute('/family')
    expect(screen.getByRole('heading', { level: 1, name: 'Rahul का फ़ोन' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'यह पेमेंट रोकें' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '₹2,00,000 भेजने की मंज़ूरी दें' })).toBeInTheDocument()
    expect(screen.getByText(SCAM_PAYEE.name)).toHaveAttribute('lang', 'en')
  })
})
