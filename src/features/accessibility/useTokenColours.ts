import { useMemo, useSyncExternalStore } from 'react'
import { parseColor, type RGB } from './contrast'
import { FALLBACK_TOKENS, TOKEN_NAMES } from './tokenPairs'

/** Re-read whenever the shell changes <html> (contrast mode, text scale, theme attributes). */
function subscribe(onChange: () => void): () => void {
  if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return () => {}
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-contrast', 'style', 'class'] })
  return () => observer.disconnect()
}

/** A plain string, so React can compare snapshots by value (no re-render loops). */
function readSnapshot(): string {
  if (typeof document === 'undefined' || typeof getComputedStyle !== 'function') return ''
  const computed = getComputedStyle(document.documentElement)
  return TOKEN_NAMES.map((name) => computed.getPropertyValue(name).trim()).join('|')
}

export interface TokenColours {
  colours: Record<string, RGB>
  /** true when every value came from the live page; false when the token-file copy filled gaps. */
  live: boolean
}

/**
 * The real, computed colour of each alias token on this page right now. Custom properties
 * resolve their var() references when computed, so "--color-text: var(--ink-900)" reads as "#1b1a2e".
 */
export function useTokenColours(mode: 'standard' | 'high'): TokenColours {
  const snapshot = useSyncExternalStore(subscribe, readSnapshot, () => '')
  return useMemo(() => {
    const values = snapshot ? snapshot.split('|') : []
    let live = true
    const colours: Record<string, RGB> = {}
    TOKEN_NAMES.forEach((name, i) => {
      const parsed = parseColor(values[i] ?? '')
      if (parsed) {
        colours[name] = parsed
      } else {
        live = false
        colours[name] = parseColor(FALLBACK_TOKENS[mode][name]) ?? [0, 0, 0]
      }
    })
    return { colours, live }
  }, [snapshot, mode])
}
