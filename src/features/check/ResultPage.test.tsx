import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useStore } from '../../state/store'
import type { CheckAnswer, SignalId } from '../../state/types'
import { expectNoAxeViolations, renderRoute, withDemoProfile } from '../../test/utils'

function answer(a: Partial<Record<SignalId, CheckAnswer>>) {
  for (const [id, value] of Object.entries(a)) useStore.getState().answerCheck(id as SignalId, value)
}

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

const reasonsList = () => {
  const heading = screen.getByRole('heading', { level: 2, name: /why ruko says this|some answers were not sure|not answered yet|still, stay careful/i })
  return within(heading.parentElement as HTMLElement).getByRole('list')
}

describe('/check/result — scam', () => {
  it('says it plainly, lists exactly which answers matched, and offers the next step', async () => {
    withDemoProfile()
    answer({ secrecy: 'yes', moneyMove: 'no', videoHold: 'yes' })
    renderRoute('/check/result')

    expect(screen.getByRole('heading', { level: 1, name: 'This matches a digital-arrest scam.' })).toBeInTheDocument()
    expect(screen.getByText('You did the right thing by stopping to check.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Why Ruko says this' })).toBeInTheDocument()

    const items = within(reasonsList()).getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent(
      'They asked you to keep it secret.Real police never ask you to hide an investigation from your family.',
    )
    expect(items[1]).toHaveTextContent('They are keeping you on a video call.')
    expect(items[1]).toHaveTextContent('Real officers never arrest anyone on a video call.')
    expect(screen.queryByText(/move money to a “safe” account/i)).not.toBeInTheDocument()

    expect(screen.getByText('It is safe to hang up now.')).toBeInTheDocument()
    const tell = screen.getByRole('link', { name: 'Tell Rahul' })
    expect(tell).toHaveAttribute('href', '/tell')
    expect(tell).toHaveAccessibleDescription('Rahul gets a quiet message. The caller will not know.')
    const call = screen.getByRole('link', { name: 'Call 1930' })
    expect(call).toHaveAttribute('href', 'tel:1930')
    expect(call).toHaveAccessibleDescription(/national cyber crime helpline/i)
    expect(screen.queryByRole('link', { name: 'Back to home' })).not.toBeInTheDocument()

    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/check/3')
    await expectNoAxeViolations()
  })

  it('always explains what real officers do', () => {
    withDemoProfile()
    answer({ secrecy: 'yes', moneyMove: 'yes', videoHold: 'yes' })
    renderRoute('/check/result')
    const card = screen.getByRole('heading', { level: 2, name: 'What real officers do' }).parentElement as HTMLElement
    expect(within(card).getByText('They send a written notice.')).toBeInTheDocument()
    expect(within(card).getByText('They never ask you for money, or to move money.')).toBeInTheDocument()
    expect(within(card).getByText('They never arrest anyone on a video call.')).toBeInTheDocument()
    expect(within(card).getByText('There is no “digital arrest” in Indian law.')).toBeInTheDocument()
    expect(within(reasonsList()).getAllByRole('listitem')).toHaveLength(3)
  })

  it('shows every answer, and "Change my answers" goes back to question 1 with answers kept', async () => {
    const user = userEvent.setup()
    withDemoProfile()
    answer({ secrecy: 'yes', moneyMove: 'unsure', videoHold: 'no' })
    const { router } = renderRoute('/check/result')

    const summary = screen.getByRole('heading', { level: 2, name: 'Your answers' }).parentElement as HTMLElement
    const terms = within(summary).getAllByRole('term').map((el) => el.textContent)
    const values = within(summary).getAllByRole('definition').map((el) => el.textContent)
    expect(terms).toEqual(['Told to keep it secret', 'Asked to move money', 'Kept on a video call'])
    expect(values).toEqual(['Yes', 'Not sure', 'No'])

    const change = screen.getByRole('link', { name: 'Change my answers' })
    expect(change).toHaveAccessibleDescription('Your answers stay filled in. Change any you like.')
    await user.click(change)
    expect(router.state.location.pathname).toBe('/check/1')
    expect(screen.getByRole('radio', { name: 'Yes' })).toBeChecked()
    expect(useStore.getState().incident.answers).toEqual({ secrecy: 'yes', moneyMove: 'unsure', videoHold: 'no' })
  })

  it('says when the trusted person was already told', () => {
    withDemoProfile()
    answer({ secrecy: 'yes', moneyMove: 'no', videoHold: 'no' })
    useStore.getState().sendAlert()
    renderRoute('/check/result')
    expect(screen.getByText(/^You told Rahul at /)).toBeInTheDocument()
  })

  it('reads exactly the verdict aloud when Read aloud is on', () => {
    const speak = installFakeSpeech()
    withDemoProfile()
    useStore.getState().setPrefs({ readAloud: true })
    answer({ secrecy: 'yes', moneyMove: 'no', videoHold: 'no' })
    renderRoute('/check/result')
    expect(speak).toHaveBeenCalledTimes(1)
    const { text } = speak.mock.calls[0][0] as { text: string }
    expect(text).toBe(
      'This matches a digital-arrest scam. You did the right thing by stopping to check. They asked you to keep it secret. Real police never ask you to hide an investigation from your family. It is safe to hang up now. You do not have to explain anything to the caller.',
    )
  })

  it('offers Listen without speaking by itself', async () => {
    const user = userEvent.setup()
    const speak = installFakeSpeech()
    withDemoProfile()
    answer({ secrecy: 'yes', moneyMove: 'no', videoHold: 'no' })
    renderRoute('/check/result')
    expect(speak).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Listen' }))
    expect(speak).toHaveBeenCalledTimes(1)
    await expectNoAxeViolations()
  })
})

