import { useId, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { Button } from '../../design-system/components'
import { useT } from '../../i18n/useT'
import { useReducedMotion } from '../../state/hooks'
import styles from './BreathingCircle.module.css'

/**
 * A gentle 4-seconds-in / 4-seconds-out breathing guide. The words below carry the instruction;
 * the circle is decoration. It can be stopped (WCAG 2.2.2) and is static under reduced motion.
 */
export function BreathingCircle() {
  const { t } = useT()
  const reduceMotion = useReducedMotion()
  const [running, setRunning] = useState(true)
  const headingId = useId()
  const animating = !reduceMotion && running

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.title}>
        {t('pause.breathe.title')}
      </h2>
      <div className={styles.stage} aria-hidden="true">
        <div
          className={[styles.circle, animating && styles.animate].filter(Boolean).join(' ')}
          data-breathing={animating}
        >
          {animating ? (
            <>
              <span className={styles.in}>{t('pause.breathe.in')}</span>
              <span className={styles.out}>{t('pause.breathe.out')}</span>
            </>
          ) : (
            <span>{t('pause.breathe.still')}</span>
          )}
        </div>
      </div>
      <p className={styles.help}>{reduceMotion ? t('pause.breathe.static') : t('pause.breathe.help')}</p>
      {!reduceMotion && (
        <Button
          variant="quiet"
          icon={running ? <Pause /> : <Play />}
          onClick={() => setRunning((r) => !r)}
          className={styles.toggle}
        >
          {running ? t('pause.breathe.pause') : t('pause.breathe.start')}
        </Button>
      )}
    </section>
  )
}
