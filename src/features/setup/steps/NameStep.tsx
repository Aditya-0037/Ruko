import { useState } from 'react'
import { Field } from '../../../design-system/components'
import { useT } from '../../../i18n/useT'
import { useStore } from '../../../state/store'
import { SetupLayout } from '../SetupLayout'
import styles from '../Setup.module.css'

export function NameStep() {
  const { t } = useT()
  const name = useStore((s) => s.setup.elderName)
  const setElderName = useStore((s) => s.setElderName)
  const [showError, setShowError] = useState(false)

  const validate = () => {
    const trimmed = name.trim()
    if (!trimmed) {
      setShowError(true)
      return false
    }
    if (trimmed !== name) setElderName(trimmed)
    return true
  }

  return (
    <SetupLayout step="name" title={t('setup.name.title')} validate={validate}>
      <Field
        id="setup-name"
        label={t('setup.name.label')}
        hint={t('setup.name.hint')}
        error={showError ? t('setup.name.error') : undefined}
        value={name}
        onChange={(e) => {
          setElderName(e.target.value)
          if (showError) setShowError(false)
        }}
        autoComplete="name"
        autoCapitalize="words"
        enterKeyHint="next"
        spellCheck={false}
      />
      {name.trim() && (
        <div className={styles.greetPreview}>
          <p className={styles.greetLabel}>{t('setup.name.preview')}</p>
          <p className={styles.greetText}>{t('home.greeting', { name: name.trim() })}</p>
        </div>
      )}
    </SetupLayout>
  )
}
