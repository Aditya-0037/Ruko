import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { useStore } from '../../state/store'
import { expectNoAxeViolations, renderRoute, withDemoProfile } from '../../test/utils'
import { amountInWords, SCAM_PAYEE } from './transferModel'

const amountField = () => screen.getByLabelText('Amount in rupees (₹)')

describe('/transfer — simulated bank app', () => {
  it('is clearly a simulated app beside Ruko, prefilled with the scam', async () => {
    withDemoProfile()
    renderRoute('/transfer')

    expect(screen.getByRole('heading', { level: 1, name: 'Send money (practice)' })).toBeInTheDocument()
    const app = screen.getByRole('region', { name: 'Simulated bank app' })
    expect(within(app).getByText('Practice')).toBeInTheDocument()
    expect(within(app).getByText('Demo Bank')).toBeInTheDocument()
    expect(within(app).getByText(SCAM_PAYEE.name)).toBeInTheDocument()
    expect(within(app).getByText('New payee')).toBeInTheDocument()
    expect(amountField()).toHaveValue('2,00,000')
    expect(within(app).getByText('That is 2 lakh rupees.')).toBeInTheDocument()
    expect(within(app).getByText('Practice only. No real money moves.')).toBeInTheDocument()
    expect(screen.getByText('Ruko works alongside your bank app.')).toBeInTheDocument()
    expect(
      screen.getByText(/your rule steps in only when you send more than ₹10,000 to someone new/i),
    ).toBeInTheDocument()

    await expectNoAxeViolations()
  })

  it('pauses ₹2,00,000 to a new person and opens the paused screen', async () => {
    withDemoProfile()
    const { router } = renderRoute('/transfer')

    await userEvent.click(screen.getByRole('button', { name: 'Send money' }))

    expect(router.state.location.pathname).toBe('/transfer/paused')
    expect(
      await screen.findByRole('heading', { level: 1, name: 'You are sending ₹2,00,000 to a new person.' }),
    ).toBeInTheDocument()
    const tr = useStore.getState().incident.transfer
    expect(tr).toMatchObject({
      amount: 200000,
      payeeName: SCAM_PAYEE.name,
      payeeIsNew: true,
      status: 'paused',
      ruleId: 'rule_default',
      askPersonId: 'person_rahul',
    })
  })

  it('lets a small payment straight through and explains why', async () => {
    withDemoProfile()
    renderRoute('/transfer')

    await userEvent.click(screen.getByRole('button', { name: 'Try ₹500' }))
    expect(amountField()).toHaveValue('500')
    expect(screen.getByText('That is 500 rupees.')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Send money' }))

    const receipt = screen.getByRole('heading', { level: 3, name: '₹500 sent' })
    expect(receipt).toHaveFocus()
    expect(screen.getByText(`to ${SCAM_PAYEE.name}`)).toBeInTheDocument()
    expect(screen.getByText('Ruko stayed out of the way')).toBeInTheDocument()
    expect(screen.getByText(/no rule applied, so the money went through as normal/i)).toBeInTheDocument()
    expect(useStore.getState().incident.transfer?.status).toBe('sent')
    await expectNoAxeViolations()

    // Back to the form, with focus where she types.
    await userEvent.click(screen.getByRole('button', { name: 'Try another payment' }))
    expect(amountField()).toHaveFocus()
  })

  it('does not pause a big payment to a saved payee (the rule is about new people)', async () => {
    withDemoProfile()
    renderRoute('/transfer')

    await userEvent.click(screen.getByRole('radio', { name: 'Saved person' }))
    const app = screen.getByRole('region', { name: 'Simulated bank app' })
    expect(within(app).getByText('Gupta Medical Store')).toBeInTheDocument()
    expect(within(app).getByText('Saved payee')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Send money' }))
    expect(screen.getByRole('heading', { level: 3, name: '₹2,00,000 sent' })).toBeInTheDocument()
    expect(useStore.getState().incident.transfer).toMatchObject({ payeeIsNew: false, status: 'sent', ruleId: null })
  })

  it('formats typed amounts the Indian way and asks for an amount when empty', async () => {
    withDemoProfile()
    renderRoute('/transfer')

    await userEvent.clear(amountField())
    await userEvent.type(amountField(), '1534567')
    expect(amountField()).toHaveValue('15,34,567')
    expect(screen.getByText('That is 15 lakh 34 thousand 567 rupees.')).toBeInTheDocument()

    await userEvent.clear(amountField())
    await userEvent.click(screen.getByRole('button', { name: 'Send money' }))
    expect(screen.getByText('Please type an amount, for example 500.')).toBeInTheDocument()
    expect(amountField()).toHaveAttribute('aria-invalid', 'true')
    expect(amountField()).toHaveFocus()
    expect(useStore.getState().incident.transfer).toBeNull()
    await expectNoAxeViolations()
  })

  it('without a calm-moment rule, says so and offers to set one', async () => {
    renderRoute('/transfer')
    expect(screen.getByText(/you have not set a calm-moment rule yet/i)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Send money' }))
    expect(screen.getByText('You have no calm-moment rule yet, so nothing was paused.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Set a calm-moment rule' })).toHaveAttribute('href', '/setup/rules')
  })

  it('points to a payment that is already paused', () => {
    withDemoProfile()
    useStore.getState().requestTransfer({ amount: 200000, payeeName: SCAM_PAYEE.name, payeeIsNew: true })
    renderRoute('/transfer')
    expect(screen.getByText('A payment of ₹2,00,000 is already paused.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'See the paused payment' })).toHaveAttribute('href', '/transfer/paused')
  })

  it('works in Hindi, marking the English payee name with lang', () => {
    withDemoProfile()
    useStore.getState().setPrefs({ lang: 'hi' })
    renderRoute('/transfer')
    expect(screen.getByRole('heading', { level: 1, name: 'पैसे भेजें (अभ्यास)' })).toBeInTheDocument()
    expect(screen.getByText(SCAM_PAYEE.name)).toHaveAttribute('lang', 'en')
    expect(screen.getByText('यानी 2 लाख रुपये।')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'पैसे भेजें' })).toBeInTheDocument()
  })
})

describe('amountInWords', () => {
  const t = (key: string, vars: Record<string, string | number> = {}) =>
    ({
      'transfer.words.crore': `${vars.n} crore`,
      'transfer.words.lakh': `${vars.n} lakh`,
      'transfer.words.thousand': `${vars.n} thousand`,
      'transfer.words.rupees': `${vars.words} rupees`,
    })[key] ?? key

  it.each([
    [500, '500 rupees'],
    [10000, '10 thousand rupees'],
    [200000, '2 lakh rupees'],
    [250000, '2 lakh 50 thousand rupees'],
    [12345678, '1 crore 23 lakh 45 thousand 678 rupees'],
    [0, '0 rupees'],
  ])('%i → %s', (amount, words) => {
    expect(amountInWords(t, amount)).toBe(words)
  })
})
