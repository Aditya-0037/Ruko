import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useStore } from '../../state/store'
import { expectNoAxeViolations, renderRoute, withDemoProfile } from '../../test/utils'

/** jsdom cannot follow tel: links; stop the navigation but keep React's click handlers. */
function blockLinkNavigation() {
  const stop = (e: MouseEvent) => {
    if ((e.target as Element | null)?.closest?.('a[href^="tel:"], a[target="_blank"]')) e.preventDefault()
  }
  window.addEventListener('click', stop)
  return () => window.removeEventListener('click', stop)
}

let unblock: () => void
beforeEach(() => {
  unblock = blockLinkNavigation()
})
afterEach(() => unblock())

describe('/golden-hour — money already sent', () => {
  it('leads with one big, calm call to 1930 and starts the clock', async () => {
    withDemoProfile()
    renderRoute('/golden-hour')

    expect(screen.getByRole('heading', { level: 1, name: 'Money already sent? Act now.' })).toBeInTheDocument()
    const call = screen.getByRole('link', { name: 'Call 1930 now' })
    expect(call).toHaveAttribute('href', 'tel:1930')
    expect(call).toHaveAccessibleDescription(/national cyber crime helpline\. free, open day and night/i)
    expect(useStore.getState().goldenHour.startedAt).not.toBeNull()

    const online = screen.getByRole('link', { name: /report online at cybercrime\.gov\.in \(opens in a new tab\)/i })
    expect(online).toHaveAttribute('href', 'https://cybercrime.gov.in')
    expect(online).toHaveAttribute('target', '_blank')
    expect(online.getAttribute('rel')).toMatch(/noopener/)

    expect(screen.getByText('Time since you started: less than a minute.')).toBeInTheDocument()
    expect(screen.getByText(/the first hour matters most/i)).toBeInTheDocument()
    expect(screen.getByText('You are not to blame.')).toBeInTheDocument()
    expect(screen.getByText(/these scams fool doctors, judges and engineers/i)).toBeInTheDocument()

    await expectNoAxeViolations()
  })

  it('records when she pressed Call 1930', async () => {
    withDemoProfile()
    renderRoute('/golden-hour')
    expect(useStore.getState().goldenHour.called1930).toBe(false)
    await userEvent.click(screen.getByRole('link', { name: 'Call 1930 now' }))
    expect(useStore.getState().goldenHour.called1930).toBe(true)
    expect(useStore.getState().goldenHour.called1930At).not.toBeNull()
    expect(screen.getByText(/you pressed “call 1930” at/i)).toBeInTheDocument()
  })

  it('shows minutes since starting in a polite live region, and is honest after the hour', () => {
    withDemoProfile()
    useStore.setState((s) => ({ goldenHour: { ...s.goldenHour, startedAt: Date.now() - 12 * 60_000 - 5_000 } }))
    const { unmount } = renderRoute('/golden-hour')
    const timer = screen.getByText('Time since you started: 12 min.')
    expect(timer).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByText('The first hour matters most — the bank may still be able to hold the money.')).toBeInTheDocument()
    unmount()

    useStore.setState((s) => ({ goldenHour: { ...s.goldenHour, startedAt: Date.now() - 75 * 60_000 } }))
    renderRoute('/golden-hour')
    expect(screen.getByText('Time since you started: 1 hr 15 min.')).toBeInTheDocument()
    expect(screen.getByText(/the first hour has passed, but please still report now/i)).toBeInTheDocument()
  })

  it('has five ordered steps with persisted ticks and progress in words', async () => {
    withDemoProfile()
    renderRoute('/golden-hour')

    const steps = screen.getByRole('region', { name: 'Your five steps' })
    const list = within(steps).getByRole('list')
    expect(list.tagName).toBe('OL')
    expect(within(list).getAllByRole('listitem')).toHaveLength(5)
    expect(within(steps).getByText('0 of 5 done')).toBeInTheDocument()

    const report = within(steps).getByRole('checkbox', { name: 'Call 1930 or report online' })
    expect(report).toHaveAccessibleDescription(/do this first/i)
    await userEvent.click(report)
    expect(report).toBeChecked()
    expect(useStore.getState().goldenHour.checklist.report).toBe(true)
    expect(within(steps).getByText('1 of 5 done')).toBeInTheDocument()

    await userEvent.click(within(steps).getByRole('checkbox', { name: /call your bank to block/i }))
    expect(within(steps).getByText('2 of 5 done')).toBeInTheDocument()

    // Clicking the words also ticks (the label is the target).
    await userEvent.click(within(steps).getByText('Collect evidence'))
    expect(useStore.getState().goldenHour.checklist.evidence).toBe(true)

    expect(within(steps).getByRole('link', { name: 'Write down what you know' })).toHaveAttribute('href', '/golden-hour/evidence')
    expect(within(steps).getByRole('link', { name: 'Open my complaint pack' })).toHaveAttribute('href', '/golden-hour/pack')
    expect(within(steps).getByRole('link', { name: 'See what happens next' })).toHaveAttribute('href', '/golden-hour/status')

    await expectNoAxeViolations()
  })

  it('celebrates when all five are done, with a warning about recovery scams', async () => {
    withDemoProfile()
    for (const k of ['report', 'bank', 'evidence', 'pack']) useStore.getState().toggleChecklist(k, true)
    renderRoute('/golden-hour')
    await userEvent.click(screen.getByRole('checkbox', { name: 'Track what happens next' }))
    const status = screen.getAllByRole('status').find((el) => el.closest('main'))!
    expect(within(status).getByText('All five steps are done. Well done.')).toBeInTheDocument()
    expect(within(status).getByText(/for a fee, that is another scam/i)).toBeInTheDocument()
  })

  it('shows how much evidence is written and where the case stands', () => {
    withDemoProfile()
    useStore.getState().updateEvidence({ amount: '200000', transactionId: '412345678901' })
    useStore.getState().setStatusStep('onHold')
    renderRoute('/golden-hour')
    expect(screen.getByText('2 of 7 details written')).toBeInTheDocument()
    expect(screen.getByText('Now: Money on hold')).toBeInTheDocument()
  })

  it('can clear the notes and undo it', async () => {
    withDemoProfile()
    useStore.getState().toggleChecklist('report', true)
    useStore.getState().updateEvidence({ amount: '5000' })
    renderRoute('/golden-hour')
    await userEvent.click(screen.getByRole('button', { name: 'Clear my notes and start again' }))
    expect(useStore.getState().goldenHour.checklist.report).toBeUndefined()
    expect(useStore.getState().goldenHour.evidence.amount).toBe('')
    expect(useStore.getState().goldenHour.startedAt).not.toBeNull()
    await userEvent.click(screen.getByRole('button', { name: 'Undo' }))
    expect(useStore.getState().goldenHour.checklist.report).toBe(true)
    expect(useStore.getState().goldenHour.evidence.amount).toBe('5000')
  })

  it('speaks Hindi naturally and stays accessible', async () => {
    withDemoProfile()
    act(() => useStore.getState().setPrefs({ lang: 'hi' }))
    renderRoute('/golden-hour')
    expect(screen.getByRole('heading', { level: 1, name: 'पैसे पहले ही भेज दिए हैं? अभी क़दम उठाइए।' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'अभी 1930 पर कॉल करें' })).toBeInTheDocument()
    expect(screen.getByText('5 में से 0 हो गए')).toBeInTheDocument()
    // The web address keeps its own language inside the Hindi sentence.
    expect(screen.getByText('cybercrime.gov.in')).toHaveAttribute('lang', 'en')
    await expectNoAxeViolations()
  })

  it('shows design notes only when they are switched on', () => {
    withDemoProfile()
    useStore.getState().setPrefs({ designNotes: true })
    renderRoute('/golden-hour')
    expect(screen.getByText('A clock and five steps, not a wall of instructions')).toBeInTheDocument()
    expect(screen.getByText(/₹11\.20 crore of ₹11\.34 crore/)).toBeInTheDocument()
  })

  it('sends unknown sections back to the main golden hour screen', () => {
    withDemoProfile()
    const { router } = renderRoute('/golden-hour/nonsense')
    expect(router.state.location.pathname).toBe('/golden-hour')
    expect(screen.getByRole('heading', { level: 1, name: 'Money already sent? Act now.' })).toBeInTheDocument()
  })
})
