import type { StateStorage } from 'zustand/middleware'

/**
 * localStorage that never throws. Private windows, blocked site data and previews can make
 * storage unavailable; Ruko must still work (it just won't remember settings).
 */
const memory = new Map<string, string>()

function storage(): Storage | null {
  try {
    const s = window.localStorage
    const probe = '__ruko_probe__'
    s.setItem(probe, probe)
    s.removeItem(probe)
    return s
  } catch {
    return null
  }
}

export const safeStorage: StateStorage = {
  getItem(name) {
    try {
      return storage()?.getItem(name) ?? memory.get(name) ?? null
    } catch {
      return memory.get(name) ?? null
    }
  },
  setItem(name, value) {
    memory.set(name, value)
    try {
      storage()?.setItem(name, value)
    } catch {
      /* storage full or blocked — keep the in-memory copy */
    }
  },
  removeItem(name) {
    memory.delete(name)
    try {
      storage()?.removeItem(name)
    } catch {
      /* ignore */
    }
  },
}
