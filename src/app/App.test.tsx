import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { useStore } from '../state/store'
import { expectNoAxeViolations, renderRoute, withDemoProfile } from '../test/utils'

describe('app shell', () => {
  it('has a skip link and an accessible help sheet on every screen', async () => {
    withDemoProfile()
    renderRoute('/')
    expect(screen.getByRole('link', { name: /skip to main content/i })).toHaveAttribute('href', '#main')
    await userEvent.click(screen.getByRole('button', { name: /^help$/i }))
    const dialog = await screen.findByRole('dialog', { name: /get help now/i })
    expect(dialog).toBeInTheDocument()
    expect(within(dialog).getByRole('link', { name: /call rahul/i })).toHaveAttribute('href', 'tel:+919876543210')
    expect(within(dialog).getByRole('link', { name: /call 1930/i })).toHaveAttribute('href', 'tel:1930')
    await expectNoAxeViolations()
  })

  it('applies preferences to the document', () => {
    useStore.getState().setPrefs({ lang: 'hi', contrast: 'high', textScale: 1.5, easyRead: true })
    renderRoute('/')
    const root = document.documentElement
    expect(root.lang).toBe('hi')
    expect(root.dataset.contrast).toBe('high')
    expect(root.dataset.easyRead).toBe('true')
    expect(root.style.getPropertyValue('--text-scale')).toBe('1.5')
  })

  it('shows a friendly 404', () => {
    renderRoute('/nope')
    expect(screen.getByRole('heading', { level: 1, name: /does not exist/i })).toBeInTheDocument()
  })
})
