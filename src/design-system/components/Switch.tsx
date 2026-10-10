import { useId } from 'react'
import { Check, X } from 'lucide-react'
import styles from './Switch.module.css'

interface SwitchProps {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
}

/** On/off switch. State is shown by position, colour AND an icon (✓ / ✕). */
export function Switch({ label, description, checked, onChange }: SwitchProps) {
  const labelId = useId()
  const descId = useId()
  return (
    <div className={styles.row}>
      <div className={styles.text}>
        <span id={labelId} className={styles.label}>
          {label}
        </span>
        {description && (
          <span id={descId} className={styles.description}>
            {description}
          </span>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        aria-describedby={description ? descId : undefined}
        className={styles.switch}
        onClick={() => onChange(!checked)}
      >
        <span className={styles.track} aria-hidden="true" />
        <span className={styles.thumb} aria-hidden="true">
          {checked ? <Check /> : <X />}
        </span>
      </button>
    </div>
  )
}
