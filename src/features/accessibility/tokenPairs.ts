import type { PairKind } from './contrast'

export interface TokenPair {
  /** String key suffix: accessibility.pair.<id> */
  id: string
  /** Foreground alias token (text, border or ring). */
  fg: string
  /** Background alias token. */
  bg: string
  kind: PairKind
}

/** The alias-token pairs Ruko actually uses for text and controls. */
export const TOKEN_PAIRS: TokenPair[] = [
  { id: 'body', fg: '--color-text', bg: '--color-bg', kind: 'text' },
  { id: 'muted', fg: '--color-text-muted', bg: '--color-surface', kind: 'text' },
  { id: 'primary', fg: '--color-on-primary', bg: '--color-primary', kind: 'text' },
  { id: 'danger', fg: '--color-on-danger', bg: '--color-danger', kind: 'text' },
  { id: 'success', fg: '--color-on-primary', bg: '--color-success', kind: 'text' },
  { id: 'link', fg: '--color-primary', bg: '--color-bg', kind: 'text' },
  { id: 'soft', fg: '--color-primary', bg: '--color-primary-soft', kind: 'text' },
  { id: 'caution', fg: '--color-caution-text', bg: '--color-caution-bg', kind: 'text' },
  { id: 'highlight', fg: '--color-on-highlight', bg: '--color-highlight', kind: 'text' },
  { id: 'border', fg: '--color-border-strong', bg: '--color-surface', kind: 'ui' },
  { id: 'focus', fg: '--color-focus', bg: '--color-bg', kind: 'ui' },
]

export const TOKEN_NAMES: string[] = Array.from(new Set(TOKEN_PAIRS.flatMap((p) => [p.fg, p.bg])))

/**
 * A copy of the resolved alias-token values in src/design-system/tokens.css.
 * Used ONLY when the browser cannot report computed custom properties (for example jsdom in unit
 * tests). In a real browser the table reads the live values from <html>, so it always matches what
 * is on screen. Keep in sync with tokens.css if colours change.
 */
export const FALLBACK_TOKENS: Record<'standard' | 'high', Record<string, string>> = {
  standard: {
    '--color-text': '#1b1a2e',
    '--color-bg': '#fffbf5',
    '--color-surface': '#ffffff',
    '--color-text-muted': '#4a4860',
    '--color-primary': '#0b6e69',
    '--color-on-primary': '#ffffff',
    '--color-primary-soft': '#e6f4f2',
    '--color-danger': '#b3261e',
    '--color-on-danger': '#ffffff',
    '--color-success': '#1e6b3a',
    '--color-caution-text': '#8a5300',
    '--color-caution-bg': '#fff1d6',
    '--color-highlight': '#fbd38d',
    '--color-on-highlight': '#1b1a2e',
    '--color-border-strong': '#7a7468',
    '--color-focus': '#1f4fd1',
  },
  high: {
    '--color-text': '#000000',
    '--color-bg': '#ffffff',
    '--color-surface': '#ffffff',
    '--color-text-muted': '#000000',
    '--color-primary': '#063c39',
    '--color-on-primary': '#ffffff',
    '--color-primary-soft': '#ffffff',
    '--color-danger': '#8c1d17',
    '--color-on-danger': '#ffffff',
    '--color-success': '#0f4d27',
    '--color-caution-text': '#000000',
    '--color-caution-bg': '#ffffff',
    '--color-highlight': '#fbd38d',
    '--color-on-highlight': '#1b1a2e',
    '--color-border-strong': '#000000',
    '--color-focus': '#000000',
  },
}
