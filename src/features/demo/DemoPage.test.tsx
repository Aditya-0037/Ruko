import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it } from 'vitest'
import { useStore } from '../../state/store'
import { renderRoute, withDemoProfile } from '../../test/utils'

const KAMLA = 'Kamla’s phone: Ruko as Kamla sees it'
const RAHUL = 'Rahul’s phone: Ruko family view'

/**
 * Same check as the shared expectNoAxeViolations, but without descending into the iframes:
 * jsdom cannot run axe inside frames. The frames' own pages are checked by their own tests,
 * and the real frames by the Playwright spec.
 */
async function expectNoAxeViolationsOutsideFrames() {
  const results = await axe.run(document.body, {
    iframes: false,
    rules: { 'color-contrast': { enabled: false } },
  })
  const summary = results.violations.map(
    (v) => `${v.id} (${v.impact}): ${v.help} → ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`,
  )
  expect(summary).toEqual([])
}

describe('/demo — two phones, one loop', () => {
  it('shows both phones as titled frames, the controls and a short script', async () => {
    renderRoute('/demo')

    expect(screen.getByRole('heading', { level: 1, name: 'Two phones, one loop' })).toBeInTheDocument()
    expect(screen.getByTitle(KAMLA)).toHaveAttribute('src', '/')
    expect(screen.getByTitle(RAHUL)).toHaveAttribute('src', '/family')
    expect(screen.getByRole('figure', { name: /Kamla’s phone/ })).toBeInTheDocument()
    expect(screen.getByRole('figure', { name: /Rahul’s phone/ })).toBeInTheDocument()

    // Not set up yet: say where to start.
    expect(screen.getByText(/start here: load the demo profile/i)).toBeInTheDocument()
    const controls = screen.getByRole('region', { name: 'Demo controls' })
    for (const name of ['Load demo profile', 'Start the scam call on Kamla’s phone', 'Open the bank app on Kamla’s phone', 'Reset']) {
      expect(within(controls).getByRole('button', { name })).toBeInTheDocument()
    }
    const script = screen.getByRole('region', { name: 'The 60-second demo' })
    expect(within(script).getAllByRole('listitem')).toHaveLength(6)

    await expectNoAxeViolationsOutsideFrames()
  })

  it('loads the demo profile and restarts both phones', async () => {
    renderRoute('/demo')
    const kamlaBefore = screen.getByTitle(KAMLA)
    const rahulBefore = screen.getByTitle(RAHUL)

    await userEvent.click(screen.getByRole('button', { name: 'Load demo profile' }))

    const s = useStore.getState()
    expect(s.setup.elderName).toBe('Kamla Devi')
    expect(s.people.map((p) => p.name)).toEqual(['Rahul'])
    // New iframe elements = the frames reloaded with the new profile.
    expect(screen.getByTitle(KAMLA)).not.toBe(kamlaBefore)
    expect(screen.getByTitle(RAHUL)).not.toBe(rahulBefore)
    expect(screen.getByText('Demo profile loaded. Both phones have restarted.')).toBeInTheDocument()
    expect(screen.queryByText(/start here/i)).not.toBeInTheDocument()
  })

  it('starts the scam call on Kamla’s phone, from a clean slate', async () => {
    withDemoProfile()
    useStore.getState().sendAlert('person_rahul')
    renderRoute('/demo')

    await userEvent.click(screen.getByRole('button', { name: 'Start the scam call on Kamla’s phone' }))

    expect(screen.getByTitle(KAMLA)).toHaveAttribute('src', '/call')
    expect(screen.getByTitle(RAHUL)).toHaveAttribute('src', '/family')
    expect(useStore.getState().incident.alertSentAt).toBeNull()
  })

  it('opens the bank app on Kamla’s phone, and Reset brings both phones back', async () => {
    withDemoProfile()
    renderRoute('/demo')

    await userEvent.click(screen.getByRole('button', { name: 'Open the bank app on Kamla’s phone' }))
    expect(screen.getByTitle(KAMLA)).toHaveAttribute('src', '/transfer')

    act(() => {
      useStore.getState().requestTransfer({ amount: 200000, payeeName: 'RBI Safe Account – Verification', payeeIsNew: true })
    })
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(useStore.getState().incident.transfer).toBeNull()
    expect(screen.getByTitle(KAMLA)).toHaveAttribute('src', '/')
  })

  it('reads out the shared loop live as either phone changes it', () => {
    withDemoProfile()
    renderRoute('/demo')
    const status = screen.getByRole('region', { name: 'What is happening now' })
    const value = (label: string) => within(status).getByText(label).nextElementSibling?.textContent

    expect(value('Scam call')).toBe('Not started')
    expect(value('Payment')).toBe('None')

    act(() => useStore.getState().startCall())
    expect(value('Scam call')).toBe('Running (practice)')

    act(() => {
      useStore.getState().sendAlert('person_rahul')
      useStore.getState().requestTransfer({ amount: 200000, payeeName: 'RBI Safe Account – Verification', payeeIsNew: true })
    })
    expect(value('Alert to family')).toMatch(/^Sent at /)
    expect(value('Payment')).toBe('₹2,00,000 paused')

    act(() => useStore.getState().familyDecide('block'))
    expect(value('Payment')).toBe('₹2,00,000 blocked by Rahul')
    expect(value('Rahul')).toBe('Blocked the payment')
  })

  it('works in Hindi', () => {
    useStore.getState().setPrefs({ lang: 'hi' })
    renderRoute('/demo')
    expect(screen.getByRole('heading', { level: 1, name: 'दो फ़ोन, एक कड़ी' })).toBeInTheDocument()
    expect(screen.getByTitle('कमला जी का फ़ोन: रुको, जैसा कमला जी देखती हैं')).toBeInTheDocument()
  })
})
