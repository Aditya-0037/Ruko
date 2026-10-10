import { useId } from 'react'
import { useT } from '../../i18n/useT'
import { minutesBetween } from '../../lib/format'
import { useNow } from '../../state/hooks'
import { elapsedText, GOLDEN_HOUR_MINUTES } from './model'
import styles from './HourTimer.module.css'

/** Re-render often enough that the minute flips on time; the text itself only changes per minute. */
const TICK_MS = 5_000

/**
 * A calm clock, not a countdown: "Time since you started: 12 min." The ring fills over the first
 * hour (decoration only; the words carry the meaning). The sentence sits in a polite live region,
 * and because its text changes at most once a minute, it is announced at most once a minute.
 */
export function HourTimer({ startedAt }: { startedAt: number | null }) {
  const { t } = useT()
  const now = useNow(TICK_MS)
  const titleId = useId()
  const minutes = startedAt ? minutesBetween(startedAt, now) : 0
  const late = minutes >= GOLDEN_HOUR_MINUTES
  const filled = Math.min(minutes / GOLDEN_HOUR_MINUTES, 1) * 100

  return (
    <section className={styles.timer} aria-labelledby={titleId}>
      <div className={styles.dial} aria-hidden="true">
        <svg viewBox="0 0 48 48" className={styles.ring} focusable="false">
          <circle cx="24" cy="24" r="20" className={styles.track} />
          {filled > 0 && (
            <circle
              cx="24"
              cy="24"
              r="20"
              className={styles.value}
              pathLength={100}
              strokeDasharray="100"
              strokeDashoffset={100 - filled}
              transform="rotate(-90 24 24)"
            />
          )}
        </svg>
        <span className={styles.number}>
          <span className={styles.digits}>{late ? '60+' : minutes}</span>
          <span className={styles.unit}>{t('goldenHour.timer.unit')}</span>
        </span>
      </div>
      <div className={styles.text}>
        <h2 id={titleId} className={styles.title}>
          {t('goldenHour.timer.title')}
        </h2>
        <p className={styles.elapsed} aria-live="polite" aria-atomic="true">
          {elapsedText(t, minutes)}
        </p>
        <p className={styles.hint}>{late ? t('goldenHour.timer.late') : t('goldenHour.timer.hint')}</p>
      </div>
    </section>
  )
}
