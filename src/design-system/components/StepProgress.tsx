import { useT } from '../../i18n/useT'
import styles from './StepProgress.module.css'

/** "Step 2 of 6" — the words carry the meaning; the bar is decoration. */
export function StepProgress({ current, total }: { current: number; total: number }) {
  const { t } = useT()
  return (
    <div className={styles.progress}>
      <p className={styles.label}>{t('common.stepOf', { current, total })}</p>
      <div className={styles.track} aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={[styles.segment, i + 1 < current && styles.done, i + 1 === current && styles.current]
              .filter(Boolean)
              .join(' ')}
          />
        ))}
      </div>
    </div>
  )
}
