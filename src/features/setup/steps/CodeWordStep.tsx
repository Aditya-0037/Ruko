import { useState } from 'react'
import { Eye, EyeOff, Sparkles } from 'lucide-react'
import { Button, Card, DesignNote, Field } from '../../../design-system/components'
import { useT } from '../../../i18n/useT'
import { useStore } from '../../../state/store'
import { SetupLayout } from '../SetupLayout'
import styles from '../Setup.module.css'

const FIELD_ID = 'setup-code-word'

export function CodeWordStep() {
  const { t } = useT()
  const codeWord = useStore((s) => s.setup.codeWord)
  const setCodeWord = useStore((s) => s.setCodeWord)
  // Hidden by default once a word exists (someone may be looking over a shoulder); visible while choosing.
  const [visible, setVisible] = useState(() => !useStore.getState().setup.codeWord)

  const suggest = () => {
    const words = t('setup.code.suggestions')
      .split(',')
      .map((w) => w.trim())
      .filter((w) => w && w !== codeWord.trim())
    const word = words[Math.floor(Math.random() * words.length)]
    if (word) setCodeWord(word)
    setVisible(true)
  }

  const validate = () => {
    if (codeWord !== codeWord.trim()) setCodeWord(codeWord.trim())
    return true
  }

  return (
    <SetupLayout step="code-word" title={t('setup.code.title')} validate={validate}>
      <p className={styles.lead}>{t('setup.code.intro')}</p>

      <div className={styles.codeField}>
        <Field
          id={FIELD_ID}
          label={t('setup.code.label')}
          hint={t('setup.code.hint')}
          value={codeWord}
          onChange={(e) => setCodeWord(e.target.value)}
          type={visible ? 'text' : 'password'}
          autoComplete="off"
          autoCapitalize="words"
          spellCheck={false}
          data-1p-ignore
          data-lpignore="true"
        />
        <div className={styles.codeActions}>
          <Button
            variant="secondary"
            icon={visible ? <EyeOff /> : <Eye />}
            aria-controls={FIELD_ID}
            onClick={() => setVisible((v) => !v)}
          >
            {visible ? t('setup.code.hide') : t('setup.code.show')}
          </Button>
          <Button variant="secondary" icon={<Sparkles />} aria-controls={FIELD_ID} onClick={suggest}>
            {t('setup.code.suggest')}
          </Button>
        </div>
      </div>

      <Card tone="sunken" as="section" aria-labelledby="code-how" className={styles.howCard}>
        <h2 id="code-how" className={styles.subheading}>
          {t('setup.code.howTitle')}
        </h2>
        <ol className={styles.howList}>
          <li>{t('setup.code.how1')}</li>
          <li>{t('setup.code.how2')}</li>
          <li>{t('setup.code.how3')}</li>
        </ol>
      </Card>

      <p className={styles.muted}>{t('setup.code.optional')}</p>
      <DesignNote title={t('setup.code.note.title')}>{t('setup.code.note.body')}</DesignNote>
    </SetupLayout>
  )
}
