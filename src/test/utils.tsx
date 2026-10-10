import { render } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import axe from 'axe-core'
import { expect } from 'vitest'
import { appRoutes } from '../app/router'
import { useStore } from '../state/store'

/** Render the real app at a route, with the real shell (help, toasts, prefs). */
export function renderRoute(path: string) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] })
  const utils = render(<RouterProvider router={router} />)
  return { router, ...utils }
}

/** Load the Kamla + Rahul demo profile before rendering. */
export function withDemoProfile() {
  useStore.getState().loadDemoProfile()
}

/**
 * Fails with a readable list of axe violations. Colour contrast is checked separately
 * (tokens.test.ts and Playwright), because jsdom cannot compute styles.
 */
export async function expectNoAxeViolations(
  container: Element = document.body,
  opts: { iframes?: boolean } = {},
) {
  const results = await axe.run(container, {
    rules: { 'color-contrast': { enabled: false } },
    iframes: opts.iframes ?? true,
  })
  const summary = results.violations.map(
    (v) => `${v.id} (${v.impact}): ${v.help} → ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`,
  )
  expect(summary).toEqual([])
}
