import { useEffect, useRef } from 'react'
import { useStore } from '../../state/store'
import { SafetyHome } from './SafetyHome'
import { WelcomeView } from './WelcomeView'

/** Home is the same address before and after setup; what it shows follows where the person is. */
export function HomePage() {
  const isSetUp = useStore((s) => s.setup.completed || s.people.length > 0)
  const previous = useRef(isSetUp)

  // When the view swaps in place (demo loaded, plan cleared), move focus to the new heading
  // so keyboard and screen-reader users are not left on a button that no longer exists.
  useEffect(() => {
    if (previous.current === isSetUp) return
    previous.current = isSetUp
    document.querySelector<HTMLElement>('#main h1')?.focus()
  }, [isSetUp])

  return isSetUp ? <SafetyHome /> : <WelcomeView />
}
