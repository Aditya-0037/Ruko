import { create } from 'zustand'

export interface Toast {
  id: number
  message: string
  actionLabel?: string
  onAction?: () => void
  /** ms before it hides. Undo toasts default to 8 s so slower readers can act. */
  duration: number
}

interface ToastState {
  toasts: Toast[]
  show: (t: Omit<Toast, 'id' | 'duration'> & { duration?: number }) => number
  dismiss: (id: number) => void
}

let nextId = 1

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],
  show: (t) => {
    const id = nextId++
    set((s) => ({ toasts: [...s.toasts.slice(-2), { duration: 8000, ...t, id }] }))
    return id
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}))

/** const toast = useToast(); toast({ message: 'Rahul removed', actionLabel: 'Undo', onAction: restore }) */
export function useToast() {
  return useToastStore((s) => s.show)
}
