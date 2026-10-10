import { useEffect } from 'react'
import { X } from 'lucide-react'
import { useT } from '../../i18n/useT'
import { useToastStore, type Toast } from './toastStore'
import styles from './ToastRegion.module.css'

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useToastStore((s) => s.dismiss)
  const { t } = useT()
  useEffect(() => {
    const id = window.setTimeout(() => dismiss(toast.id), toast.duration)
    return () => window.clearTimeout(id)
  }, [toast.id, toast.duration, dismiss])

  return (
    <div className={styles.toast}>
      <p className={styles.message}>{toast.message}</p>
      {toast.actionLabel && toast.onAction && (
        <button
          type="button"
          className={styles.action}
          onClick={() => {
            toast.onAction?.()
            dismiss(toast.id)
          }}
        >
          {toast.actionLabel}
        </button>
      )}
      <button type="button" className={styles.close} onClick={() => dismiss(toast.id)} aria-label={t('common.close')}>
        <X aria-hidden="true" />
      </button>
    </div>
  )
}

/** Undo instead of "Are you sure?". Announced politely to screen readers. */
export function ToastRegion() {
  const toasts = useToastStore((s) => s.toasts)
  return (
    <div className={`${styles.region} no-print`} role="status" aria-live="polite">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  )
}
