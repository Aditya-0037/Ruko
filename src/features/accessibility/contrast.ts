/**
 * WCAG 2.x contrast, computed exactly as the spec defines it.
 * https://www.w3.org/TR/WCAG22/#dfn-relative-luminance
 */

export type RGB = readonly [number, number, number]

const NAMED: Record<string, RGB> = {
  white: [255, 255, 255],
  black: [0, 0, 0],
}

/** Parses "#fff", "#fffbf5", "#fffbf5ff", "rgb(27 26 46)" or "rgb(27, 26, 46)". Alpha is ignored. */
export function parseColor(input: string): RGB | null {
  const s = input.trim().toLowerCase()
  if (!s) return null
  if (s in NAMED) return NAMED[s]

  const hex = s.match(/^#([0-9a-f]{3,8})$/)
  if (hex) {
    let h = hex[1]
    if (h.length === 3 || h.length === 4) {
      h = h
        .slice(0, 3)
        .split('')
        .map((c) => c + c)
        .join('')
    } else if (h.length === 8) {
      h = h.slice(0, 6)
    } else if (h.length !== 6) {
      return null
    }
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
  }

  const rgb = s.match(/^rgba?\(\s*(\d{1,3}(?:\.\d+)?)[\s,]+(\d{1,3}(?:\.\d+)?)[\s,]+(\d{1,3}(?:\.\d+)?)/)
  if (rgb) {
    const clamp = (v: string) => Math.min(255, Math.max(0, Math.round(Number(v))))
    return [clamp(rgb[1]), clamp(rgb[2]), clamp(rgb[3])]
  }
  return null
}

/** Relative luminance (0 = black, 1 = white). */
export function relativeLuminance([r, g, b]: RGB): number {
  const lin = (channel: number) => {
    const c = channel / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

/** Contrast ratio from 1 (none) to 21 (black on white). Order of the two colours does not matter. */
export function contrastRatio(a: RGB, b: RGB): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/** text = WCAG 1.4.3 (4.5:1, AAA at 7:1). ui = WCAG 1.4.11 non-text contrast (3:1). */
export type PairKind = 'text' | 'ui'
export type Level = 'aaa' | 'aa' | 'aaLarge' | 'fail'

export function wcagLevel(ratio: number, kind: PairKind): Level {
  if (kind === 'ui') return ratio >= 3 ? 'aa' : 'fail'
  if (ratio >= 7) return 'aaa'
  if (ratio >= 4.5) return 'aa'
  if (ratio >= 3) return 'aaLarge'
  return 'fail'
}

export const minimumFor = (kind: PairKind): number => (kind === 'ui' ? 3 : 4.5)

/** Meets the AA minimum for its kind. */
export const passesAA = (ratio: number, kind: PairKind): boolean => ratio >= minimumFor(kind)

/** Round DOWN so the label never claims more contrast than there is (4.49 shows as 4.4, not 4.5). */
export function floorRatio(ratio: number, decimals = 1): number {
  const f = 10 ** decimals
  return Math.floor(ratio * f + 1e-9) / f
}
