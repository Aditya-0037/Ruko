import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useStore } from '../../state/store'
import { expectNoAxeViolations, renderRoute, withDemoProfile } from '../../test/utils'

function seedEvidence() {
  useStore.getState().startCall()
  useStore.getState().openPause()
  useStore.getState().sendAlert('person_rahul')
  useStore.getState().startGoldenHour()
  useStore.getState().updateEvidence({
    amount: '200000',
    transactionId: '412345678901',
    scammerNumber: '+91 90000 11111',
  })
}

const doc = () => screen.getByRole('article', { name: 'Cyber fraud complaint — details' })

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  Reflect.deleteProperty(navigator, 'share')
  Reflect.deleteProperty(navigator, 'clipboard')
})

describe('/golden-hour/pack — complaint pack', () => {
  it('shows a printable document built from the evidence and timeline, with "Not known yet" for gaps', async () => {
    withDemoProfile()
    seedEvidence()
    renderRoute('/golden-hour/pack')

    expect(screen.getByRole('heading', { level: 1, name: 'Your complaint pack' })).toBeInTheDocument()
    expect(screen.getByText('Golden hour · Step 4 of 5')).toBeInTheDocument()

    const article = doc()
    expect(article).toHaveAttribute('lang', 'en')
    expect(within(article).getByRole('heading', { level: 3, name: 'Payment' })).toBeInTheDocument()
    expect(within(article).getByText('₹2,00,000')).toBeInTheDocument()
    expect(within(article).getByText('412345678901')).toBeInTheDocument()
    expect(within(article).getByText('Kamla Devi')).toBeInTheDocument()
    expect(within(article).getAllByText('Not known yet').length).toBeGreaterThan(0)
    expect(within(article).getByText(/they said i was under “digital arrest”/i)).toBeInTheDocument()

    const timeline = within(article).getByRole('heading', { name: 'Timeline' }).parentElement!
    expect(within(timeline).getByText('Alert sent to Rahul')).toBeInTheDocument()
    expect(within(timeline).getByText('Pressed Ruko to pause')).toBeInTheDocument()

    // Where to use it, in plain words.
    const where = screen.getByRole('region', { name: 'Where to use it' })
    expect(within(where).getAllByRole('listitem')).toHaveLength(4)
    expect(within(where).getByText('cybercrime.gov.in')).toHaveAttribute('lang', 'en')

    expect(screen.getByRole('link', { name: 'Change these details' })).toHaveAttribute('href', '/golden-hour/evidence')
    await expectNoAxeViolations()
  })

  it('copies the text with the Clipboard API, confirms with a toast and ticks step 4', async () => {
    withDemoProfile()
    seedEvidence()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    renderRoute('/golden-hour/pack')

    // No share sheet on this device, so Copy is the main action.
    expect(screen.queryByRole('button', { name: 'Share' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Copy text' }))

    expect(writeText).toHaveBeenCalledTimes(1)
    const text = writeText.mock.calls[0][0] as string
    expect(text).toContain('CYBER FRAUD COMPLAINT — DETAILS')
    expect(text).toContain('Amount: ₹2,00,000')
    expect(text).toContain('Paid to (UPI ID or account): Not known yet')
    expect(await screen.findByText('Copied. You can paste it in a message or on the website.')).toBeInTheDocument()
    expect(useStore.getState().goldenHour.checklist.pack).toBe(true)
  })

  it('falls back to the old copy command when the Clipboard API is missing', async () => {
    withDemoProfile()
    const exec = vi.fn().mockReturnValue(true)
    Object.defineProperty(document, 'execCommand', { value: exec, configurable: true })
    renderRoute('/golden-hour/pack')
    const button = screen.getByRole('button', { name: 'Copy text' })
    await userEvent.click(button)
    expect(exec).toHaveBeenCalledWith('copy')
    expect(await screen.findByText(/^copied\./i)).toBeInTheDocument()
    // Focus comes back to the button after the hidden textarea is used.
    expect(button).toHaveFocus()
    Reflect.deleteProperty(document, 'execCommand')
  })

  it('says so kindly when copying is not possible', async () => {
    withDemoProfile()
    Object.defineProperty(document, 'execCommand', { value: vi.fn().mockReturnValue(false), configurable: true })
    renderRoute('/golden-hour/pack')
    await userEvent.click(screen.getByRole('button', { name: 'Copy text' }))
    expect(await screen.findByText('Could not copy. Please select the text and copy it yourself.')).toBeInTheDocument()
    expect(useStore.getState().goldenHour.checklist.pack).toBeUndefined()
    Reflect.deleteProperty(document, 'execCommand')
  })

  it('offers Share when the phone supports it', async () => {
    withDemoProfile()
    seedEvidence()
    const share = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'share', { value: share, configurable: true })
    renderRoute('/golden-hour/pack')
    await userEvent.click(screen.getByRole('button', { name: 'Share' }))
    expect(share).toHaveBeenCalledWith(expect.objectContaining({ title: 'Cyber fraud complaint — details' }))
    expect(useStore.getState().goldenHour.checklist.pack).toBe(true)
    // Copy is still there, as a secondary action.
    expect(screen.getByRole('button', { name: 'Copy text' })).toBeInTheDocument()
  })

  it('prints and downloads the pack', async () => {
    withDemoProfile()
    const print = vi.fn()
    vi.stubGlobal('print', print)
    const createObjectURL = vi.fn().mockReturnValue('blob:pack')
    const revokeObjectURL = vi.fn()
    Object.defineProperty(URL, 'createObjectURL', { value: createObjectURL, configurable: true })
    Object.defineProperty(URL, 'revokeObjectURL', { value: revokeObjectURL, configurable: true })
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    renderRoute('/golden-hour/pack')

    await userEvent.click(screen.getByRole('button', { name: 'Print or save as PDF' }))
    expect(print).toHaveBeenCalledTimes(1)

    await userEvent.click(screen.getByRole('button', { name: 'Download as text file' }))
    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob))
    expect(click).toHaveBeenCalled()
    const link = click.mock.contexts[0] as HTMLAnchorElement
    expect(link.download).toMatch(/^ruko-complaint-pack-\d{4}-\d{2}-\d{2}\.txt$/)
    expect(await screen.findByText(/download started/i)).toBeInTheDocument()
    Reflect.deleteProperty(URL, 'createObjectURL')
    Reflect.deleteProperty(URL, 'revokeObjectURL')
  })

  it('can make the pack in Hindi on an English screen, with the right lang', async () => {
    withDemoProfile()
    seedEvidence()
    renderRoute('/golden-hour/pack')
    await userEvent.click(screen.getByRole('radio', { name: 'हिंदी' }))
    const article = screen.getByRole('article', { name: 'साइबर धोखाधड़ी की शिकायत — ब्योरा' })
    expect(article).toHaveAttribute('lang', 'hi')
    expect(within(article).getByText('रकम')).toBeInTheDocument()
    // Values typed in English keep their own language inside the Hindi pack.
    expect(within(article).getByText('Kamla Devi')).toHaveAttribute('lang', 'en')
    await expectNoAxeViolations()
  })

  it('works on a Hindi screen', async () => {
    withDemoProfile()
    act(() => useStore.getState().setPrefs({ lang: 'hi' }))
    renderRoute('/golden-hour/pack')
    expect(screen.getByRole('heading', { level: 1, name: 'आपकी शिकायत का ब्योरा' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'हिंदी' })).toBeChecked()
    await expectNoAxeViolations()
  })
})
