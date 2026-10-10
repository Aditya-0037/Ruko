import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const tokensCss = readFileSync(resolve(process.cwd(), 'src/design-system/tokens.css'), 'utf8')

/** WCAG 2.x relative luminance and contrast ratio. */
function luminance(hex: string): number {
  const v = hex.replace('#', '')
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16) / 255)
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

function token(name: string): string {
  const m = tokensCss.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`))
  if (!m) throw new Error(`token --${name} not found`)
  return m[1]
}

// [foreground, background, minimum ratio, what it is]
const pairs: [string, string, number, string][] = [
  ['ink-900', 'paper-50', 4.5, 'body text'],
  ['ink-600', 'paper-50', 4.5, 'muted text'],
  ['ink-600', 'white', 4.5, 'muted text on cards'],
  ['white', 'teal-700', 4.5, 'primary button label'],
  ['white', 'red-700', 4.5, 'danger button label'],
  ['white', 'green-700', 4.5, 'success label'],
  ['ink-900', 'marigold-300', 4.5, 'highlight'],
  ['ink-900', 'amber-50', 4.5, 'caution callout'],
  ['amber-700', 'amber-50', 4.5, 'caution text'],
  ['teal-700', 'paper-50', 4.5, 'links and secondary buttons'],
  ['teal-700', 'teal-50', 4.5, 'secondary text on soft teal'],
  ['red-700', 'red-50', 4.5, 'danger text on soft red'],
  ['stone-600', 'paper-50', 3, 'input boundary'],
  ['stone-600', 'white', 3, 'input boundary on cards'],
  ['blue-600', 'paper-50', 3, 'focus ring'],
  ['marigold-300', 'ink-900', 4.5, 'toast action on dark'],
]

describe('design tokens meet WCAG contrast', () => {
  it.each(pairs)('%s on %s ≥ %s:1 (%s)', (fg, bg, min) => {
    expect(contrast(token(fg), token(bg))).toBeGreaterThanOrEqual(min)
  })
})
