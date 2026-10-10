import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useStore } from '../../state/store'
import { expectNoAxeViolations, renderRoute, withDemoProfile } from '../../test/utils'

const CORE = 'Real police never arrest anyone on a video call. You do not have to pay.'
const LAW = 'There is no digital arrest in Indian law.'

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

describe('/pause — the calm card', () => {
  it('opens the pause, shows the calm message and the two clear choices, with no axe violations', async () => {
    withDemoProfile()
    renderRoute('/pause')

    expect(screen.getByRole('heading', { level: 1, name: 'You are safe. Take a breath.' })).toBeInTheDocument()
    expect(screen.getByText(CORE)).toBeInTheDocument()
    expect(screen.getByText(LAW)).toBeInTheDocument()
    expect(useStore.getState().incident.pauseOpenedAt).not.toBeNull()

    const tell = screen.getByRole('link', { name: 'Tell Rahul' })
    expect(tell).toHaveAttribute('href', '/tell')
    expect(tell).toHaveAccessibleDescription(/rahul gets a quiet message/i)
    expect(screen.getByRole('link', { name: 'Check this call' })).toHaveAttribute('href', '/check/1')
    expect(screen.getByRole('link', { name: /money already sent/i })).toHaveAttribute('href', '/golden-hour')
    expect(screen.getByText(/you can hang up\. real officers send written notices/i)).toBeInTheDocument()

    await expectNoAxeViolations()
  })

  it('keeps the first time the pause opened (safe for repeat visits)', () => {
    withDemoProfile()
    useStore.getState().openPause()
    const first = useStore.getState().incident.pauseOpenedAt
    renderRoute('/pause')
    expect(useStore.getState().incident.pauseOpenedAt).toBe(first)
  })

  it('without a trusted person, points to adding one with a hint', async () => {
    renderRoute('/pause')
    const add = screen.getByRole('link', { name: /add a trusted person/i })
    expect(add).toHaveAttribute('href', '/setup/person')
    expect(add).toHaveAccessibleDescription(/not added a trusted person yet/i)
    expect(screen.queryByRole('link', { name: /^tell/i })).not.toBeInTheDocument()
    await expectNoAxeViolations()
  })

  it('reads exactly the card text aloud when Read aloud is on', () => {
    const speak = installFakeSpeech()
    withDemoProfile()
    useStore.getState().setPrefs({ readAloud: true })
    renderRoute('/pause')
    expect(speak).toHaveBeenCalledTimes(1)
    const utterance = speak.mock.calls[0][0] as { text: string }
    expect(utterance.text).toBe(`${CORE} ${LAW}`)
    expect(screen.getByRole('button', { name: 'Stop' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('does not speak by itself when Read aloud is off, but offers Listen', async () => {
    const speak = installFakeSpeech()
    withDemoProfile()
    renderRoute('/pause')
    expect(speak).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole('button', { name: /listen/i }))
    expect(speak).toHaveBeenCalledTimes(1)
  })

  it('breathing circle can be stopped, and is static under reduced motion', async () => {
    withDemoProfile()
    useStore.getState().setPrefs({ motion: 'full' })
    const { container, unmount } = renderRoute('/pause')
    expect(container.querySelector('[data-breathing]')).toHaveAttribute('data-breathing', 'true')
    await userEvent.click(screen.getByRole('button', { name: /stop the circle/i }))
    expect(container.querySelector('[data-breathing]')).toHaveAttribute('data-breathing', 'false')
    expect(screen.getByRole('button', { name: /start the circle/i })).toBeInTheDocument()
    unmount()

    useStore.getState().setPrefs({ motion: 'reduce' })
    const second = renderRoute('/pause')
    expect(second.container.querySelector('[data-breathing]')).toHaveAttribute('data-breathing', 'false')
    expect(screen.queryByRole('button', { name: /the circle/i })).not.toBeInTheDocument()
    expect(screen.getByText(/breathe in slowly for 4 seconds/i)).toBeInTheDocument()
  })

  it('works in Hindi', () => {
    withDemoProfile()
    useStore.getState().setPrefs({ lang: 'hi' })
    renderRoute('/pause')
    expect(screen.getByRole('heading', { level: 1, name: 'आप सुरक्षित हैं। एक लंबी साँस लीजिए।' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Rahul को बताएँ' })).toBeInTheDocument()
  })

  it('shows design notes when they are on', () => {
    withDemoProfile()
    useStore.getState().setPrefs({ designNotes: true })
    renderRoute('/pause')
    expect(screen.getByRole('complementary', { name: /help without hanging up/i })).toBeInTheDocument()
    expect(screen.getByRole('complementary', { name: /a fact, not a verdict/i })).toBeInTheDocument()
  })
})
