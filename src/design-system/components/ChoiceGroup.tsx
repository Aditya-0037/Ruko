import { useId, type ReactNode } from 'react'
import { CircleAlert } from 'lucide-react'
import styles from './ChoiceGroup.module.css'

export interface Choice<V extends string> {
  value: V
  label: string
  description?: string
  icon?: ReactNode
  /** Language of this option's label when it differs from the page, e.g. 'hi' for "हिंदी". */
  lang?: string
}

interface ChoiceGroupProps<V extends string> {
  legend: ReactNode
  hint?: ReactNode
  options: Choice<V>[]
  value: V | undefined
  onChange: (value: V) => void
  /** Lay options out in a row (e.g. Yes / No / Not sure on wide screens). */
  layout?: 'column' | 'row'
  /** Visually hide the legend when the page heading already asks the question. */
  hideLegend?: boolean
  name?: string
  /** Say what is missing and how to fix it. Linked to the group with aria-describedby. */
  error?: string
}

/** Big radio cards built on native radios: arrow keys, labels and screen readers just work. */
export function ChoiceGroup<V extends string>({
  legend,
  hint,
  options,
  value,
  onChange,
  layout = 'column',
  hideLegend,
  name,
  error,
}: ChoiceGroupProps<V>) {
  const autoName = useId()
  const hintId = useId()
  const errorId = useId()
  const groupName = name ?? autoName
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined
  return (
    <fieldset className={styles.fieldset} aria-describedby={describedBy}>
      <legend className={hideLegend ? 'visually-hidden' : styles.legend}>{legend}</legend>
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className={styles.error}>
          <CircleAlert aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
      <div className={[styles.options, layout === 'row' && styles.row].filter(Boolean).join(' ')}>
        {options.map((o) => (
          <label key={o.value} className={styles.option}>
            <input
              className={styles.input}
              type="radio"
              name={groupName}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
            />
            <span className={styles.radio} aria-hidden="true" />
            {o.icon && (
              <span className={styles.icon} aria-hidden="true">
                {o.icon}
              </span>
            )}
            <span className={styles.text} lang={o.lang}>
              <span className={styles.label}>{o.label}</span>
              {o.description && <span className={styles.description}>{o.description}</span>}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
