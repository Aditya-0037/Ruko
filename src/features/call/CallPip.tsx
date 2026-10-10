import { EyeOff, PhoneOff, Video } from 'lucide-react'
import { useLocation } from 'react-router'
import { Button, ButtonLink, useToast } from '../../design-system/components'
import { useT } from '../../i18n/useT'
import { formatClock } from '../../lib/format'
import { useNow } from '../../state/hooks'
import { useStore } from '../../state/store'
import { useCallerLabel } from './callerLabel'
import styles from './CallPip.module.css'

/** Screens that show the call themselves (or are another person's phone) never show the bar. */
const HIDDEN_ON = ['/call', '/demo', '/family']

function isHiddenOn(pathname: string) {
  return HIDDEN_ON.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

/**
 * Picture-in-picture bar for a running simulated call. Rendered by the app shell on every route.
 * It sits in the normal page flow above the top bar (not sticky), so it never covers the sticky
 * top bar or a focused element (WCAG 2.4.11), and it scrolls away with the page.
 */
export function CallPip() {
  const active = useStore((s) => s.incident.callActive)
  const { pathname } = useLocation()
  if (!active || isHiddenOn(pathname)) return null
  return <CallPipBar />
}

function CallPipBar() {
  const { t } = useT()
  const now = useNow(1000)
  const startedAt = useStore((s) => s.incident.callStartedAt)
  const endCall = useStore((s) => s.endCall)
  const caller = useCallerLabel()
  const toast = useToast()
  const elapsed = startedAt === null ? 0 : now - startedAt

  const end = () => {
    endCall()
    toast({ message: t('call.endedToast') })
    // The bar (and the focused button) disappears: hand focus to the page heading.
    window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>('main h1')?.focus()
    })
  }

  return (
    <aside className={`${styles.pip} no-print`} aria-label={t('call.pip.label')}>
      <div className={styles.inner}>
        {/* The timer is visual only (not a live region), so nothing is announced every second. */}
        <p className={styles.text}>
          <Video aria-hidden="true" className={styles.icon} />
          <span className={styles.status}>
            {t('call.pip.running')}
            <span aria-hidden="true"> · </span>
            <span className={styles.time}>
              <span className="visually-hidden">{t('call.timerLabel')}: </span>
              {formatClock(elapsed)}
            </span>
            <span aria-hidden="true"> · </span>
            <span lang={caller.lang}>{caller.text}</span> ({t('common.demoLabel')})
          </span>{' '}
          <span className={styles.reassure}>
            <EyeOff aria-hidden="true" className={styles.icon} />
            {t('call.pip.reassure')}
          </span>
        </p>
        <div className={styles.actions}>
          <ButtonLink to="/call" viewTransition className={`${styles.btn} ${styles.return}`} icon={<Video />}>
            {t('call.pip.return')}
          </ButtonLink>
          <Button className={`${styles.btn} ${styles.end}`} icon={<PhoneOff />} onClick={end}>
            {t('call.pip.end')}
          </Button>
        </div>
      </div>
    </aside>
  )
}
