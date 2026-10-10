import { useId } from 'react'
import { Eye, Hand } from 'lucide-react'
import { ListenButton, RukoMark } from '../../design-system/components'
import { useT } from '../../i18n/useT'
import { useTrustedPerson } from '../../state/hooks'
import { useStore } from '../../state/store'
import type { Prefs } from '../../state/types'
import { scalePercent } from './textScale'
import styles from './AdaptPage.module.css'

/** Plain-words list of what differs from the phone's defaults (language is a choice, not a change). */
function useChanges(prefs: Prefs): string[] {
  const { t } = useT()
  const changes: string[] = []
  if (prefs.textScale !== 1) {
    changes.push(t('adapt.change.size', { size: t('adapt.size.percent', { value: scalePercent(prefs.textScale) }) }))
  }
  if (prefs.contrast === 'high') changes.push(t('adapt.change.contrast'))
  if (prefs.easyRead) changes.push(t('adapt.change.easyRead'))
  if (prefs.readAloud) changes.push(t('adapt.change.readAloud'))
  if (prefs.motion === 'reduce') changes.push(t('adapt.change.motionReduce'))
  if (prefs.motion === 'full') changes.push(t('adapt.change.motionFull'))
  if (prefs.designNotes) changes.push(t('adapt.change.designNotes'))
  return changes
}

/**
 * A miniature of Ruko's calm card. It is not a separate rendering: the shell applies every
 * preference to the whole app at once, so this sample simply shows real Ruko copy and styles
 * as they are right now (Easy Read swaps the sentence, text size grows it, contrast recolours it).
 */
export function AdaptPreview() {
  const { t } = useT()
  const prefs = useStore((s) => s.prefs)
  const person = useTrustedPerson()
  const changes = useChanges(prefs)
  const changesId = useId()
  const title = t('adapt.preview.title')
  const body = t('adapt.preview.body')

  return (
    <figure className={styles.preview}>
      <figcaption className={styles.previewCaption}>
        <span className={styles.previewEyebrow}>
          <Eye aria-hidden="true" />
          <span>{t('adapt.preview.caption')}</span>
        </span>
        <span className={styles.previewHint}>{t('adapt.preview.hint')}</span>
      </figcaption>

      <div className={styles.previewScreen}>
        <div className={styles.previewBar} aria-hidden="true">
          <RukoMark className={styles.previewMark} />
          <span>{t('app.name')}</span>
        </div>
        <p className={styles.previewTitle}>{title}</p>
        <p>{body}</p>
        {/* A sample of what buttons look like. Not a real control, so it is hidden from screen readers. */}
        <span className={styles.previewButton} aria-hidden="true">
          <Hand />
          <span>{person ? t('adapt.preview.button', { name: person.name }) : t('adapt.preview.buttonNoPerson')}</span>
        </span>
      </div>

      <div className={styles.previewFooter}>
        {changes.length === 0 ? (
          <p className={styles.changesNone}>{t('adapt.changes.none')}</p>
        ) : (
          <div className={styles.changes}>
            <p id={changesId} className={styles.changesLabel}>
              {t('adapt.changes.label')}
            </p>
            <ul className={styles.chips} aria-labelledby={changesId}>
              {changes.map((c) => (
                <li key={c} className={styles.chip}>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}
        <ListenButton text={`${title} ${body}`} variant="quiet" />
      </div>
    </figure>
  )
}
