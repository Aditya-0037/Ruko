import { describe, expect, it } from 'vitest'
import { contrastRatio, floorRatio, parseColor, passesAA, relativeLuminance, wcagLevel } from './contrast'
import { FALLBACK_TOKENS, TOKEN_NAMES, TOKEN_PAIRS } from './tokenPairs'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('parseColor', () => {
  it('reads hex in every common form', () => {
    expect(parseColor('#fff')).toEqual([255, 255, 255])
    expect(parseColor(' #1B1A2E ')).toEqual([27, 26, 46])
    expect(parseColor('#0b6e69ff')).toEqual([11, 110, 105])
  })
  it('reads rgb() with commas or spaces', () => {
    expect(parseColor('rgb(27, 26, 46)')).toEqual([27, 26, 46])
    expect(parseColor('rgb(27 26 46 / 0.5)')).toEqual([27, 26, 46])
    expect(parseColor('white')).toEqual([255, 255, 255])
  })
  it('returns null for anything it cannot measure', () => {
    expect(parseColor('')).toBeNull()
    expect(parseColor('var(--ink-900)')).toBeNull()
    expect(parseColor('#12345')).toBeNull()
  })
})

describe('WCAG contrast', () => {
  it('matches the spec at the extremes', () => {
    expect(relativeLuminance([0, 0, 0])).toBe(0)
    expect(relativeLuminance([255, 255, 255])).toBeCloseTo(1, 10)
    expect(contrastRatio([0, 0, 0], [255, 255, 255])).toBeCloseTo(21, 10)
    expect(contrastRatio([255, 255, 255], [0, 0, 0])).toBeCloseTo(21, 10)
  })
  it('gives the documented ratio for body text', () => {
    // ink-900 on paper-50 is documented in tokens.css as about 16:1.
    expect(contrastRatio(parseColor('#1b1a2e')!, parseColor('#fffbf5')!)).toBeGreaterThan(16)
  })
  it('grades text and non-text contrast separately', () => {
    expect(wcagLevel(7.2, 'text')).toBe('aaa')
    expect(wcagLevel(4.5, 'text')).toBe('aa')
    expect(wcagLevel(3.4, 'text')).toBe('aaLarge')
    expect(wcagLevel(2.9, 'text')).toBe('fail')
    expect(wcagLevel(3, 'ui')).toBe('aa')
    expect(wcagLevel(2.99, 'ui')).toBe('fail')
    expect(passesAA(4.49, 'text')).toBe(false)
    expect(passesAA(3.1, 'ui')).toBe(true)
  })
  it('rounds down, never up', () => {
    expect(floorRatio(4.49)).toBe(4.4)
    expect(floorRatio(16.46)).toBe(16.4)
    expect(floorRatio(21)).toBe(21)
  })
})

describe('token pairs', () => {
  it('has a fallback value for every token in both modes', () => {
    for (const mode of ['standard', 'high'] as const) {
      for (const name of TOKEN_NAMES) expect(parseColor(FALLBACK_TOKENS[mode][name] ?? '')).not.toBeNull()
    }
  })
  it('every pair meets WCAG AA in both modes', () => {
    for (const mode of ['standard', 'high'] as const) {
      const failing = TOKEN_PAIRS.filter((p) => {
        const ratio = contrastRatio(parseColor(FALLBACK_TOKENS[mode][p.fg])!, parseColor(FALLBACK_TOKENS[mode][p.bg])!)
        return !passesAA(ratio, p.kind)
      }).map((p) => `${mode}:${p.id}`)
      expect(failing).toEqual([])
    }
  })
  it('the standard fallback copy still matches the palette in tokens.css', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/design-system/tokens.css'), 'utf8').toLowerCase()
    for (const hex of new Set(Object.values(FALLBACK_TOKENS.standard))) expect(css).toContain(hex)
    for (const hex of new Set(Object.values(FALLBACK_TOKENS.high))) expect(css).toContain(hex)
  })
})
