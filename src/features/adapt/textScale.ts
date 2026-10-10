import type { Prefs, TextScale } from '../../state/types'

/** The named text sizes, smallest to biggest. Mirrors the TextScale type. */
export const TEXT_SCALES: readonly TextScale[] = [1, 1.15, 1.3, 1.5, 1.75, 2]

/** Index of the named size closest to a stored value (guards against odd persisted values). */
export function nearestScaleIndex(value: number): number {
  let best = 0
  TEXT_SCALES.forEach((s, i) => {
    if (Math.abs(s - value) < Math.abs(TEXT_SCALES[best] - value)) best = i
  })
  return best
}

/** 1.3 → 130 */
export const scalePercent = (scale: number): number => Math.round(scale * 100)

/** '1.3' → 1.3, only for the named sizes. */
export function parseScale(value: string): TextScale | undefined {
  return TEXT_SCALES.find((s) => String(s) === value)
}

/** Same preferences? (Used so "Reset" can say "nothing to reset" instead of a no-op toast.) */
export function samePrefs(a: Prefs, b: Prefs): boolean {
  return (Object.keys(a) as (keyof Prefs)[]).every((k) => a[k] === b[k])
}
