import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { useStore } from '../../state/store'
import { expectNoAxeViolations, renderRoute, withDemoProfile } from '../../test/utils'

const Q1 = 'Did they tell you to keep this secret, even from your family?'
const Q2 = 'Did they ask you to move money to a safe or verification account?'
const Q3 = 'Are they keeping you on a video call, or telling you not to hang up?'

describe('/check/:step — one question per page', () => {
  it('shows question 1 as the page title, with progress, why we ask and three named answers', async () => {
    withDemoProfile()
    renderRoute('/check/1')

    expect(screen.getByRole('heading', { level: 1, name: Q1 })).toBeInTheDocument()
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument()
    expect(screen.getByText('Why we ask')).toBeInTheDocument()
    expect(screen.getByText(/no one in your family can warn you/i)).toBeInTheDocument()

    // The radio group's accessible name is the question itself.
    const group = screen.getByRole('group', { name: Q1 })
    const radios = within(group).getAllByRole('radio')
    expect(radios.map((r) => r.getAttribute('value'))).toEqual(['yes', 'no', 'unsure'])
    expect(within(group).getByRole('radio', { name: /not sure/i })).toBeInTheDocument()
    expect(within(group).getByText('It is okay not to know.')).toBeInTheDocument()

    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/pause')
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()

    await expectNoAxeViolations()
  })

  it('Continue with nothing chosen shows a message, focuses it, and does not move on', async () => {
    const user = userEvent.setup()
    withDemoProfile()
    const { router } = renderRoute('/check/1')

    await user.click(screen.getByRole('button', { name: 'Continue' }))
    const error = screen.getByText('Please choose one answer. If you do not know, choose Not sure.')
    expect(error.closest('p')).toHaveFocus()
    expect(router.state.location.pathname).toBe('/check/1')
    await expectNoAxeViolations()

    // Pressing again moves focus back to the message (e.g. after tabbing away).
    await user.tab()
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    expect(error.closest('p')).toHaveFocus()

    // Choosing an answer clears the message.
    await user.click(screen.getByRole('radio', { name: /not sure/i }))
    expect(screen.queryByText(/please choose one answer/i)).not.toBeInTheDocument()
  })

  it('saves the answer the moment it is tapped, then continues to the next question', async () => {
    const user = userEvent.setup()
    withDemoProfile()
    const { router } = renderRoute('/check/1')

    await user.click(screen.getByRole('radio', { name: 'Yes' }))
    expect(useStore.getState().incident.answers).toEqual({ secrecy: 'yes' })

    await user.click(screen.getByRole('button', { name: 'Continue' }))
    expect(router.state.location.pathname).toBe('/check/2')
    expect(screen.getByRole('heading', { level: 1, name: Q2 })).toBeInTheDocument()
    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument()
    // A fresh question: nothing chosen and no leftover error.
    expect(screen.getByRole('group', { name: Q2 })).toBeInTheDocument()
    expect(screen.queryAllByRole('radio', { checked: true })).toHaveLength(0)
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/check/1')
  })

  it('works with the keyboard: arrow keys change the answer and save it', async () => {
    const user = userEvent.setup()
    withDemoProfile()
    renderRoute('/check/2')

    await user.click(screen.getByRole('radio', { name: 'Yes' }))
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('radio', { name: 'No' })).toBeChecked()
    expect(useStore.getState().incident.answers.moneyMove).toBe('no')
  })

  it('keeps earlier answers when going back', async () => {
    const user = userEvent.setup()
    withDemoProfile()
    useStore.getState().answerCheck('secrecy', 'unsure')
    const { router } = renderRoute('/check/2')

    await user.click(screen.getByRole('link', { name: 'Back' }))
    expect(router.state.location.pathname).toBe('/check/1')
    expect(screen.getByRole('radio', { name: /not sure/i })).toBeChecked()
  })

  it('the last question says "See the result" and goes to the result', async () => {
    const user = userEvent.setup()
    withDemoProfile()
    useStore.getState().answerCheck('secrecy', 'no')
    useStore.getState().answerCheck('moneyMove', 'no')
    const { router } = renderRoute('/check/3')

    expect(screen.getByRole('heading', { level: 1, name: Q3 })).toBeInTheDocument()
    expect(screen.getByText('Step 3 of 3')).toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: 'No' }))
    await user.click(screen.getByRole('button', { name: 'See the result' }))
    expect(router.state.location.pathname).toBe('/check/result')
    await expectNoAxeViolations()
  })

  it('sends an unknown step, or /check on its own, to question 1', () => {
    for (const path of ['/check/7', '/check/0', '/check/abc', '/check']) {
      const { router, unmount } = renderRoute(path)
      expect(router.state.location.pathname).toBe('/check/1')
      expect(screen.getByRole('heading', { level: 1, name: Q1 })).toBeInTheDocument()
      unmount()
    }
  })

  it('speaks Hindi, and keeps the question and the group name the same', async () => {
    withDemoProfile()
    useStore.getState().setPrefs({ lang: 'hi' })
    renderRoute('/check/3')
    const q = 'क्या वे आपको वीडियो कॉल पर रोके हुए हैं, या फ़ोन न काटने को कह रहे हैं?'
    expect(screen.getByRole('heading', { level: 1, name: q })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: q })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /पक्का नहीं पता/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'नतीजा देखें' })).toBeInTheDocument()
    await expectNoAxeViolations()
  })

  it('Easy Read gives the shorter explanation', () => {
    withDemoProfile()
    useStore.getState().setPrefs({ easyRead: true })
    renderRoute('/check/2')
    expect(screen.getByText('A “safe account” is really the scammer’s own account.')).toBeInTheDocument()
  })

  it('shows the design notes when they are on', async () => {
    withDemoProfile()
    useStore.getState().setPrefs({ designNotes: true })
    renderRoute('/check/1')
    expect(screen.getByRole('complementary', { name: /one question per page/i })).toBeInTheDocument()
    expect(screen.getByRole('complementary', { name: /a clear message, not a grey button/i })).toBeInTheDocument()
    await expectNoAxeViolations()
  })
})
