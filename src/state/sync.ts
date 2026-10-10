import { STORE_KEY, useStore } from './store'

/**
 * Cross-tab / cross-iframe sync with no backend.
 * When another same-origin document writes the store, the browser fires a `storage` event here,
 * and we re-read the persisted state. This is how Kamla's phone and Rahul's phone update live
 * side by side on /demo.
 */
export function startCrossTabSync(): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORE_KEY) void useStore.persist.rehydrate()
  }
  window.addEventListener('storage', onStorage)
  return () => window.removeEventListener('storage', onStorage)
}
