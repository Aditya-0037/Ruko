import { useId } from 'react'
import { Check } from 'lucide-react'
import { dictionaries } from '../../i18n/dictionaries'
import { translate } from '../../i18n/translate'
import type { Lang } from '../../state/types'
import styles from './LanguageCards.module.css'

export const LANGS: Lang[] = ['en', 'hi']

/** A string in a specific language, regardless of the current UI language. */
export function inLang(lang: Lang, key: string): string {
  return translate(dictionaries, lang, key)
}

/** Language options for a SegmentedControl: each label in its own language and script. */
export function languageOptions() {
  return LANGS.map((l) => ({ value: l, label: inLang(l, 'setup.language.option.name'), lang: l }))
}

interface LanguageCardsProps {
  legend: string
  value: Lang
  onChange: (lang: Lang) => void
}

/**
 * Big radio cards for the language question. Each option is written in its own language and
 * marked with `lang`, so a Hindi reader can find "हिंदी" without reading English and screen
 * readers switch voice. (The shared ChoiceGroup has no per-option `lang` yet.)
 */
export function LanguageCards({ legend, value, onChange }: LanguageCardsProps) {
  const name = useId()
  return (
    <fieldset className={styles.fieldset}>
      <legend className="visually-hidden">{legend}</legend>
      <div className={styles.options}>
        {LANGS.map((l) => (
          <label key={l} className={styles.option} lang={l}>
            <input
              className={styles.input}
              type="radio"
              name={name}
              value={l}
              checked={value === l}
              onChange={() => onChange(l)}
            />
            <span className={styles.glyph} aria-hidden="true">
              {inLang(l, 'setup.language.option.glyph')}
            </span>
            <span className={styles.text}>
              <span className={styles.name}>{inLang(l, 'setup.language.option.name')}</span>
              <span className={styles.desc}>{inLang(l, 'setup.language.option.desc')}</span>
            </span>
            <span className={styles.check} aria-hidden="true">
              <Check />
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
