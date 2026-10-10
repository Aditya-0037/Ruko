import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { useStore } from '../../state/store'
import { expectNoAxeViolations, renderRoute, withDemoProfile } from '../../test/utils'
import { SCAM_PAYEE } from './transferModel'

function pauseScamTransfer() {
  withDemoProfile()
  return useStore.getState().requestTransfer({ amount: 200000, payeeName: SCAM_PAYEE.name, payeeIsNew: true })
}

/** The always-mounted family-loop live region (first in main). */
const loopRegion = () => document.querySelector('main')!.querySelector<HTMLElement>('p[aria-live="polite"]')!

/** Text split across inline elements (e.g. a <span lang="en"> name) still reads as one paragraph. */
const paragraph = (text: string) => (_: string, el: Element | null) => el?.tagName === 'P' && el.textContent === text

describe('/transfer/paused — the protective pause', () => {
  it('says literally what is happening, the rule she chose, the wait and who is asked', async () => {
    pauseScamTransfer()
    renderRoute('/transfer/paused')

    expect(
      screen.getByRole('heading', { level: 1, name: 'You are sending ₹2,00,000 to a new person.' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Paused by Ruko')).toBeInTheDocument()
    expect(screen.getByText(`To: ${SCAM_PAYEE.name}`)).toBeInTheDocument()
    expect(screen.getByText('Ruko paused this because of your rule:')).toBeInTheDocument()
    expect(
      screen.getByText('When I send more than ₹10,000 to someone new, wait 1 hour and ask Rahul first.'),
    ).toBeInTheDocument()

    const lock = screen.getByRole('region', { name: 'The protective wait' })
    expect(within(lock).getByRole('timer')).toHaveTextContent(/^(1:00:00|59:5\d)$/)
    expect(within(lock).getByText(/^Locked for/)).toBeInTheDocument()
    expect(within(lock).getByText('You chose this wait while calm.')).toBeInTheDocument()
    expect(within(lock).getByText('Waiting for Rahul to see this…')).toBeInTheDocument()
    const steps = within(lock).getByRole('list', { name: 'Asking Rahul' })
    expect(within(steps).getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      'Ruko asked Rahul (done)',
      'Rahul saw it (now)',
      'Rahul decided (not yet)',
    ])

    expect(screen.getByRole('button', { name: 'Cancel transfer — keep my money safe' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Call Rahul' })).toHaveAttribute('href', 'tel:+919876543210')
    // Autonomy, but not before the wait: no "send anyway" yet.
    expect(screen.queryByRole('button', { name: /anyway/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Demo control: end the wait now' })).toBeInTheDocument()

    await expectNoAxeViolations()
  })

  it('announces the remaining time at minute granularity, through a polite live region', () => {
    pauseScamTransfer()
    renderRoute('/transfer/paused')
    const live = screen.getByText('60 minutes left in the wait.')
    expect(live).toHaveAttribute('aria-live', 'polite')
    expect(live).toHaveClass('visually-hidden')

    act(() => {
      useStore.setState((s) => ({
        incident: { ...s.incident, transfer: { ...s.incident.transfer!, unlockAt: Date.now() + 90_000 } },
      }))
    })
    expect(live).toHaveTextContent('2 minutes left in the wait.')

    act(() => {
      useStore.setState((s) => ({
        incident: { ...s.incident, transfer: { ...s.incident.transfer!, unlockAt: Date.now() + 30_000 } },
      }))
    })
    expect(live).toHaveTextContent('1 minute left in the wait.')
  })

  it('cancel keeps her money safe and shows calm next steps', async () => {
    pauseScamTransfer()
    renderRoute('/transfer/paused')

    await userEvent.click(screen.getByRole('button', { name: 'Cancel transfer — keep my money safe' }))

    const h1 = screen.getByRole('heading', { level: 1, name: 'Transfer cancelled. Your ₹2,00,000 is safe.' })
    expect(h1).toHaveFocus()
    expect(useStore.getState().incident.transfer?.status).toBe('cancelled')
    expect(screen.getByText('You stopped it in time. Well done.')).toBeInTheDocument()

    const next = screen.getByRole('region', { name: 'What to do next' })
    expect(within(next).getByText('Report the caller’s number on Sanchar Saathi (Chakshu).')).toBeInTheDocument()
    const report = within(next).getByRole('link', { name: 'Open Sanchar Saathi (opens in a new tab)' })
    expect(report).toHaveAttribute('href', 'https://sancharsaathi.gov.in/')
    expect(report).toHaveAttribute('target', '_blank')
    expect(within(next).getByText('If you shared an OTP or PIN, call 1930 now.')).toBeInTheDocument()
    expect(within(next).getByRole('link', { name: 'Call 1930' })).toHaveAttribute('href', 'tel:1930')
    expect(within(next).getByRole('link', { name: 'Call Rahul' })).toHaveAttribute('href', 'tel:+919876543210')
    expect(screen.queryByRole('button', { name: /cancel transfer/i })).not.toBeInTheDocument()

    await expectNoAxeViolations()
  })

  it('warns when her check answers matched a digital-arrest scam', async () => {
    pauseScamTransfer()
    useStore.getState().answerCheck('secrecy', 'yes')
    renderRoute('/transfer/paused')
    expect(screen.getByText('Your answers matched a digital-arrest scam.')).toBeInTheDocument()
    expect(screen.getByText(/real police, cbi or rbi never ask for money on a video call/i)).toBeInTheDocument()
    await expectNoAxeViolations()
  })

  it('follows the family loop live from the other phone, and announces each change', async () => {
    pauseScamTransfer()
    renderRoute('/transfer/paused')
    const lock = screen.getByRole('region', { name: 'The protective wait' })
    expect(loopRegion()).toBeEmptyDOMElement()

    act(() => useStore.getState().familySeen())
    expect(within(lock).getByText('Rahul has seen this.')).toBeInTheDocument()
    expect(loopRegion()).toHaveTextContent('Rahul has seen this.')

    act(() => useStore.getState().familyDecide('calling'))
    expect(within(lock).getByText('Rahul is calling you.')).toBeInTheDocument()
    expect(loopRegion()).toHaveTextContent('Rahul is calling you.')

    act(() => useStore.getState().familyDecide('block'))
    expect(
      screen.getByRole('heading', { level: 1, name: 'Transfer cancelled. Your ₹2,00,000 is safe.' }),
    ).toBeInTheDocument()
    expect(screen.getByText(paragraph('Rahul blocked it from their phone.'))).toBeInTheDocument()
    expect(loopRegion()).toHaveTextContent('Rahul blocked this transfer — your money is safe.')
    await expectNoAxeViolations()
  })

  it('offers "send anyway" only once the wait is over, then points to the golden hour', async () => {
    pauseScamTransfer()
    renderRoute('/transfer/paused')

    await userEvent.click(screen.getByRole('button', { name: 'Demo control: end the wait now' }))
    expect(screen.getByText('The wait is over.')).toHaveFocus()
    expect(screen.getByText('The wait is over. You can still cancel.')).toHaveAttribute('aria-live', 'polite')
    expect(screen.queryByRole('button', { name: /demo control/i })).not.toBeInTheDocument()
    // Cancel stays the big button even now.
    expect(screen.getByRole('button', { name: 'Cancel transfer — keep my money safe' })).toBeInTheDocument()

    const anyway = screen.getByRole('button', { name: 'Send ₹2,00,000 anyway' })
    expect(anyway).toHaveAccessibleDescription('Only if you are sure. It is your money and your choice.')
    await expectNoAxeViolations()

    await userEvent.click(anyway)
    expect(screen.getByRole('heading', { level: 1, name: '₹2,00,000 sent' })).toHaveFocus()
    expect(useStore.getState().incident.transfer?.status).toBe('sent')
    expect(screen.getByRole('link', { name: 'Get help now (golden hour)' })).toHaveAttribute('href', '/golden-hour')
    expect(screen.getByRole('link', { name: 'Call 1930 — Cyber Crime Helpline' })).toHaveAttribute('href', 'tel:1930')
    await expectNoAxeViolations()
  })

  it('unlocks when her trusted person approves', () => {
    pauseScamTransfer()
    renderRoute('/transfer/paused')
    act(() => useStore.getState().familyDecide('approve'))
    const lock = screen.getByRole('region', { name: 'The protective wait' })
    expect(within(lock).getByText('Unlocked by Rahul.')).toBeInTheDocument()
    expect(within(lock).getByText('Rahul approved. You can send it if you still want to.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send ₹2,00,000 anyway' })).toBeInTheDocument()
    expect(loopRegion()).toHaveTextContent('Rahul approved. You can send it if you still want to.')
  })

  it('respects her choice not to share payments with family', () => {
    pauseScamTransfer()
    useStore.getState().setSharing({ transferPauses: false })
    renderRoute('/transfer/paused')
    expect(
      screen.getByText('You chose not to share payments, so Rahul was not told. You can still call.'),
    ).toBeInTheDocument()
    expect(screen.queryByRole('list', { name: 'Asking Rahul' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Call Rahul' })).toBeInTheDocument()
  })

  it('can read the pause aloud, using exactly the words on screen', async () => {
    const spoken: string[] = []
    class FakeUtterance {
      lang = ''
      rate = 1
      pitch = 1
      voice: unknown = null
      onend: (() => void) | null = null
      onerror: (() => void) | null = null
      constructor(public text: string) {}
    }
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: FakeUtterance })
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: { speak: (u: FakeUtterance) => spoken.push(u.text), cancel: () => {}, getVoices: () => [] },
    })
    try {
      pauseScamTransfer()
      renderRoute('/transfer/paused')
      await userEvent.click(screen.getByRole('button', { name: 'Listen' }))
      expect(spoken).toEqual([
        'You are sending ₹2,00,000 to a new person. Ruko paused this because of your rule: When I send more than ₹10,000 to someone new, wait 1 hour and ask Rahul first. You chose this wait while calm.',
      ])
    } finally {
      Reflect.deleteProperty(window, 'speechSynthesis')
      Reflect.deleteProperty(window, 'SpeechSynthesisUtterance')
    }
  })

  it('shows a calm empty state when nothing is paused', async () => {
    renderRoute('/transfer/paused')
    expect(screen.getByRole('heading', { level: 1, name: 'No payment is waiting' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Open the practice bank app' })).toHaveAttribute('href', '/transfer')
    await expectNoAxeViolations()
  })

  it('works in Hindi, with the English name marked', () => {
    pauseScamTransfer()
    useStore.getState().setPrefs({ lang: 'hi' })
    renderRoute('/transfer/paused')
    expect(
      screen.getByRole('heading', { level: 1, name: 'आप एक नए व्यक्ति को ₹2,00,000 भेज रहे हैं।' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        paragraph('जब मैं किसी नए व्यक्ति को ₹10,000 से ज़्यादा भेजूँ, तो रुको पहले 1 घंटा इंतज़ार करे और Rahul से पूछे।'),
      ),
    ).toBeInTheDocument()
    expect(screen.getAllByText('Rahul')[0]).toHaveAttribute('lang', 'en')
    expect(screen.getByRole('button', { name: 'पेमेंट रद्द करें — मेरे पैसे बचाएँ' })).toBeInTheDocument()
  })
})
