import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useStore } from '../../state/store'
import { expectNoAxeViolations, renderRoute, withDemoProfile } from '../../test/utils'
import { parseStep } from './DrillPage'

/** jsdom has no speech synthesis: install a minimal fake so ListenButton renders and speaks. */
function installFakeSpeech() {
  const speak = vi.fn()
  Object.defineProperty(window, 'speechSynthesis', {
    configurable: true,
    value: { speak, cancel: vi.fn(), getVoices: () => [] },
  })
  Object.defineProperty(window, 'SpeechSynthesisUtterance', {
    configurable: true,
    value: class {
      text: string
      lang = ''
      rate = 1
      pitch = 1
      voice: unknown = null
      onend: unknown = null
      onerror: unknown = null
      constructor(text: string) {
        this.text = text
      }
    },
  })
  return speak
}

afterEach(() => {
  const w = window as unknown as Record<string, unknown>
  delete w.speechSynthesis
  delete w.SpeechSynthesisUtterance
})

const step2 = () => screen.getByRole('heading', { level: 2, name: 'Find the Ruko button and press it' })

describe('/drill — Practise the pause', () => {
  it('walks through all five steps with warm feedback and no failure state', async () => {
    const user = userEvent.setup()
    withDemoProfile()
    const { router } = renderRoute('/drill')

    // 1 — imagine the call
    expect(screen.getByRole('heading', { level: 1, name: 'Practise the pause' })).toBeInTheDocument()
    expect(screen.getByText('2 minutes. No wrong answers.')).toBeInTheDocument()
    expect(screen.getByText('Step 1 of 5')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /pretend “police officer”/i })).toBeInTheDocument()
    expect(screen.getByText('Practice')).toBeInTheDocument()
    expect(screen.getByText('This is only practice. Nobody is calling you.')).toBeInTheDocument()
    await expectNoAxeViolations()
    await user.click(screen.getByRole('button', { name: 'I can picture it' }))

    // 2 — press the real Ruko button
    expect(step2()).toBeInTheDocument()
    expect(screen.getByText('Step 2 of 5')).toBeInTheDocument()
    expect(router.state.location.search).toBe('?step=2')
    expect(screen.getByText('Good. Now let’s practise what to do.')).toBeInTheDocument()
    await expectNoAxeViolations()
    await user.click(screen.getByRole('button', { name: /ruko.*press me/i }))

    // 3 — the family code word, hidden until asked for
    expect(screen.getByRole('heading', { level: 2, name: 'Say your family code word out loud' })).toBeInTheDocument()
    expect(screen.getByText('Well done! You found it.')).toBeInTheDocument()
    expect(screen.queryByText('Gulmohar')).not.toBeInTheDocument()
    const reveal = screen.getByRole('button', { name: 'Show my code word' })
    expect(reveal).toHaveAttribute('aria-expanded', 'false')
    await user.click(reveal)
    expect(screen.getByText('Gulmohar')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hide my code word' })).toHaveAttribute('aria-expanded', 'true')
    await expectNoAxeViolations()
    await user.click(screen.getByRole('button', { name: 'I said it' }))

    // 4 — know who to tell
    expect(screen.getByRole('heading', { level: 2, name: 'Know who to tell' })).toBeInTheDocument()
    expect(screen.getByText('Lovely. Your word keeps fake “family” calls out.')).toBeInTheDocument()
    expect(screen.queryByText('Gulmohar')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Call Rahul' })).toHaveAttribute('href', 'tel:+919876543210')
    expect(screen.getByText(/call 1930, the national cyber crime helpline/i)).toBeInTheDocument()
    await expectNoAxeViolations()
    expect(useStore.getState().setup.drillCompletedAt).toBeNull()
    await user.click(screen.getByRole('button', { name: 'I know who to tell' }))

    // 5 — done
    expect(screen.getByRole('heading', { level: 2, name: 'You practised the pause!' })).toBeInTheDocument()
    expect(screen.getByText('Step 5 of 5')).toBeInTheDocument()
    expect(
      screen.getByText('If a call ever scares you: press Ruko, take a breath, and tell Rahul.'),
    ).toBeInTheDocument()
    await waitFor(() => expect(useStore.getState().setup.drillCompletedAt).not.toBeNull())
    expect(screen.getByText(/^Practised at /)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Practise with a demo call' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back home' })).toHaveAttribute('href', '/')
    await expectNoAxeViolations()
  })

  it('moves focus to the new step so screen readers hear what changed', async () => {
    const user = userEvent.setup()
    withDemoProfile()
    renderRoute('/drill')
    await user.click(screen.getByRole('button', { name: 'I can picture it' }))
    // Praise first (it sits above the heading), then the person reads on to the step.
    expect(screen.getByText('Good. Now let’s practise what to do.').closest('[tabindex="-1"]')).toHaveFocus()

    await user.click(screen.getByRole('button', { name: 'Previous step' }))
    expect(screen.getByRole('heading', { level: 2, name: 'Imagine this call' })).toHaveFocus()
  })

  it('lets every step be skipped or gone back, without judgement', async () => {
    const user = userEvent.setup()
    withDemoProfile()
    renderRoute('/drill?step=3')

    await user.click(screen.getByRole('button', { name: 'Previous step' }))
    expect(step2()).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /ruko.*press me/i }))
    await user.click(screen.getByRole('button', { name: 'Skip this step' }))
    expect(screen.getByRole('heading', { level: 2, name: 'Know who to tell' })).toBeInTheDocument()
    expect(screen.getByText('No problem. Let’s carry on.')).toBeInTheDocument()
  })

  it('without a code word or trusted person, links to set them up and still moves on', async () => {
    const user = userEvent.setup()
    renderRoute('/drill?step=3')

    expect(screen.getByText('You have not chosen a code word yet')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Choose a code word' })).toHaveAttribute('href', '/setup/code-word')
    await expectNoAxeViolations()
    await user.click(screen.getByRole('button', { name: 'Carry on without one' }))

    expect(screen.getByRole('link', { name: 'Add a trusted person' })).toHaveAttribute('href', '/setup/person')
    await expectNoAxeViolations()
    await user.click(screen.getByRole('button', { name: 'I know who to tell' }))

    expect(
      screen.getByText('If a call ever scares you: press Ruko, take a breath, and tell someone you trust.'),
    ).toBeInTheDocument()
  })

  it('"Practise with a demo call" starts a practice call and opens it', async () => {
    const user = userEvent.setup()
    withDemoProfile()
    const { router } = renderRoute('/drill?step=5')

    await user.click(screen.getByRole('button', { name: 'Practise with a demo call' }))

    expect(useStore.getState().incident.callActive).toBe(true)
    await waitFor(() => expect(router.state.location.pathname).toBe('/call'))
  })

  it('"Do the steps again" returns to step 1 and the record of practice stays', async () => {
    const user = userEvent.setup()
    withDemoProfile()
    const { router } = renderRoute('/drill?step=5')
    await waitFor(() => expect(useStore.getState().setup.drillCompletedAt).not.toBeNull())

    await user.click(screen.getByRole('button', { name: 'Do the steps again' }))

    expect(screen.getByRole('heading', { level: 2, name: 'Imagine this call' })).toBeInTheDocument()
    expect(router.state.location.search).toBe('')
    expect(useStore.getState().setup.drillCompletedAt).not.toBeNull()
  })

  it('keeps the celebration completely still under reduced motion', () => {
    withDemoProfile()
    useStore.getState().setPrefs({ motion: 'reduce' })
    const { container } = renderRoute('/drill?step=5')
    expect(container.querySelector('.still')).not.toBeNull()
  })

  it('shows design notes for judges on the first and last steps', async () => {
    withDemoProfile()
    useStore.getState().setPrefs({ designNotes: true })
    renderRoute('/drill')
    expect(
      screen.getByRole('complementary', { name: 'Design note: Rehearsal makes the pause automatic' }),
    ).toBeInTheDocument()
    await expectNoAxeViolations()
  })

  it('speaks Hindi warmly', async () => {
    const user = userEvent.setup()
    withDemoProfile()
    useStore.getState().setPrefs({ lang: 'hi' })
    renderRoute('/drill?step=2')
    expect(screen.getByRole('heading', { level: 1, name: 'रुकने का अभ्यास' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /रुको.*मुझे दबाइए/ }))
    expect(screen.getByText('शाबाश! आपने ढूँढ लिया।')).toBeInTheDocument()
    await expectNoAxeViolations()
  })
})

