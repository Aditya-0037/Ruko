import type { ReactNode } from 'react'
import { Lightbulb } from 'lucide-react'
import { useT } from '../../i18n/useT'
import { useStore } from '../../state/store'
import styles from './DesignNote.module.css'

/**
 * Judge-facing rationale: "users said X, so we did Y". Hidden unless Design notes is on
 * (Adapt to me → Design notes, or /about). Keep it to one or two sentences.
 */
export function DesignNote({ title, children }: { title: string; children: ReactNode }) {
  const on = useStore((s) => s.prefs.designNotes)
  const { t } = useT()
  if (!on) return null
  return (
    <aside className={styles.note} aria-label={`${t('designNote.label')}: ${title}`}>
      <span className={styles.icon} aria-hidden="true">
        <Lightbulb />
      </span>
      <div>
        <span className={styles.label}>{t('designNote.label')}</span>
        <p className={styles.title}>{title}</p>
        <div>{children}</div>
      </div>
    </aside>
  )
}
