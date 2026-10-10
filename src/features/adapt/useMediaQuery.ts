import { useCallback, useSyncExternalStore } from 'react'

function canMatch(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
}

/**
 * Live result of a CSS media query (e.g. the phone's "more contrast" or "reduce motion" setting).
 * Re-renders when the phone setting changes while Ruko is open.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!canMatch()) return () => {}
      const mq = window.matchMedia(query)
      mq.addEventListener?.('change', onChange)
      return () => mq.removeEventListener?.('change', onChange)
    },
    [query],
  )
  const getSnapshot = () => (canMatch() ? window.matchMedia(query).matches : false)
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}

/**
 * Back goes where the person came from (Adapt is reachable from Help on every screen),
 * or home when Adapt was opened directly.
 */
export function backTarget(): 'history' | '/' {
  if (typeof window === 'undefined') return '/'
  const idx = (window.history.state as { idx?: number } | null)?.idx
  return typeof idx === 'number' && idx > 0 ? 'history' : '/'
}
