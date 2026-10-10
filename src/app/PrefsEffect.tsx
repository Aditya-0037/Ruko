import { useEffect } from 'react'
import { useStore } from '../state/store'

/** Mirrors preferences onto <html> so tokens.css and global.css can react to them. */
export function PrefsEffect() {
  const prefs = useStore((s) => s.prefs)
  useEffect(() => {
    const root = document.documentElement
    root.lang = prefs.lang === 'hi' ? 'hi' : 'en'
    root.dataset.contrast = prefs.contrast
    root.dataset.easyRead = String(prefs.easyRead)
    root.dataset.motion = prefs.motion
    root.style.setProperty('--text-scale', String(prefs.textScale))
    root.dataset.textLarge = String(prefs.textScale >= 1.5)
  }, [prefs])
  return null
}
