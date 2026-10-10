import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { useStore } from '../../state/store'
import { expectNoAxeViolations, renderRoute, withDemoProfile } from '../../test/utils'

const footerStatus = () => screen.getAllByRole('status').find((el) => !el.closest('main') && el.tagName === 'P')!

describe('/golden-hour/evidence — collect evidence', () => {
  it('is one calm form where every box is optional, and never asks for secrets', async () => {
    withDemoProfile()
    renderRoute('/golden-hour/evidence')

    expect(screen.getByRole('heading', { level: 1, name: 'Collect evidence' })).toBeInTheDocument()
    expect(screen.getByText('Golden hour · Step 3 of 5')).toBeInTheDocument()
    expect(screen.getByText('Ruko never asks for your OTP, PIN or passwords')).toBeInTheDocument()

    const labels = [
      'Amount paid (in ₹)',
      'Transaction ID',
      'Date and time you paid',
      'Where the money went',
      'Your bank',
      'The caller’s phone number',
      'Anything else you remember',
    ]
    for (const label of labels) {
      const box = screen.getByLabelText(label)
      expect(box).not.toBeRequired()
    }
    // Plain-words explanations are wired to the boxes.
    expect(screen.getByLabelText('Transaction ID')).toHaveAccessibleDescription(/12-digit utr number in your bank sms/i)
    expect(screen.getByLabelText('Where the money went')).toHaveAccessibleDescription(/upi id you paid \(it looks like name@bank\)/i)
    expect(screen.getByLabelText('Date and time you paid')).toHaveAttribute('type', 'datetime-local')
    expect(screen.getByLabelText('The caller’s phone number')).toHaveAttribute('type', 'tel')

    // Nothing anywhere asks for an OTP, PIN or password.
    expect(screen.queryByLabelText(/otp|pin|password/i)).not.toBeInTheDocument()

    expect(footerStatus()).toHaveTextContent('Saves on this phone as you type. Nothing is sent.')
    await expectNoAxeViolations()
  })

  it('autosaves as she types and confirms it politely after a pause', async () => {
    withDemoProfile()
    renderRoute('/golden-hour/evidence')

    await userEvent.type(screen.getByLabelText('Amount paid (in ₹)'), '200000')
    await userEvent.type(screen.getByLabelText('Transaction ID'), '412345678901')
    await userEvent.type(screen.getByLabelText('Anything else you remember'), 'Said he was Inspector Sharma')

    const { evidence } = useStore.getState().goldenHour
    expect(evidence.amount).toBe('200000')
    expect(evidence.transactionId).toBe('412345678901')
    expect(evidence.notes).toBe('Said he was Inspector Sharma')

    // A second way to check the digits.
    expect(screen.getByText('That is ₹2,00,000 — 2 lakh rupees.')).toBeInTheDocument()

    expect(await within(footerStatus()).findByText(/^saved at /i, {}, { timeout: 2000 })).toBeInTheDocument()
  })

  it('keeps a checklist of things to keep, saved with the rest', async () => {
    withDemoProfile()
    renderRoute('/golden-hour/evidence')
    const keep = screen.getByRole('region', { name: 'Things to keep safe' })
    expect(within(keep).getByText(/do not delete messages or call history/i)).toBeInTheDocument()
    const shots = within(keep).getByRole('checkbox', { name: 'Screenshots of the chat and the call log' })
    expect(shots).toHaveAccessibleDescription(/a screenshot is a photo of your screen/i)
    await userEvent.click(shots)
    await userEvent.click(within(keep).getByRole('checkbox', { name: 'The bank SMS about the payment' }))
    expect(within(keep).getByRole('checkbox', { name: 'Any fake documents or ID cards they showed you' })).not.toBeChecked()
    const { checklist } = useStore.getState().goldenHour
    expect(checklist['keep.screenshots']).toBe(true)
    expect(checklist['keep.sms']).toBe(true)
    // These are not part of the five-step count.
    expect(checklist.evidence).toBeUndefined()
    await expectNoAxeViolations()
  })

  it('"Done" ticks step 3 and goes on to the complaint pack', async () => {
    withDemoProfile()
    const { router } = renderRoute('/golden-hour/evidence')
    await userEvent.click(screen.getByRole('button', { name: 'Done — make my complaint pack' }))
    expect(useStore.getState().goldenHour.checklist.evidence).toBe(true)
    expect(router.state.location.pathname).toBe('/golden-hour/pack')
  })

  it('offers to reuse a payment Ruko saw leave this phone, filling only empty boxes', async () => {
    withDemoProfile()
    // No rules → the transfer goes through ("sent"), as it would without Ruko.
    useStore.setState({ rules: [] })
    useStore.getState().requestTransfer({ amount: 200000, payeeName: 'RBI Safe Account', payeeIsNew: true })
    useStore.getState().updateEvidence({ paidTo: 'safe.rbi@okaxis' })
    renderRoute('/golden-hour/evidence')

    expect(screen.getByText('Ruko noted a payment on this phone')).toBeInTheDocument()
    expect(screen.getByText(/₹2,00,000 to “RBI Safe Account” at/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Fill in these details' }))

    const { evidence } = useStore.getState().goldenHour
    expect(evidence.amount).toBe('200000')
    expect(evidence.paidTo).toBe('safe.rbi@okaxis') // kept what she typed
    expect(evidence.paidAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
    expect(screen.queryByText('Ruko noted a payment on this phone')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Amount paid (in ₹)')).toHaveFocus()
  })

  it('does not offer a paused or cancelled transfer as a payment', () => {
    withDemoProfile()
    useStore.getState().requestTransfer({ amount: 200000, payeeName: 'RBI Safe Account', payeeIsNew: true })
    expect(useStore.getState().incident.transfer?.status).toBe('paused')
    renderRoute('/golden-hour/evidence')
    expect(screen.queryByText('Ruko noted a payment on this phone')).not.toBeInTheDocument()
  })

  it('works in Hindi', async () => {
    withDemoProfile()
    act(() => useStore.getState().setPrefs({ lang: 'hi' }))
    renderRoute('/golden-hour/evidence')
    expect(screen.getByRole('heading', { level: 1, name: 'सबूत इकट्ठा करें' })).toBeInTheDocument()
    expect(screen.getByText('रुको कभी आपका OTP, PIN या पासवर्ड नहीं माँगता')).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText('कितने पैसे भेजे (₹ में)'), '150000')
    expect(screen.getByText(/1 लाख 50 हज़ार रुपये/)).toBeInTheDocument()
    await expectNoAxeViolations()
  })
})
