import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowLeft, LifeBuoy } from 'lucide-react'
import { useT } from '../../i18n/useT'
import { HelpSheet } from './HelpSheet'
import { RukoMark } from './RukoMark'
import styles from './Screen.module.css'

export interface ScreenProps {
  /** Page title: used for the h1 and document.title. */
  title: string
  /** Render the h1 visually hidden (when the page shows its own big headline). */
  hideTitle?: boolean
  /** Back target: a route, 'history' for browser back, or false for none. Default: none. */
  back?: string | 'history' | false
  tone?: 'default' | 'calm' | 'caution' | 'danger'
  /** Sticky bottom area for the main action — thumb reach on phones. */
  footer?: ReactNode
  /** Hide the Help button (only for full-screen simulations). */
  showHelp?: boolean
  /** Hide the whole top bar (only for full-screen simulations). */
  hideTopBar?: boolean
  children: ReactNode
  className?: string
}

/**
 * Every page uses Screen: consistent top bar (Back · Ruko · Help), one h1, a main landmark,
 * and focus moved to the heading on navigation so screen readers announce the new page.
 */
export function Screen({
  title,
  hideTitle,
  back = false,
  tone = 'default',
  footer,
  showHelp = true,
  hideTopBar,
  children,
  className,
}: ScreenProps) {
  const { t } = useT()
  const navigate = useNavigate()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const [helpOpen, setHelpOpen] = useState(false)

  useEffect(() => {
    document.title = `${title} · ${t('app.name')}`
  }, [title, t])

  useEffect(() => {
    // Move focus to the new page's heading (skip on the very first load so we don't steal focus).
    if (window.history.state && window.history.state.idx > 0) {
      headingRef.current?.focus({ preventScroll: false })
    }
  }, [])

  const backButton =
    back === 'history' ? (
      <button type="button" className={styles.barButton} onClick={() => navigate(-1)}>
        <ArrowLeft aria-hidden="true" />
        <span>{t('common.back')}</span>
      </button>
    ) : back ? (
      <Link to={back} className={styles.barButton}>
        <ArrowLeft aria-hidden="true" />
        <span>{t('common.back')}</span>
      </Link>
    ) : null

  return (
    <div className={[styles.screen, tone !== 'default' && styles[tone], className].filter(Boolean).join(' ')}>
      {!hideTopBar && (
        <header className={styles.topbar}>
          <div className={styles.start}>{backButton}</div>
          <Link to="/" className={styles.brand} aria-label={`${t('app.name')} — ${t('common.home')}`}>
            <RukoMark className={styles.mark} />
            <span aria-hidden="true">{t('app.name')}</span>
          </Link>
          <div className={styles.end}>
            {showHelp && (
              <button
                type="button"
                className={`${styles.barButton} ${styles.help}`}
                onClick={() => setHelpOpen(true)}
                aria-haspopup="dialog"
              >
                <LifeBuoy aria-hidden="true" />
                <span>{t('help.button')}</span>
              </button>
            )}
          </div>
        </header>
      )}
      <main id="main" className={styles.main} tabIndex={-1}>
        <h1 ref={headingRef} tabIndex={-1} className={[styles.heading, hideTitle && 'visually-hidden'].filter(Boolean).join(' ')}>
          {title}
        </h1>
        {children}
      </main>
      {footer && (
        <div className={`${styles.footer} no-print`}>
          <div className={styles.footerInner}>{footer}</div>
        </div>
      )}
      {showHelp && <HelpSheet open={helpOpen} onClose={() => setHelpOpen(false)} />}
    </div>
  )
}
