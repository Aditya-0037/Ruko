import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { CheckCircle2, Clock, ExternalLink as ExternalIcon, Smartphone } from 'lucide-react'
import { useT } from '../../i18n/useT'
import { formatTime } from '../../lib/format'
import styles from './ui.module.css'

/* ---------------- external link ---------------- */

/** A link to another website. Opens in a new tab: an icon shows it, and screen readers hear it in words. */
export function ExternalLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  const { t } = useT()
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={[styles.external, className].filter(Boolean).join(' ')}>
      <span>{children}</span>{' '}
      <ExternalIcon aria-hidden="true" className={styles.externalIcon} />{' '}
      <span className="visually-hidden">{t('goldenHour.newTab')}</span>
    </a>
  )
}

/** A web address inside a sentence: always Latin script, so it carries its own lang. */
export function Site({ children }: { children: string }) {
  return (
    <span lang="en" className={styles.site}>
      {children}
    </span>
  )
}

/* ---------------- "Golden hour · Step 3 of 5" ---------------- */

export function SectionKicker({ step }: { step: number }) {
  const { t } = useT()
  return (
    <p className={styles.kicker}>
      <Clock aria-hidden="true" />
      <span>{t('goldenHour.kicker', { step: t('common.stepOf', { current: step, total: 5 }) })}</span>
    </p>
  )
}

/* ---------------- autosave status ---------------- */

/**
 * Debounced "Saved at 10:42 am". Saving itself is instant (the store persists on every change);
 * the message waits for a pause in typing so screen readers are not told on every keystroke.
 */
export function useSavedAt(delayMs = 700): [number | null, () => void] {
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const timer = useRef<number | null>(null)
  const markSaved = useCallback(() => {
    if (timer.current !== null) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      timer.current = null
      setSavedAt(Date.now())
    }, delayMs)
  }, [delayMs])
  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current)
    },
    [],
  )
  return [savedAt, markSaved]
}

/** Polite status line. Before the first save it explains autosave; after, it confirms it. */
export function SaveStatus({ savedAt, idle, className }: { savedAt: number | null; idle: string; className?: string }) {
  const { t, lang } = useT()
  return (
    <p role="status" className={[styles.save, savedAt !== null && styles.saved, className].filter(Boolean).join(' ')}>
      {savedAt !== null ? <CheckCircle2 aria-hidden="true" /> : <Smartphone aria-hidden="true" />}
      <span>{savedAt !== null ? t('goldenHour.saved', { time: formatTime(savedAt, lang) }) : idle}</span>
    </p>
  )
}

/* ---------------- big checkbox ---------------- */

interface CheckRowProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: ReactNode
  hint?: ReactNode
}

/** A large native checkbox with a label and optional hint. The whole row is the target. */
export function CheckRow({ checked, onChange, label, hint }: CheckRowProps) {
  const hintId = useId()
  return (
    <div className={[styles.checkRow, checked && styles.checkRowOn].filter(Boolean).join(' ')}>
      <label className={styles.checkLabel}>
        <input
          type="checkbox"
          className={styles.checkbox}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-describedby={hint ? hintId : undefined}
        />
        <span className={styles.checkText}>{label}</span>
      </label>
      {hint && (
        <p id={hintId} className={styles.checkHint}>
          {hint}
        </p>
      )}
    </div>
  )
}

/** The checkbox class, for rows with custom layout (the five steps). */
export const checkboxClass = styles.checkbox

/** Container that keeps buttons inside it readable at large text sizes (see ui.module.css). */
export const fitClass = styles.fit
