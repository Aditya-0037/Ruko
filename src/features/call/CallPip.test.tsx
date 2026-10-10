import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { useStore } from '../../state/store'
import { expectNoAxeViolations, renderRoute, withDemoProfile } from '../../test/utils'

function runningCall(agoMs = 192_000) {
  const startedAt = Date.now() - agoMs
  useStore.setState((s) => ({
    incident: { ...s.incident, id: 'incident_pip', startedAt, callActive: true, callStartedAt: startedAt, callerLabel: 'CBI Mumbai' },
  }))
}

const pip = () => screen.queryByRole('complementary', { name: /call still running/i })

describe('CallPip', () => {
  it('is hidden when no call is running', () => {
    withDemoProfile()
    renderRoute('/pause')
    expect(pip()).not.toBeInTheDocument()
  })

  it('shows the running call with timer, caller, reassurance and actions — and passes axe', async () => {
    withDemoProfile()
    runningCall()
    renderRoute('/pause')
    const bar = pip()
    expect(bar).toBeInTheDocument()
    expect(bar).toHaveTextContent(/call still running/i)
    expect(bar).toHaveTextContent('03:12')
    expect(bar).toHaveTextContent(/cbi mumbai \(demo\)/i)
    expect(bar).toHaveTextContent(/the caller cannot see ruko/i)
    expect(screen.getByRole('link', { name: /return to call/i })).toHaveAttribute('href', '/call')
    expect(screen.getByRole('button', { name: /end call/i })).toBeInTheDocument()
    // Not a live region: the per-second timer is never announced.
    expect(bar?.querySelector('[aria-live]')).toBeNull()
    await expectNoAxeViolations()
  })

  it('sits before the page, outside the sticky top bar', () => {
    withDemoProfile()
    runningCall()
    renderRoute('/pause')
    const bar = pip()!
    const header = document.querySelector('header')!
    expect(bar.compareDocumentPosition(header) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(header.contains(bar)).toBe(false)
  })

  it.each(['/call', '/demo', '/family'])('is hidden on %s', (path) => {
    withDemoProfile()
    runningCall()
    renderRoute(path)
    expect(pip()).not.toBeInTheDocument()
  })

  it('End call ends the call and the bar disappears', async () => {
    withDemoProfile()
    runningCall()
    renderRoute('/tell')
    await userEvent.click(screen.getByRole('button', { name: /end call/i }))
    expect(useStore.getState().incident.callActive).toBe(false)
    expect(pip()).not.toBeInTheDocument()
    expect(await screen.findByText(/you can always hang up/i)).toBeInTheDocument()
  })

  it('Return to call goes back to the connected call', async () => {
    withDemoProfile()
    runningCall(10_000)
    const { router } = renderRoute('/pause')
    await userEvent.click(screen.getByRole('link', { name: /return to call/i }))
    expect(router.state.location.pathname).toBe('/call')
    expect(screen.getByRole('button', { name: /ruko — pause safely/i })).toBeInTheDocument()
    expect(useStore.getState().incident.id).toBe('incident_pip')
  })
})