describe('/check/result — not sure', () => {
  it('treats the call as a scam until the trusted person checks, and lists what was not sure', async () => {
    withDemoProfile()
    answer({ secrecy: 'no', moneyMove: 'unsure', videoHold: 'no' })
    renderRoute('/check/result')

    expect(
      screen.getByRole('heading', { level: 1, name: 'Treat this call as a scam until Rahul checks.' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Some answers were not sure' })).toBeInTheDocument()
    expect(screen.getByText(/the safest thing is to pause and let rahul check with you/i)).toBeInTheDocument()
    const items = within(reasonsList()).getAllByRole('listitem')
    expect(items).toHaveLength(1)
    expect(items[0]).toHaveTextContent('You were not sure if they asked you to move money.')

    expect(screen.getByText('It is safe to hang up now.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Tell Rahul' })).toHaveAttribute('href', '/tell')
    expect(screen.getByRole('link', { name: 'Call 1930' })).toHaveAttribute('href', 'tel:1930')
    await expectNoAxeViolations()
  })

  it('without a trusted person, still gives a clear next step', () => {
    answer({ secrecy: 'unsure', moneyMove: 'no', videoHold: 'no' })
    renderRoute('/check/result')
    expect(
      screen.getByRole('heading', { level: 1, name: 'Treat this call as a scam until someone you trust checks.' }),
    ).toBeInTheDocument()
    const tell = screen.getByRole('link', { name: 'Tell someone you trust' })
    expect(tell).toHaveAttribute('href', '/tell')
    expect(tell).toHaveAccessibleDescription(/add a trusted person/i)
  })

  it('points to unanswered questions', async () => {
    const user = userEvent.setup()
    withDemoProfile()
    answer({ secrecy: 'no' })
    const { router } = renderRoute('/check/result')
    expect(screen.getByRole('heading', { level: 2, name: 'Some questions are not answered yet' })).toBeInTheDocument()
    const items = within(reasonsList()).getAllByRole('listitem')
    expect(items.map((li) => li.textContent)).toEqual([
      'You have not answered the question about moving money.',
      'You have not answered the question about the video call.',
    ])
    await user.click(screen.getByRole('link', { name: 'Answer the remaining questions' }))
    expect(router.state.location.pathname).toBe('/check/2')
  })

  it('with no answers at all, starts the check instead', () => {
    withDemoProfile()
    const { router } = renderRoute('/check/result')
    expect(router.state.location.pathname).toBe('/check/1')
  })
})

describe('/check/result — clear', () => {
  it('reassures without over-promising, and goes back home', async () => {
    withDemoProfile()
    answer({ secrecy: 'no', moneyMove: 'no', videoHold: 'no' })
    renderRoute('/check/result')

    expect(screen.getByRole('heading', { level: 1, name: 'No warning signs from your answers.' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Still, stay careful' })).toBeInTheDocument()
    const items = within(reasonsList()).getAllByRole('listitem')
    expect(items.map((li) => li.textContent)).toEqual([
      'Never share an OTP or PIN. An OTP is the code that comes in an SMS.',
      'Never move money while you are on a call.',
      'If anything feels wrong, press Ruko.',
    ])
    expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/')
    expect(screen.queryByText('It is safe to hang up now.')).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Call 1930' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'What real officers do' })).toBeInTheDocument()
    await expectNoAxeViolations()
  })
})

describe('/check/result — language and notes', () => {
  it('works in Hindi', async () => {
    withDemoProfile()
    useStore.getState().setPrefs({ lang: 'hi' })
    answer({ secrecy: 'yes', moneyMove: 'no', videoHold: 'no' })
    renderRoute('/check/result')
    expect(
      screen.getByRole('heading', { level: 1, name: 'यह डिजिटल अरेस्ट वाले धोखे से मेल खाता है।' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Rahul को बताएँ' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '1930 पर कॉल करें' })).toHaveAttribute('href', 'tel:1930')
    expect(screen.getByText('अब फ़ोन काट देना पूरी तरह सुरक्षित है।')).toBeInTheDocument()
    await expectNoAxeViolations()
  })

  it('shows the design notes when they are on', async () => {
    withDemoProfile()
    useStore.getState().setPrefs({ designNotes: true })
    answer({ secrecy: 'yes', moneyMove: 'unsure', videoHold: 'yes' })
    renderRoute('/check/result')
    expect(screen.getByRole('complementary', { name: /rules you can explain, not an ai verdict/i })).toBeInTheDocument()
    expect(screen.getByRole('complementary', { name: /not sure means pause/i })).toBeInTheDocument()
    await expectNoAxeViolations()
  })

  it('drops the settle-in animation under reduced motion', () => {
    withDemoProfile()
    answer({ secrecy: 'yes', moneyMove: 'no', videoHold: 'no' })
    useStore.getState().setPrefs({ motion: 'full' })
    const first = renderRoute('/check/result')
    expect(first.container.querySelector('[data-level="scam"]')).toHaveClass('animate')
    first.unmount()

    useStore.getState().setPrefs({ motion: 'reduce' })
    const second = renderRoute('/check/result')
    expect(second.container.querySelector('[data-level="scam"]')).not.toHaveClass('animate')
  })
})
