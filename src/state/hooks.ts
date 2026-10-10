import { useEffect, useState } from 'react'
import { useStore } from './store'

/** Current time, re-rendering every `intervalMs`. Use for call timers and countdowns. */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])
  return now
}

/** The trusted person to ask (first person if none specified). */
export function useTrustedPerson(id?: string | null) {
  return useStore((s) => s.people.find((p) => p.id === id) ?? s.people[0] ?? null)
}

/** True while the browser reports no network. */
export function useOnline(): boolean {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine))
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])
  return online
}

/** Effective reduced-motion: user setting first, then the OS preference. */
export function useReducedMotion(): boolean {
  const motion = useStore((s) => s.prefs.motion)
  const [systemReduce, setSystemReduce] = useState(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  )
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setSystemReduce(mq.matches)
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])
  if (motion === 'reduce') return true
  if (motion === 'full') return false
  return systemReduce
}
