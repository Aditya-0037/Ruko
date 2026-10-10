import { DesignNote } from '../../../design-system/components'
import { useT } from '../../../i18n/useT'
import { useStore } from '../../../state/store'
import { inLang, LanguageCards } from '../LanguageCards'
import { SetupLayout } from '../SetupLayout'
import styles from '../Setup.module.css'

export function LanguageStep() {
  const { t, lang } = useT()
  const setPrefs = useStore((s) => s.setPrefs)
  const other = lang === 'en' ? 'hi' : 'en'

  return (
    <SetupLayout step="language" title={t('setup.language.title')}>
      {/* The same question in the other language, so someone who cannot read this one still finds their way. */}
      <p className={styles.otherLang} lang={other}>
        {inLang(other, 'setup.language.title')}
      </p>
      <LanguageCards legend={t('setup.language.title')} value={lang} onChange={(l) => setPrefs({ lang: l })} />
      <p className={styles.muted}>{t('setup.language.hint', { place: t('adapt.title') })}</p>
      <DesignNote title={t('setup.language.note.title')}>{t('setup.language.note.body')}</DesignNote>
    </SetupLayout>
  )
}