describe('/drill — read aloud', () => {
  it('reads each step aloud, word for word, when Read aloud is on', async () => {
    const speak = installFakeSpeech()
    const user = userEvent.setup()
    withDemoProfile()
    useStore.getState().setPrefs({ readAloud: true })
    renderRoute('/drill')

    const spokenText = () => (speak.mock.calls.at(-1)?.[0] as { text: string } | undefined)?.text
    expect(spokenText()).toContain('Imagine this call.')
    expect(spokenText()).toContain('This is only practice. Nobody is calling you.')

    await user.click(screen.getByRole('button', { name: 'I can picture it' }))
    expect(spokenText()).toBe(
      'Find the Ruko button and press it. On your home screen it is the big round button. Press this one now.',
    )
    expect(screen.getByRole('button', { name: 'Stop' })).toBeInTheDocument()
    await expectNoAxeViolations()
  })

  it('offers a Listen button without speaking when Read aloud is off', () => {
    const speak = installFakeSpeech()
    withDemoProfile()
    renderRoute('/drill')
    expect(screen.getByRole('button', { name: 'Listen' })).toBeInTheDocument()
    expect(speak).not.toHaveBeenCalled()
  })
})

describe('parseStep', () => {
  it('accepts 1 to 5 and falls back to 1', () => {
    expect(parseStep('3')).toBe(3)
    expect(parseStep(null)).toBe(1)
    expect(parseStep('0')).toBe(1)
    expect(parseStep('9')).toBe(1)
    expect(parseStep('2.5')).toBe(1)
  })
})
